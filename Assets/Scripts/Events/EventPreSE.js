#pragma strict

var attrType: AttrNumberType;
var changeType: AttrNumberChangeType;
var effectType: EffectNumberType;
var applyEffect: EffectNumberType;
var value: Number;
var ignoreEffectType: boolean;
var manager: PreSEManager;

function CanApply(EN: EffectNumber, applyEffect: EffectNumberType)
{
	var attrTypeIsEqual = attrType == EN.targetAttr;
	var changeTypeIsEqual = changeType == EN.GetChangeType();
	var effectTypeIsEqual = effectType == EN.type || ignoreEffectType;	
	var applyEffectIsEqual = this.applyEffect == applyEffect;
	return attrTypeIsEqual && changeTypeIsEqual && effectTypeIsEqual && applyEffectIsEqual;	
}

function Apply(EN: EffectNumber)
{
	Debugger.instance.Log(gameObject, "Applied PRE event on " + EN.gameObject.name);
	if (applyEffect == MULTIPLY)
		EN.value *= value;
	if (applyEffect == SUM)
		EN.value += value;	
}

function ConnectManager(manager: PreSEManager)
{	
	this.manager = manager;
	Debugger.instance.Log(manager + " has PRE event " + gameObject.name);
	manager.RegisterEvent(this);
}

function OnDestroy()
{
	if (manager)
		manager.RemoveEvent(this);	
}