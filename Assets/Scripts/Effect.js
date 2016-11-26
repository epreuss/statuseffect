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

function setID(id: int)
{
	this.id = id;
}

function getID()
{
	return id;
}