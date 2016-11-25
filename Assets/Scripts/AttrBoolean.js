#pragma strict

/*
- This class manipulates a primitive in UnitAttributes, 
calculating its current value based on Effects Boolean.
*/

import AttrBoolType;
enum AttrBoolType { STUN };

var type: AttrBoolType;
var baseValue: boolean;
var currentValue: boolean;

function Recalculate(effectsBoolean: List.<EffectBoolean>)
{
	
}