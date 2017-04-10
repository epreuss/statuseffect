#pragma strict

/*
To create a database, create an empty Game Object and
attach this script to it. Then, create Status Effects
and move them to this database's transform. They will
be children of the database.
*/

var SEs: List.<StatusEffect>;
@HideInInspector static var instance: StatusEffectDatabase;

function Awake()
{
	instance = this;
	sendIDToStatusEffects();
}

function Start() 
{
	SEs = new List.<StatusEffect>();
	var children = GetComponentsInChildren(StatusEffect);
	for (var se: StatusEffect in children)
		if (!se.isChild)
			SEs.Add(se);
}

function sendIDToStatusEffects()
{
	var id = 1;
	var effects = GetComponentsInChildren(Effect);
	for (var e: Effect in effects)
	{
		e.SetID(id);
		id++;
	}
}

function GetSE(targetName: String)
{
	for (var i = 0; i < SEs.Count; i++)	
		if (SEs[i].gameObject.name == targetName)
		{
			var SE = InstantiateSE(i);
			return SE;	
		}
}

function GetSEID(targetName: String)
{
	for (var i = 0; i < SEs.Count; i++)	
		if (SEs[i].gameObject.name == targetName)		
			return SEs[i].GetID();				
}

private function InstantiateSE(index: int)
{
	var prefab = Instantiate(SEs[index]);
	prefab.GetComponent(StatusEffect).SetID(SEs[index].GetID());
	return prefab;
}