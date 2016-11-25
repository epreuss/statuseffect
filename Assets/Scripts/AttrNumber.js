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
		
	function GetCurrentValue()
	{
		return currentValue;
	}

	function Reset()
	{
		currentValue = baseValue;
	}
	
	function ModifyPermanently(effect: EffectNumber)
	{
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
		for (effect in sumEffects)	
		{
			currentValue += effect.value;
			if (effect.permanent)
				baseValue += effect.value;
		}				
		for (effect in multiplyEffects)			
		{
			currentValue *= effect.value;
			if (effect.permanent)
				baseValue *= effect.value;
		}

		if (currentValue > roofLimit)
			currentValue = roofLimit;
		if (currentValue < floorLimit)
			currentValue = floorLimit;		
	}

}