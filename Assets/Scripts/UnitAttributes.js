#pragma strict

//@script RequireComponent(Unit)
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

/* 
These lists are public because we should modify it
as we want in the inspector.
They must not be modified via script!
To modify them, we use SEs.
*/
var numbers: List.<AttrNumber>;
var booleans: List.<AttrBoolean>;

@Header("Primitives")
var access: List.<Number>;
var stun: boolean;

// Events.
private var eventListeners: List.<Function>[];

function Awake()
{	
	var length = System.Enum.GetValues(typeof(UnitEventType)).Length;
	eventListeners = new List.<Function>[length];
	for (var i = 0; i < length; i++)
		eventListeners[i] = new List.<Function>();
	
	access = new List.<Number>();
	for (i = 0; i < System.Enum.GetValues(typeof(AttrNumberType)).Length; i++)
		access.Add(0);
	
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
	//GetComponent(Unit).OnAttrNumberChange(effect.GetComponent(StatusEffect), effect.targetAttr, effect.value);
}

private function UpdateIfAdvancedAttrNumber(effect: EffectNumber)
{
	if (effect.useOtherAttr)				
		effect.otherAttrBase = GetAttrNumber(effect.baseValueOf).baseValue;		
}

private function UpdatePrimitiveNumber(attr: AttrNumber)
{
	access[attr.type] = attr.GetCurrentValue();	
}

private function UpdatePrimitiveBoolean(attr: AttrBoolean)
{
	switch (attr.type)
	{
		case STUN:	
			stun = attr.GetCurrentValue();		
			break;		
	}	
}

// Events management.

enum UnitEventType { ATTRCHANGE, SKILLUSED };
enum AttrChangeActivator { SELF, OTHER };
enum AttrNumberChangeType { INCREASE, DECREASE };

class AttrNumberChangeData
{
	var changer: StatusEffect;
	var attrType: AttrNumberType;
	var attrChange: Number;
	var activator: AttrChangeActivator;
	
	function AttrNumberChangeData(changer: StatusEffect, attrType: AttrNumberType, attrChange: Number)
	{
		this.changer = changer;
		this.attrType = attrType;
		this.attrChange = attrChange;
	}
	
	function getChangeType(): AttrNumberChangeType
	{
		if (attrChange > 0)
			return AttrNumberChangeType.INCREASE;
		else if (attrChange < 0)
			return AttrNumberChangeType.DECREASE;
		else 
		{
			Debugger.instance.Log("AttrNumberChangeType is invalid.");
			return -1;
		}
	}
}

function RegisterListener(callback: Function, type: UnitEventType)
{
	eventListeners[type].Add(callback);
}

function RemoveListener(callback: Function, type: UnitEventType)
{
	for (listener in eventListeners[type])
		if (listener == callback)
		{
			eventListeners[type].Remove(listener);
			break;
		}
}

function OnAttrNumberChange(data: AttrNumberChangeData) // Callback - Status Effects Manager.
{
	//Debug.Log(gameObject.name + ", " + data.changer.sender + ": " + (gameObject != data.changer.sender));
	if (gameObject != data.changer.sender)
	{
		var copy = new AttrNumberChangeData(data.changer, data.attrType, data.attrChange);
		copy.activator = AttrChangeActivator.OTHER;
		copy.changer.sender.SendMessage("OnAttrNumberChange", copy);
	}
	Debugger.instance.Log(gameObject.name + ", " + data.changer.name + ": " + data.attrType.ToString() + ", " + data.attrChange + ", " + data.activator);			
	
	for (listener in eventListeners[UnitEventType.ATTRCHANGE])
		listener(data);
}

function OnSEReceive(pack: SEPack)
{
	var SE = StatusEffectDatabase.instance.GetSE(pack.se);
	SE.SetLinkers(pack.sender, pack.receiver);	
	GetComponent(StatusEffectsManager).ReceiveStatusEffect(SE);
	//pack.sender.SendMessage("OnSESent", pack);
}

function OnSESent(pack: SEPack)
{
	/*
	for (listener in eventListeners[UnitEventType.SESENT])
		listener();
	*/
}