#pragma strict

/*
Every Effect must be in this database.
This database creates an ID for every effect.
*/

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
