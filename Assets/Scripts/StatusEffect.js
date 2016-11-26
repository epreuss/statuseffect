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

enum StatusEffectDurationType { INSTANT, TIME };

class StatusEffect extends Effect
{
	var myEffects: List.<Effect>;

	var durationType: StatusEffectDurationType;
	var icon: Sprite;
	
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
	private var timerDuration: float;

	// Tick.
	var useTicks: boolean;
	@Range(3, 10) var totalTicks: int;
	private var delayInSecs: float;
	private var timerTick: float;
	private var ticksDone: int;
	
	// Stacking.
	var stackable: boolean;
	var independent: boolean;	

	/*	
	var stackIncrease: int;
	var currentStacks: int;
	var maxStacks: int;
	*/

	// Quick acess variables.
	private var permanentENs: List.<EffectNumber>;
	private var hasPermanentENs: boolean;
	private var hasSEChildren: boolean;

	// Associated manager.
	private var manager: StatusEffectsManager;	
	
	function Start()
	{
		canDestroy = !isChild;
		if (useTicks)
			calculateTickDelay();		

		InitializeQuickAccessVariables();
	}

	private function InitializeQuickAccessVariables()
	{
		permanentENs = GetPermanentEffectsNumber();
		hasPermanentENs = permanentENs.Count > 0;
		hasSEChildren = GetStatusEffects().Count > 0;
	}

	private function calculateTickDelay()
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
		if (IsInstant())
			Expire();
		if (useTicks)
			Tick();				
	}

	function OnFrame() 
	{		
		timerDuration += Time.deltaTime;
		if (timerDuration > duration)
		{
			Expire();
			timerDuration = 0;
		}
		if (useTicks)
			if (ticksDone < totalTicks)
			{
				timerTick += Time.deltaTime;
				if (timerTick > delayInSecs)
				{
					Tick();				
					timerTick = 0;				
				}
			}
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

	function Tick()
	{		
		ticksDone++;		
		if (hasPermanentENs)
			ApplyPermanentEffectsNumber(TICK);	
		if (hasSEChildren)
			SendStatusEffectsToManager(TICK);		
		manager.ReapplyTemporaryEffects();	
		StackTickEffects();		
	}

	function Stack() {}

	function RefreshDuration() 
	{
		timerDuration = 0;		
	}
	
	function Expire()
	{
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

	private function IsInList(target: AttrNumberType, types: List.<AttrNumberType>)
	{
		for (t in types)
			if (t == target)
				return true;
		return false;
	}
	
	private function ApplyPermanentEffectsNumber(mode: ApplyMode)
	{
		var effectsWereModified = false;
		for (e in permanentENs)
			if (e.mode == mode)
			{				
				manager.GetUnitAttributes().ModifyNumberPermanently(e);
				if (!effectsWereModified)
					effectsWereModified = true;					
			}
		/*
		Explanation of why we need to reapply effects inside a 
		Status Number instead of only the manager:

		Eg.: MOVESPEED is 3. There is a debuff effect 
		multiplying it for 0.5, resulting in 1.5.
		Let's say we now apply a permanent debuff of flat 1.
		The result MOVESPEED would be 0.5! That's wrong.

		We should do: (3-1 = 2) -> done by 'UnitAttr.ModifyNumberPermanently'.
			This method will change the base value of the attribute.
		And (2 * 0.5 = 1) -> done by 'manager.ReapplyTemporaryEffects'.
			This method will change the current value of the attribute.
		Now our MOVEPEED is now 1 instead of 0.5.

		A problem: Reapplying effects when this SE is instant
		means double reapplying, because when it leaves the manager, 
		the manager will reapply effects too. 
		To ensure that double reapplying won't happen, we check
		with a 'is not instant' condition.
		*/
		if (effectsWereModified && !IsInstant())
		{
			Debugger.instance.Log(gameObject, "Reapply - Perma EN");			
			manager.ReapplyTemporaryEffects();
		}
	}

	private function SendStatusEffectsToManager(mode: ApplyMode)
	{
		var statusEffects = GetStatusEffects();
		for (se in statusEffects)
			if (se.mode == mode)
				manager.OnStatusEffectReceive(se);
	}

	private function StackTickEffects()
	{
		for (e in myEffects)
			if (e.mode == TICK)				
			{
				var EN = e as EffectNumber;
				if (EN && !EN.permanent)
					EN.StackValue();				
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

	private function IsInstant()
	{
		return durationType == StatusEffectDurationType.INSTANT;
	}

	/*
	Destroy policy:
	When this SE is removed from the manager, this callback is called. 
	We only destroy the SE if it has no children in transform. 
	Check'FreeChildren' method.
	Also, we don't destroy a non-instant SEs because they can be reused. 
	Useful to reduce prefab instantiations for SEs.
	*/
	function OnRemoveFromManager() // Callback by the manager.
	{
		if (canDestroy && !IsInstant())		
			Destroy(gameObject);		
	}
}