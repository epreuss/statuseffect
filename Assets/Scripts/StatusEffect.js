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
	var startWithTick: boolean;
	var independent: boolean;
	
	// Duration.
	var duration: float;
	var timerDuration: float;
	private var expired: boolean;
	
	// Tick.
	var useTicks: boolean;
	@Range(3, 20) var totalTicks: int;
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
	var hasPermanentENs: boolean;	
	var hasSEChildren: boolean;

	// Associated manager.
	private var manager: StatusEffectsManager;	
	
	function Awake()
	{
		currentStacks = 1;
		canDestroy = !isChild;
		if (useTicks && !IsPermanent())
			CalculateTickDelay();		
		if (!startWithTick)
			totalTicks -= 1;
					
		InitializeListsAndBooleans();		
	}

	private function InitializeListsAndBooleans()
	{
		permanentENs = GetPermanentEffectsNumber();		
		hasPermanentENs = permanentENs.Count > 0;		
		hasSEChildren = GetStatusEffects().Count > 0;
	}

	private function CalculateTickDelay()
	{
		// Minimum of 3 ticks (on Entry, one Tick in the middle of duration and on Leave).		
		if (totalTicks >= 3)
			delayInSecs = duration/(totalTicks-1);		
		else
			delayInSecs = duration;
	}

	function OnEntry() 
	{		
		if (hasPermanentENs)
			ApplyPermanentEffectsNumber(ENTRY);
		if (hasSEChildren)
			SendStatusEffectsToManager(ENTRY);			
		if (startWithTick && useTicks)
			Tick();		
		else
			manager.ReapplyTemporaryEffects();	
			
		if (IsInstant())
			Expire();				
	}

	function OnLeave() 
	{
		if (hasPermanentENs)
			ApplyPermanentEffectsNumber(LEAVE);	
		if (hasSEChildren)
			SendStatusEffectsToManager(LEAVE);
		if (useTicks)
			Tick();				
		
		RemoveFromManager();
	}
	
	// For OVERTIME and PERMANENT SE.
	function OnFrame() 
	{
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
		if (hasSEChildren)
			SendStatusEffectsToManager(TICK);	
		
		/*
		Reapplying temporary effects when all ticks are done 
		is useless, because a temporary effect will not last
		for a single frame in the last tick. 		
		*/		
		if (ticksDone > 1)
			IncreaseTemporaryTickEffectsNumber();	
		if (ticksDone < totalTicks || IsPermanent())		
			manager.ReapplyTemporaryEffects();														
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
			ReStackEffectsNumber();
			if (hasPermanentENs)
				ApplyPermanentEffectsNumber(ENTRY);							
			manager.ReapplyTemporaryEffects();							
		}
	}
	
	// For OVERTIME and PERMANENT only.
	function Pop()
	{
		currentStacks -= 1;
		if (currentStacks == 0)		
			Purge();
		else
		{
			ReStackEffectsNumber();
			manager.ReapplyTemporaryEffects();							
		}
	}

	// For OVERTIME only. Editor prevents other durations from being refreshable.
	function Refresh() 
	{
		timerDuration = 0;			
		ticksDone = 0;
		timerTick = 0;
		OnEntry();		
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
		for (e in permanentENs)
			if (e.mode == mode)			
			{
				manager.GetUnitAttributes().ModifyNumberPermanently(e);							
				if (e.mode == TICK && e.useGraduate)
					e.Graduate(ticksDone, totalTicks);
			}
		manager.ReapplyTemporaryEffects();
		
		/*
		Explanation of why we need to reapply effects inside a 
		SE instead of only inside the manager:

		Eg.: MOVESPEED is 3. There is a debuff effect 
		multiplying it for 0.5, resulting in 1.5.
		Let's say we now apply a permanent debuff of flat 1.
		The result MOVESPEED would be 0.5. That's wrong!		

		We should do: (3-1 = 2) -> done by 'UnitAttr.ModifyNumberPermanently'.
			This method will change the base value of the attribute.
		And (2 * 0.5 = 1) -> done by 'manager.ReapplyTemporaryEffects'.
			This method will change the current value of the attribute.
		Now our MOVEPEED is now 1 instead of 0.5.			
		*/		
	}

	private function SendStatusEffectsToManager(mode: ApplyMode)
	{
		var statusEffects = GetStatusEffects();
		for (se in statusEffects)
			if (se.mode == mode)
				manager.ReceiveStatusEffect(se);
	}
	
	private function IncreaseTemporaryTickEffectsNumber()
	{
		var ENs = GetEffectsNumber();
		for (e in ENs)
			if (e.mode == TICK && !e.permanent)			 				
			{
				if (e.useGraduate)
				{
					e.Graduate(ticksDone, totalTicks);
					
				}
				else
					e.IncreaseValue();							
			}
	}
		
	/* 
	For each function call, we re-stack every effect
	and recalculate all stacks and increased values.
	*/
	// Bug: If stack is popped, temporaries ticks bugs values.
	private function ReStackEffectsNumber(): boolean
	{
		var ENs = GetEffectsNumber();
		for (e in ENs)
		{
			var isTickTemporary = e.mode == TICK && !e.permanent;
			if (isTickTemporary)
			{
				/*
				This is a special case because temporary TICK effects
				have their value increased by each tick 
				(see function IncreaseTemporaryTickEffectsNumber).
				We must not reset the increased value when re-stacking!
				That said, we keep the increased value and
				reset only the stacks.
				*/
				e.ResetStacks(); 
			}				
			else
				e.FullReset();
			
			for (var i = 0; i < currentStacks-1; i++)
			{
				if (e.mode == ENTRY)				
				{
					e.StackForTemporary();										
				}	
				else if (e.mode == LEAVE)
				{
					e.IncreaseValue();
					/* 
					We don't stack temporary LEAVE because that 
					makes no sense. They must be always permanent.
					*/
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
		else
		{
			/*
			Reset variables because this SE was just used and will be used again. 
			This SE is a child. Eg.: Enigma's Q.
			*/
			timerDuration = 0;			
			ticksDone = 0;
			timerTick = 0;
			expired = false;
		}
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
	
	function GetValidEffectsNumberForReapply()
	{
		var list = new List.<EffectNumber>();
		var ENs = GetEffectsNumber();
		for (e in ENs)
		{
			if (e.permanent)
				continue;			
			if (e.mode == ENTRY)
				list.Add(e);
			if (useTicks && e.mode == TICK)
				list.Add(e);						
		}
		return list;
	}
}