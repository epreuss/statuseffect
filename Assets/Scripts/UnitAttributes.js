#pragma strict

@script RequireComponent(Unit)
@script RequireComponent(StatusEffectsManager)

/*
- This class has primitive variables
for units to use in their routines.

- These primitives are the current value
of an AttrNumber or AttrBoolean, and
they are the only classes that can modify
the primitives values.

Unit examples: Player, Enemies, Bots.
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
	unit = GetComponent(Unit);
	for (n in numbers)
	{
		n.Reset();
		UpdatePrimitiveNumber(n);
	}
	for (b in booleans)
	{
		b.Reset();
		UpdatePrimitiveBoolean(b);
	}
}

private function GetAttrNumber(targetType: AttrNumberType): AttrNumber
{
	for (n in numbers)
		if (n.type == targetType)
			return n;
	return null;
}

private function GetAttrBoolean(targetType: AttrBooleanType): AttrBoolean
{
	for (b in booleans)
		if (b.type == targetType)
			return b;
	return null;
}

function RecalculateAttrNumber(type: AttrNumberType, effectsNumber: List.<EffectNumber>)
{
	var attr = GetAttrNumber(type);
	var hasTheTargetAttr = attr != null;
	if (!hasTheTargetAttr)
		return;
	
	var reapplyChangesNothing = attr.IsBaseValue() && effectsNumber.Count == 0;
	if (reapplyChangesNothing)
	 	return;

	// By now, effects are valid. Let's use them.
	
	for (effect in effectsNumber)
		UpdateIfAdvancedAttrNumber(effect);
		
	if (effectsNumber.Count > 0)
		attr.Recalculate(effectsNumber);
	else
		attr.Reset();
	
	UpdatePrimitiveNumber(attr);
}

function RecalculateAttrBoolean(type: AttrBooleanType, effectsBoolean: List.<EffectBoolean>)
{
	var attr = GetAttrBoolean(type);
	var hasTheTargetAttr = attr != null;
	if (!hasTheTargetAttr)
		return;

	var reapplyChangesNothing = attr.IsBaseValue() && effectsBoolean.Count == 0;
	if (reapplyChangesNothing)
	 	return;
	
	// By now, effects are valid. Let's use them.
	
	if (effectsBoolean.Count > 0)
		attr.Recalculate(effectsBoolean);
	else
		attr.Reset();
	
	UpdatePrimitiveBoolean(attr);
}

function ModifyNumberPermanently(effect: EffectNumber)
{
	var attr = GetAttrNumber(effect.targetAttr);
	if (attr == null)
		return;

	UpdateIfAdvancedAttrNumber(effect);
	
	attr.ModifyPermanently(effect);
}

private function UpdateIfAdvancedAttrNumber(effect: EffectNumber)
{
	if (effect.useAdvanced)				
		effect.otherAttrBase = GetAttrNumber(effect.baseValueOf).baseValue;		
}

private function UpdatePrimitiveNumber(attr: AttrNumber)
{
	switch (attr.type)
	{
		case HEALTH:
			health = attr.GetCurrentValue();
			break;
		case MOVESPEED:
			moveSpeed = attr.GetCurrentValue();
			break;
	}
}

private function UpdatePrimitiveBoolean(attr: AttrBoolean)
{
	switch (attr.type)
	{
		case STUN:	
			stun = attr.GetCurrentValue();		
			unit.OnStun(stun);		
			break;		
	}
}