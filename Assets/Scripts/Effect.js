#pragma strict

/*
- Children: Status Effect, Effect Number and Effect Boolean.
- This class defines WHEN a effect should be applied.
By entering the manager (ENTER), by ticking (TICK)
or when leaving a manager (LEAVE).
*/

import ApplyMode;
enum ApplyMode { ENTRY, TICK, LEAVE };

var mode: ApplyMode;

private var id: int;
@Header("Valid is Read-only")
var valid: boolean;

function SetID(id: int)
{
	this.id = id;
}

function GetID()
{
	return id;
}

function Validate(valid: boolean)
{
	this.valid = valid;
}