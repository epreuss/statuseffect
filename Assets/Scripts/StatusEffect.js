#pragma strict

/*
This class defines WHEN an Effect will be applied (by the StatusEffectsManager).
Eg.: When starts, leaves or ticks over time.
*/

class StatusEffect extends Effect
{
	var effects: List.<Effect>;

	var icon: Sprite;
	
	@Header("Duration Options") 
	var instant: boolean;		
	var duration: float;
	var timerDuration: float;

	@Header("Tick-only")
	var totalTicks: int;
	var delayInSecs: float;
	private var timerTick: float;
	private var ticksDone: int;
	
	// Used by StatusEffectsManager.		
	@Header("Duplication Options") 
	var stackable: boolean;
	var independent: boolean;	

	/*	
	var stackIncrease: int;
	var currentStacks: int;
	var maxStacks: int;
	*/

	private var manager: StatusEffectsManager;	
	
	function Start()
	{
		if (totalTicks > 1)
			delayInSecs = duration/(totalTicks-1);		
		else
			delayInSecs = duration;
	}

	function OnEntry() 
	{		
		ApplyPermanentEffects(ENTRY);
		Tick();	
		if (instant)
			Expire();
	}

	function OnFrame() 
	{		
		timerDuration += Time.deltaTime;
		if (timerDuration > duration)
		{
			Expire();
			timerDuration = 0;
		}
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
		ApplyPermanentEffects(LEAVE);	
		Tick();
		RemoveFromManager();
	}

	function Stack() {}

	function Pop() {}
	
	function Tick()
	{		
		if (HasTickEffect())
		{
			ApplyPermanentEffects(TICK);	
			manager.ReapplyEffectsNumber(TICK);
			StackTickEffects();			
		}
	}

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
		for (e in effects)
		{
			var effectNumber = e as EffectNumber;
			if (effectNumber)
				list.Add(e);			
		}
		return list;
	}
	
	private function ApplyPermanentEffects(mode: ApplyMode)
	{
		if (mode == TICK)
			ticksDone++;
		var applied = false;
		for (e in effects)
			if (e.mode == mode)
			{				
				var EN = e as EffectNumber;	
				if (EN && EN.permanent)				
				{
					manager.GetUnitAttributes().ModifyPrimitivePermanently(EN);
					if (!applied)
						applied = true;					
				}			
			}
		if (applied)
			manager.ReapplyEffectsNumber(ENTRY);
	}
	
	private function HasTickEffect()
	{
		for (e in effects)
			if (e.mode == TICK)
				return true;
		return false;
	}
	
	private function StackTickEffects()
	{
		for (e in effects)
			if (e.mode == TICK)				
			{
				var EN = e as EffectNumber;
				if (EN)
					EN.StackValue();
			}
				
	}

	private function RemoveFromManager()
	{
		manager.RemoveStatusEffect(this);		
	}
}