#pragma strict

function Awake() 
{
	var id = 1;
	var effects = GetComponentsInChildren(Effect);
	for (var e: Effect in effects)
	{
		e.SetID(id);
		id++;
	}
}
