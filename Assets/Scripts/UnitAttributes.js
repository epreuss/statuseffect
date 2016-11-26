#pragma strict

@script RequireComponent(StatusEffectsManager)

/*
- This class has primitive variables
for units to use in their routines.

- These primitives are the current value
of an AttrNumber or AttrBoolean, and
these are the only classes that can modify
the primitives values.

Unit examples: Player, enemy, bots.
*/

var numbers: List.<AttrNumber>;
var booleans: List.<AttrBoolean>;

@Header("Primitives")
var health: Number;
var moveSpeed: Number;
var stun: boolean;

private var unit: Unit;

function Start()
{
	for (n in numbers)
	{
		n.Reset();
		UpdatePrimitive(n);
	}
}

private function GetAttrNumber(targetType: AttrNumberType): AttrNumber
{
	for (n in numbers)
		if (n.type == targetType)
			return n;
	return null;
}

function RecalculateAttrNumber(type: AttrNumberType, effectsNumber: List.<EffectNumber>)
{
	var attr = GetAttrNumber(type);
	var hasTheTargetAttr = attr != null;
	if (!hasTheTargetAttr)
		return;
	
	if (effectsNumber.Count > 0)
		attr.Recalculate(effectsNumber);
	else
		attr.Reset();
	
	UpdatePrimitive(attr);
}

function ModifyPrimitivePermanently(effect: EffectNumber)
{
	var attr = GetAttrNumber(effect.targetAttr);
	if (attr == null)
		return;
		
	attr.ModifyPermanently(effect);
}

function UpdatePrimitive(attr: AttrNumber)
{
	switch (attr.type)
	{
		case HEALTH:
			health = attr.GetCurrentValue();
		case MOVESPEED:
			moveSpeed = attr.GetCurrentValue();
	}
}

function UpdatePrimitive(attr: AttrBoolean)
{
	switch (attr.type)
	{
		case STUN:		
			stun = attr.GetCurrentValue();		
			unit.OnStun(stun);		
	}
}