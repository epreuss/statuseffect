#pragma strict

private var preManager: PreSEManager;
private var postManager: PostSEManager;
private var SEmanager: StatusEffectsManager;

enum UnitEventType { ATTRCHANGE, SKILLUSED };
enum AttrChangeActivator { SELF, OTHER };

function Awake()
{
	preManager = GetComponent(PreSEManager);
	postManager = GetComponent(PostSEManager);
	SEmanager = GetComponent(StatusEffectsManager);
}

function OnSEReceive(pack: SEPack) // Message - SE Actuators.
{
	var SE = StatusEffectDatabase.instance.GetSE(pack.se);
	SE.SetLinkers(pack.sender, pack.receiver);		
	ConnectPreEvents(SE);
	ConnectPostEvents(SE);
	preManager.Inspect(SE);
	SEmanager.ReceiveStatusEffect(SE);	
}

function ConnectPreEvents(SE: StatusEffect)
{
	var taxers = SE.GetComponents(EventPreSE);
	for (var t: EventPreSE in taxers)
		t.ConnectManager(preManager);
}

function ConnectPostEvents(SE: StatusEffect)
{
	var listeners = SE.GetComponents(EventPostSE);
	for (var l: EventPostSE in listeners)
		l.ConnectManager(postManager);
}