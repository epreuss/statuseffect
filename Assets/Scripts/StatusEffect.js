#pragma strict

/*
SE = Status Effect.
This is the main class of the Status Effect System.
It contains a list of Effects that can be applied to an UnitAttributes.
Also, it has time variables for its Effects, like duration and total ticks.

Notes:
This class can have a class of the same type in its list of Effects,
because the SE class has Effect as parent.
*/

enum StatusEffectDurationType { INSTANT, OVERTIME, PERMANENT };

class StatusEffect extends Effect
{
	var myEffects = new List.<Effect>();

	var durationType: StatusEffectDurationType;
	var icon: Sprite;
	var color: Color;
	
	// States.
	/*
	'isChild' must be checked as true if this SE 
	is inside of the Effects list of another SE.
	*/
	var isChild: boolean; 
	var showHUD: boolean;
	var canDestroy: boolean;
	
	// Duration.
	var duration: float;
	var timerDuration: float;
	private var expired: boolean;
	
	// Tick.
	var useTicks: boolean;
	@Range(3, 10) var totalTicks: int;
	@Range(0.1, 5) var delayInSecs: float;
	private var timerTick: float;
	private var ticksDone: int;
	
	// Stacking options.
	var refreshable: boolean;
	var stackable: boolean;	
	var stackIncrease: int;
	var currentStacks: int;
	var maxStacks: int;

	// Quick acess variables.
	private var permanentENs: List.<EffectNumber>;
	private var temporaryENs: List.<EffectNumber>;
	
	// Booleans.
	var hasPermanentENs: boolean;	
	var hasValidTemporaryENs: boolean;		
	var hasValidEBs: boolean;
	var hasValidSEs: boolean;
		

	// Associated manager.
	private var manager: StatusEffectsManager;	
	
	function Awake()
	{
		/*
		var SEs = GetStatusEffects();
		for (e in SEs)		
			e.Initialize();
		*/
		
		currentStacks = 1;
		canDestroy = !isChild;
		if (useTicks && !IsPermanent())
			CalculateTickDelay();		

		ValidateEffectsNumber();
		ValidateEffectsBoolean();
		ValidateStatusEffects();					
		InitializeLists();
		InitializeBooleans();		
	}

	private function InitializeLists()
	{
		permanentENs = GetPermanentEffectsNumber();
		temporaryENs = GetTemporaryEffectsNumber();		
	}
	
	private function InitializeBooleans()
	{
		hasPermanentENs = permanentENs.Count > 0;
		hasValidTemporaryENs = temporaryENs.Count > 0 && GetValidCountTemporaryEffectsNumber() > 0;				
		hasValidEBs = GetValidCountEffectsBoolean() > 0;	
		hasValidSEs = GetValidCountStatusEffects() > 0;	
	}
	
	private function ValidateEffectsNumber()
	{
		var ENs = GetEffectsNumber();
		for (e in ENs)		
		{
			e.Validate(true);
			if (e.mode == TICK && !useTicks)							
				e.Validate(false);															
			if (IsInstant() && !e.permanent)
				e.Validate(false);	
			if (IsPermanent() && e.mode == LEAVE)
				e.Validate(false);	
		}
	}
	
	private function ValidateEffectsBoolean()
	{
		var EBs = GetEffectsBoolean();
		for (e in EBs)		
		{
			e.Validate(true);
			if (IsInstant())		
				e.Validate(false);
			if (e.mode == TICK)		
				e.Validate(false);
			if (e.mode == LEAVE)		
				e.Validate(false);
		}
	}
	
	private function ValidateStatusEffects()
	{
		var SEs = GetStatusEffects();
		for (e in SEs)		
		{
			e.Validate(true);
			if (!e.hasValidTemporaryENs && !e.hasValidEBs)
				e.Validate(false);
		}
	}

	private function CalculateTickDelay()
	{
		// Minimum of 3 ticks (on Entry, one Tick in the middle of duration and on Leave).		
		if (totalTicks >= 3)
			delayInSecs = duration/(totalTicks-1);		
		else
			delayInSecs = duration;
	}
	
	var reappliedTemporaryEN;

	function OnEntry() 
	{		
		if (hasPermanentENs)
			ApplyPermanentEffectsNumber(ENTRY);
		if (hasValidSEs)
			SendStatusEffectsToManager(ENTRY);
		
		/*
		If we have ticks, it will reapply effects number.
		If we don't, we reapply in the 'else if' command.
		This is useful to prevent the manager from reapplying
		multiple times. It saves processing.
		Also, this makes reapplying calculations right.
		*/		
		if (hasValidTemporaryENs && !reappliedTemporaryEN)		 	
			manager.ReapplyTemporaryEffectsNumber();									
		if (hasValidEBs)	
			manager.ReapplyTemporaryEffectsBoolean();					
		if (useTicks)
			Tick();				
		
		if (IsInstant())
			Expire();				
	}

