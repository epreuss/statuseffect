#pragma strict

/*
- This class manipulates a primitive in UnitAttributes, 
calculating its current value based on Effects Boolean.
*/

import AttrBooleanType;
enum AttrBooleanType { STUN };

class AttrBoolean
{
	var type: AttrBooleanType;
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


	function IsBaseValue()
	{
		return currentValue == baseValue;
	}

	function Recalculate(effects: List.<EffectBoolean>)
	{
		currentValue = baseValue;
		for (e in effects)
		{
			if (e.value == false)
			{
				currentValue = false;
				break;
			}
			else
				currentValue = e.value;
		}
		Debugger.instance.Log(type.ToString() + ", " + currentValue);
	}

}