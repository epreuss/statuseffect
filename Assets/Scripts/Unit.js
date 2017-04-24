#pragma strict

enum AttrNumberChangeType { INCREASE, DECREASE };

class AttrNumberChangeData
{
	var changer: StatusEffect;
	var attrType: AttrNumberType;
	var attrChange: Number;
	
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

enum UnitEventType { SERECEIVE };

var attrChangeListeners: List.<Function>;

function Awake()
{
	attrChangeListeners = new List.<Function>();
}

function RegisterListener(callback: Function)
{
	attrChangeListeners.Add(callback);
}

function RemoveListener(callback: Function)
{
	for (listener in attrChangeListeners)
		if (listener == callback)
		{
			attrChangeListeners.Remove(listener);
			break;
		}
}

function OnAttrNumberChange(data: AttrNumberChangeData)
{
	Debugger.instance.Log(data.changer.name + ": " + data.attrType.ToString() + ", " + data.attrChange);		
	for (listener in attrChangeListeners)
		listener(data);
}

function OnStun(active: boolean) 
{
	/*
	if (!attr.stun && active)
		OnStunEnter();
	else if (attr.stun && !active)
		OnStunExit();
	*/
}

function OnSEReceive(pack: SEPack)
{
	var SE = StatusEffectDatabase.instance.GetSE(pack.se);
	SE.SetLinkers(pack.sender, pack.receiver);	
	GetComponent(StatusEffectsManager).ReceiveStatusEffect(SE);
}