	function OnLeave() 
	{
		if (hasPermanentENs)
			ApplyPermanentEffectsNumber(LEAVE);	
		if (hasValidSEs)
			SendStatusEffectsToManager(LEAVE);
		if (useTicks)
			Tick();				
		
		RemoveFromManager();
	}
	
	// For OVERTIME and PERMANENT SE.
	function OnFrame() 
	{
		reappliedTemporaryEN = false;
		// Only OVERTIME may expire of duration.		
		if (IsOverTime() && !expired)
		{
			timerDuration += Time.deltaTime;
			if (timerDuration > duration)			
				Expire();							
		}
		// For OVERTIME and PERMANENT SE. Editor prevents INSTANT having ticks.		
		if (useTicks)
			if (ticksDone < totalTicks || IsPermanent())
			{
				timerTick += Time.deltaTime;
				if (timerTick > delayInSecs)
				{
					Tick();				
					timerTick = 0;				
				}
			}
	}

	// For OVERTIME and PERMANENT SE.
	function Tick()
	{		
		ticksDone++;		
		if (hasPermanentENs)
			ApplyPermanentEffectsNumber(TICK);	
		if (hasValidSEs)
			SendStatusEffectsToManager(TICK);	
		
		/*
		Reapplying temporary effects when all ticks are done 
		is useless, because a temporary effect will not last
		for a single frame in the last tick. 		
		*/
		if (hasValidTemporaryENs && (ticksDone < totalTicks || IsPermanent()) && !reappliedTemporaryEN)
		{
			manager.ReapplyTemporaryEffectsNumber();									
		}				
		IncreaseTemporaryTickEffectsNumber();	
	}

	// For OVERTIME and PERMANENT SE. Editor prevents INSTANT being stackable.
	function Stack() 
	{
		var oldStacks = currentStacks;
		currentStacks += stackIncrease;
		if (currentStacks > maxStacks)		
			currentStacks = maxStacks;
		
		var actuallyStacked = currentStacks - oldStacks > 0;
		if (actuallyStacked)
		{
			StackEffectsNumber();
			if (hasPermanentENs)
				ApplyPermanentEffectsNumber(ENTRY);				
			if (hasValidTemporaryENs)
			{
				manager.ReapplyTemporaryEffects();				
			}
		}
	}

	// For OVERTIME only. Editor prevents other durations from being refreshable.
	function Refresh() 
	{
		timerDuration = 0;			
		ticksDone = 0;
		timerTick = 0;
		OnEntry();		/*
		ResetTemporaryTickEffectsNumber();
		ResetTickVariables();
		Tick();
		*/
	}
	
	function Expire()
	{
		expired = true;
		OnLeave();
	}

	function Purge() 
	{
		RemoveFromManager();
	}
	
	function SetManager(manager: StatusEffectsManager)
	{
		this.manager = manager;
	}

	private function IsInList(target: AttrNumberType, types: List.<AttrNumberType>)
	{
		for (t in types)
			if (t == target)
				return true;
		return false;
	}
	
	private function ApplyPermanentEffectsNumber(mode: ApplyMode)
	{
		var permanentEffectsAdded = false;
		for (e in permanentENs)
			if (e.mode == mode)
			{				
				manager.GetUnitAttributes().ModifyNumberPermanently(e);
				if (!permanentEffectsAdded)
					permanentEffectsAdded = true;					
			}
		/*
		Explanation of why we need to reapply effects inside a 
		SE instead of only inside the manager:

		Eg.: MOVESPEED is 3. There is a debuff effect 
		multiplying it for 0.5, resulting in 1.5.
		Let's say we now apply a permanent debuff of flat 1.
		The result MOVESPEED would be 0.5! That's wrong.

		We should do: (3-1 = 2) -> done by 'UnitAttr.ModifyNumberPermanently'.
			This method will change the base value of the attribute.
		And (2 * 0.5 = 1) -> done by 'manager.ReapplyTemporaryEffects'.
			This method will change the current value of the attribute.
		Now our MOVEPEED is now 1 instead of 0.5.			
		*/
		if (permanentEffectsAdded)
		{
			Debugger.instance.Log(gameObject, "Perma EN! " + mode.ToString());	
			/*
			We reapply temporary effects even if this SE doesn't 
			own any, because the manager may have other SE that own 
			temporary effects.
			*/
			manager.ReapplyTemporaryEffectsNumber();	
			reappliedTemporaryEN = true;			
		}
		return permanentEffectsAdded;
	}
	
	/*
	private function TryReapplyENs()
	{
		
		The problem: 
		Reapplying effects when a SE is instant means double 
		reapplying, because when it leaves the manager, the 
		manager already reapplies effects too. 		
		To ensure that double reapplying won't happen, we check
		with a 'is not instant' condition.
		This helps the manager to reapply only one time,
		saving processing.
		
		if (hasValidTemporaryENs)
		{			
			manager.ReapplyTemporaryEffectsNumber();			
		}
	}
	*/

