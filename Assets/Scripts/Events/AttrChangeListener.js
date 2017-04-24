#pragma strict

class EventAttrNumberChange
{
	var attrType: AttrNumberType;
	var changeType: AttrNumberChangeType;
}

enum EventSETarget { SENDER, RECEIVER };

var eventsAttrNumbers: List.<EventAttrNumberChange>;
var SEToSend: String;
var target: EventSETarget;
var unit: Unit;

function Start()
{	
	unit.RegisterListener(OnUnitAttrChange);
}

function OnUnitAttrChange(data: AttrNumberChangeData)
{
	var attrTypeIsEqual: boolean;
	var changeTypeIsEqual: boolean;
	
	for (event in eventsAttrNumbers)
	{
		attrTypeIsEqual = event.attrType == data.attrType;
		changeTypeIsEqual = event.changeType == data.getChangeType();
		if (attrTypeIsEqual && changeTypeIsEqual)
		{
			// Found a valid event.
			SendSEToTarget(data);			
		}
	}
}

/*
There are 2 cases for sending an SE:
1 - When the SE that triggered this event IS expired:
If we send the SAME SE immediatly (same frame), they are treated as duplication
inside the Status Effects Manager;
We follow a rule that we must not duplicate an SE in an event situation;
To fix this, we wait in a loop-yield until the SE is removed...
Then we can send the new SE.

2 - When the SE that triggered this event is NOT expired:
This means we can send the SE instantly.
*/
private function SendSEToTarget(data: AttrNumberChangeData): IEnumerator
{	
	// Saves linkers to use even if the data SE is null.
	var sender = data.changer.sender;
	var receiver = data.changer.receiver;
	if (data.changer.expired)
		while (data.changer != null)	
			yield;	
	
	Debugger.instance.Log("Event sending " + SEToSend + " to " + target);	
	
	var pack: SEPack;
	if (target == EventSETarget.SENDER)
	{
		// Receiver targets sender.
		pack = new SEPack(receiver, sender, SEToSend);
		sender.SendMessage("OnSEReceive", pack);
	}
	else if (target == EventSETarget.RECEIVER)
	{
		// Receiver targets itself.
		pack = new SEPack(receiver, receiver, SEToSend);
		receiver.SendMessage("OnSEReceive", pack);
	}
}