#pragma strict

/*
- This class defines HOW a number variable will be modified. 
Eg.: By SUM or MULTIPLY.
- This class has no operations on its variables.
- Other classes use this class variables.
Eg.: AttrNumber.

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
	
	@Header("Advanced") 
	
	// Other attr.
	var useOtherAttr: boolean;	
	var baseValueOf: AttrNumberType;
	
	// Graduate.
	var useGraduate: boolean;
	var graduateTo: Number;	
	
	private var baseValue: Number;	
	@HideInInspector var stacks: int;
	@HideInInspector var otherAttrBase: Number;
	
	function Awake()
	{
		stacks = 1;
		baseValue = value;
	}
	
	function FullReset()
	{
		stacks = 1;
		value = baseValue;		
	}
	
	function ResetStacks()
	{
		stacks = 1;
	}
	
	function IsAdvanced()
	{
		return useOtherAttr || useGraduate;
	}	
	
	function GetChangeType(): AttrNumberChangeType
	{
		if (value > 0)
			return AttrNumberChangeType.INCREASE;
		else if (value < 0)
			return AttrNumberChangeType.DECREASE;
		else 
			return AttrNumberChangeType.ZERO;		
	}
	
	/*
	About stacking and increasing value:
	
	These two concepts are different.
	Stacking is only used by temporary effects.
	Why? Because permanent effects are 'already applied'.
	If we stack them, they would be applied multiple times.
	
	Increase value is mainly used by TICK temporary.
	Why? Because they would apply always the same value
	for each tick. We need to increase the value!
	*/
		
	/*
	Effect example: Slow over time by MULTIPLY. 
	Starts at 0.8, goes to 0.64 in the next tick, then 0.51...
	Resulting MOVESPEED with base value of 3: 2.4, 1.92, 1.53.
	
	If we don't increase value, we would multiply 3 by 0.8
	for every tick and the result would be 2.4 for the
	entire effect duration.
	*/
	function IncreaseValue()
	{
		if (type == SUM)		
			value += baseValue;
		if (type == MULTIPLY)	
			value *= baseValue;
	}
	
	function Graduate(ticksDone: int, totalTicks: int)
	{
		var difference = graduateTo - baseValue;
		//var progress = ticksDone / totalTicks;
		var step = difference / (totalTicks-1);
				
		value += step;		
	}

	/*
	This is only used by stackable Status Effects.	
	*/
	function StackForTemporary()
	{
		if (!permanent)
			stacks++;
	}
		
	function ToString()
	{
		return gameObject.name;
	}
}