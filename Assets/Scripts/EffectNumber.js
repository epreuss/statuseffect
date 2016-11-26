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
	var permanent: boolean;
	
	private var baseValue: Number;	
	
	function Start()
	{
		baseValue = value;
	}
	
	/*
	This is used by TICK type non-permanent Effect Numbers,
	so they can stack their value to increase tick value.
	Eg.: Slow over time. Starts at 0.8, goes to 0.64 
	in the next tick, then 0.512...
	*/
	function StackValue()
	{
		if (type == MULTIPLY)		
			value *= baseValue;
	}
	
	function ToString()
	{
		return gameObject.name;
	}
}