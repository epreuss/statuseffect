#pragma strict

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

