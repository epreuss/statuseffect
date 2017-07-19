#pragma strict

enum EventSETarget { SENDER, RECEIVER };

var activator: AttrChangeActivator;
var attrType: AttrNumberType;
var changeType: AttrNumberChangeType;
var target: EventSETarget;
var SEToSend: String;
var manager: PostSEManager;
var useStart: boolean;

function Start()
{
	if (!useStart)
		return;
	ConnectManager(manager);
}

function ConnectManager(manager: PostSEManager)
{	
	this.manager = manager;
	Debug.Log(manager + " has POST event " + gameObject.name);
	manager.RegisterListener(OnUnitAttrChange, UnitEventType.ATTRCHANGE);
}

function OnUnitAttrChange(data: AttrNumberChangeData) // Callback - PostSEManager.
{
	var attrTypeIsEqual = attrType == data.attrType;
	var changeTypeIsEqual = changeType == data.getChangeType();
	var activatorIsEqual = activator == data.activator;	
	if (attrTypeIsEqual && changeTypeIsEqual && activatorIsEqual)
	{
		// Found a valid event.
		SendSEToTarget(data);			
	}	
}

/*
There are 2 cases for sending an SE:
1 - When the SE that triggered this event EXPIRED:
If we send the SAME SE immediately (same frame), they are treated as duplication
inside the Status Effects Manager;
We follow a rule that we must not duplicate an SE in an event situation;
To fix this, we wait in a loop-yield until the SE is removed...
Then we can send the new SE.

2 - When the SE that triggered this event did NOT expire:
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
	
	Debugger.instance.Log(gameObject, "Event sending " + SEToSend + " to " + target);	
	
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

function OnDestroy()
{
	if (manager)
		manager.RemoveListener(OnUnitAttrChange, UnitEventType.ATTRCHANGE);	
}