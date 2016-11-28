#pragma strict

var SEs: List.<StatusEffect>;
@HideInInspector static var instance: StatusEffectDatabase;

function Awake()
{
	instance = this;
}

function Start() 
{
	SEs = new List.<StatusEffect>();
	var children = GetComponentsInChildren(StatusEffect);
	for (var se: StatusEffect in children)
		if (!se.isChild)
			SEs.Add(se);
}

function GetSE(targetName: String)
{
	for (var i = 0; i < SEs.Count; i++)	
		if (SEs[i].gameObject.name == targetName)
		{
			var SE = InstantiateSE(i);
			//SE.Initialize();
			return SE;	
		}
}

private function InstantiateSE(index: int)
{
	var prefab = Instantiate(SEs[index]);
	prefab.GetComponent(StatusEffect).SetID(SEs[index].GetID());
	return prefab;
}