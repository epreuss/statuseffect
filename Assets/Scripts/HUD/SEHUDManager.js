﻿#pragma strict

import UnityEngine.UI;

var targetSEManager: StatusEffectsManager;
var SEHUDPrefab: GameObject;

var SEHUDs: List.<SEHUD>;

function Start() 
{
	SEHUDs = new List.<SEHUD>();
	targetSEManager.RegisterListOperationsCallbacks(OnListAdd, OnListRemove, OnSEStack, OnSEPop);
}

function OnListAdd(newSE: StatusEffect)
{
	if (!newSE.IsInstant() && newSE.showHUD)
		SEHUDs.Add(InstantiateSEHUD(newSE));
}

function OnListRemove(deadSE: StatusEffect)
{
	for (var i = 0; i < SEHUDs.Count; i++)
	{
		if (SEHUDs[i].targetSE.IsEqual(deadSE))
		{			
			Destroy(SEHUDs[i].gameObject);
			SEHUDs.RemoveAt(i);			
			break;
		}
	}
}

function OnSEStack(stackedSEID: int)
{
	for (hud in SEHUDs)		
		if (hud.targetSE.GetID() == stackedSEID)
			hud.UpdateStack();	
}

function OnSEPop(poppedSEID: int)
{
	for (hud in SEHUDs)		
		if (hud.targetSE.GetID() == poppedSEID)
			hud.UpdateStack();	
}

function InstantiateSEHUD(targetSE: StatusEffect): SEHUD
{
	var prefab = Instantiate(SEHUDPrefab).GetComponent(SEHUD);
	prefab.transform.SetParent(transform, false);
	prefab.SetSE(targetSE);
	return prefab;
}