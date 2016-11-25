#pragma strict

/*
- This class effect is applied by a StatusEffectsManager.
- This class defines HOW a number variable will be modified.
Eg.: By adding or multiplying the number.
- Other classes operate using this class variables.
- This class has no operations.
*/

import EffectNumberType;
enum EffectNumberType { SUM, MULTIPLY };

class EffectNumber extends Effect
{
	var type: EffectNumberType;
	var targetAttr: AttrNumberType;
	var value: Number;
	
	private var baseValue: Number;
	
	// Used by StatusEffect and StatusEffectsManager.
	var permanent: boolean;
	
	function Start()
	{
		baseValue = value;
	}
	
	function StackValue()
	{
		if (type == SUM)
			value += baseValue;
		else
			value *= baseValue;
	}
	
	function ToString()
	{
		return gameObject.name;
	}
}