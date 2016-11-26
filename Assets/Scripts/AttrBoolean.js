#pragma strict

/*
- This class manipulates a primitive in UnitAttributes, 
calculating its current value based on Effects Boolean.
*/

import AttrBoolType;
enum AttrBoolType { STUN };

class AttrBoolean
{
	var type: AttrBoolType;
	var baseValue: boolean;
	var currentValue: boolean;

	function GetCurrentValue()
	{
		return currentValue;
	}

	function Reset()
	{
		currentValue = baseValue;
	}

	function Recalculate(effects: List.<EffectBoolean>)
	{
		
	}

}