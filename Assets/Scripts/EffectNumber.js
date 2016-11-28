#pragma strict

/*
- This class defines HOW a number variable will be modified. 
By SUM or MULTIPLY.
- This class has no operations on its variables.
- Other classes use this class variables.

Important!
- LEAVE effects MUST be permanent.
If they were temporary, they wouldn't affect the target 
variable at all, because a temporary effect expires when
they leave a Status Effect Manager.
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
	@HideInInspector var stacks: int;
	
	function Awake()
	{
		stacks = 1;
		baseValue = value;
	}
	
	function StackForTemporary()
	{
		if (!permanent)
			stacks++;
	}
	
	function Reset()
	{
		value = baseValue;
	}
	
	/*
	If we don't stack TICK Effects Number, they would
	always apply the same value to the target Unit.
	That is why we stack the value.

	Eg.: Slow over time by MULTIPLY. 
	Starts at 0.8, goes to 0.64 in the next tick, then 0.51...
	Resulting MOVESPEED with base value of 3: 2.4, 1.92, 1.53.

	Note: Only TICK non-permanent Effects Number should
	be stacked. This condition is checked in the Status Effect.
	*/
	function IncreaseValue()
	{
		if (type == SUM)		
			value += baseValue;
		if (type == MULTIPLY)	
			value *= baseValue;
	}
	
	function ToString()
	{
		return gameObject.name;
	}
}