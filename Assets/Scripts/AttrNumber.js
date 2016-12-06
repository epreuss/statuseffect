#pragma strict

/*
- This class manipulates a primitive in UnitAttributes, 
calculating its current value based on Effects Number.
*/

import AttrNumberType;
enum AttrNumberType { HEALTH, MOVESPEED };

class AttrNumber
{
	var type: AttrNumberType;
	var baseValue: Number;
	var roofLimit: Number;
	var floorLimit: Number;
	var currentValue: Number;	

	private var reseted: boolean;
		
	function GetCurrentValue()
	{
		return currentValue;
	}

	function Reset()
	{
		reseted = true;
		currentValue = baseValue;
	}

	function IsBaseValue()
	{
		return reseted;
	}
	
	function ModifyPermanently(effect: EffectNumber)
	{
		reseted = false;
		if (effect.type == SUM)
			baseValue += effect.value;
		if (effect.type == MULTIPLY)
			baseValue *= effect.value;
	
		if (baseValue > roofLimit)
			baseValue = roofLimit;
		if (baseValue < floorLimit)
			baseValue = floorLimit;	
	}

	function Recalculate(effects: List.<EffectNumber>)
	{			
		reseted = false;
		var sumEffects = new List.<EffectNumber>();
		var multiplyEffects = new List.<EffectNumber>();
		for (var i = 0; i < effects.Count; i++)
		{
			if (effects[i].type == SUM)
				sumEffects.Add(effects[i]);
			else
				multiplyEffects.Add(effects[i]);
		}
		
		currentValue = baseValue;			
		
		for (effect in multiplyEffects)			
		{
			var stackedValue = 1.0;
			for (i = 0; i < effect.stacks; i++)
				stackedValue *= effect.value;
			
			currentValue *= stackedValue;
			if (effect.permanent)
				baseValue *= stackedValue;
		}	
		for (effect in sumEffects)	
		{
			currentValue += effect.value * effect.stacks;			
			if (effect.permanent)
				baseValue += effect.value;
		}	
		
		if (currentValue > roofLimit)
			currentValue = roofLimit;
		if (currentValue < floorLimit)
			currentValue = floorLimit;				
	}

}