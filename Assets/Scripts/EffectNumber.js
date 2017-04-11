﻿#pragma strict

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
	
	@Header("Advanced")
	var useAdvanced: boolean;
	var baseValueOf: AttrNumberType;
	
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