	private function SendStatusEffectsToManager(mode: ApplyMode)
	{
		var statusEffects = GetStatusEffects();
		for (se in statusEffects)
			if (se.mode == mode)
				manager.OnStatusEffectReceive(se);
	}
	
	private function IncreaseTemporaryTickEffectsNumber()
	{
		var ENs = GetEffectsNumber();
		for (e in ENs)
			if (e.mode == TICK && !e.permanent)			 				
				e.IncreaseValue();							
	}
	
	private function ResetTemporaryTickEffectsNumber()
	{
		var ENs = GetEffectsNumber();
		for (e in ENs)
			if (e.mode == TICK && !e.permanent)			 				
				e.Reset();					
	}	

	private function StackEffectsNumber(): boolean
	{
		var hadStack = false;
		var ENs = GetEffectsNumber();
		for (e in ENs)
		{
			if (e.mode == ENTRY)				
			{
				if (!e.permanent)									
					e.StackForTemporary();										
			}		
			else if (e.mode == TICK)
			{
				if (e.permanent)				
					e.IncreaseValue();					
				else				
					e.StackForTemporary();													
			}				
		}		
	}

	private function RemoveFromManager()
	{
		manager.RemoveStatusEffect(this);	
		FreeChildren();
	}

	private function FreeChildren()
	{
		var statusEffects = GetStatusEffects();
		for (se in statusEffects)
		{
			se.transform.SetParent(transform.parent);
			se.canDestroy = true;		
		}
	}

	function IsInstant()
	{
		return durationType == StatusEffectDurationType.INSTANT;
	}
	
	function IsPermanent()
	{
		return durationType == StatusEffectDurationType.PERMANENT;
	}
	
	function IsOverTime()
	{
		return durationType == StatusEffectDurationType.OVERTIME;
	}

	function IsEqual(otherSE: StatusEffect)
	{
		return GetID() == otherSE.GetID() && GetInstanceID() == otherSE.GetInstanceID();
	}

	/*
	Destroy policy:
	When this SE is removed from the manager, this callback is called. 
	We only destroy the SE if it has no children in transform. 
	Check 'FreeChildren' method.
	*/
	function OnRemoveFromManager() // Callback by the manager.
	{
		if (canDestroy)		
			Destroy(gameObject);		
	}
	
	// Getters.
	
	function GetEffectsNumber(): List.<EffectNumber>
	{
		var list = new List.<EffectNumber>();
		for (e in myEffects)
		{
			var effectNumber = e as EffectNumber;
			if (effectNumber)
				list.Add(e);			
		}
		return list;
	}

	function GetEffectsBoolean(): List.<EffectBoolean>
	{
		var list = new List.<EffectBoolean>();
		for (e in myEffects)
		{
			var effectBoolean = e as EffectBoolean;
			if (effectBoolean)
				list.Add(e);			
		}
		return list;
	}

	function GetStatusEffects(): List.<StatusEffect>
	{
		var list = new List.<StatusEffect>();
		for (e in myEffects)
		{
			var statusEffect = e as StatusEffect;
			if (statusEffect)
				list.Add(e);			
		}
		return list;
	}

	function GetUniqueAttrsNumberType(): List.<AttrNumberType>
	{
		var types = new List.<AttrNumberType>();
		var ENs = GetEffectsNumber();
		for (e in ENs)
			if (!IsInList(e.targetAttr, types))
				types.Add(e.targetAttr);
		return types;
	}

	function GetPermanentEffectsNumber(): List.<EffectNumber>
	{
		var list = new List.<EffectNumber>();
		var ENs = GetEffectsNumber();
		for (e in ENs)
			if (e.permanent)
				list.Add(e);
		return list;
	}
	
	function GetTemporaryEffectsNumber(): List.<EffectNumber>
	{
		var list = new List.<EffectNumber>();
		var ENs = GetEffectsNumber();
		for (e in ENs)
			if (!e.permanent)
				list.Add(e);
		return list;
	}
	
	private function GetValidCountTemporaryEffectsNumber(): int
	{
		var valids = 0;
		var ENs = GetEffectsNumber();
		for (e in ENs)
			if (e.valid && !e.permanent)							
				valids++;					
		return valids; 						
	}
	
	private function GetValidCountEffectsBoolean(): int
	{
		var valids = 0;
		var EBs = GetEffectsBoolean();
		for (e in EBs)
			if (e.valid)							
				valids++;					
		return valids; 						
	}
	
	private function GetValidCountStatusEffects(): int
	{
		var valids = 0;
		var SEs = GetStatusEffects();
		for (e in SEs)
			if (e.valid)							
				valids++;					
		return valids; 						
	}
}