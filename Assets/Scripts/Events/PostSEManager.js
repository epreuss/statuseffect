#pragma strict

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
			return AttrNumberChangeType.ZERO;		
	}
}

private var eventsPostSE: List.<Function>[];

function Awake()
{
	var length = System.Enum.GetValues(typeof(UnitEventType)).Length;
	eventsPostSE = new List.<Function>[length];
	for (var i = 0; i < length; i++)
		eventsPostSE[i] = new List.<Function>();
}

function RegisterListener(callback: Function, type: UnitEventType)
{
	eventsPostSE[type].Add(callback);
}

function RemoveListener(callback: Function, type: UnitEventType)
{
	for (listener in eventsPostSE[type])
		if (listener == callback)
		{
			eventsPostSE[type].Remove(listener);
			break;
		}
}

function OnAttrNumberChange(data: AttrNumberChangeData) // Callback - Status Effects Manager.
{
	// Notify sender that his SE changed this gameObject status.
	if (gameObject != data.changer.sender)
	{
		var copy = new AttrNumberChangeData(data.changer, data.attrType, data.attrChange);
		copy.activator = AttrChangeActivator.OTHER;
		copy.changer.sender.SendMessage("OnAttrNumberChange", copy);
	}
	Debugger.instance.Log(gameObject, "Event trigger: " + data.changer.name + ", " + data.attrType.ToString() + ", " + data.attrChange + ", " + data.activator);			
	
	for (listener in eventsPostSE[UnitEventType.ATTRCHANGE])
		listener(data);
}
