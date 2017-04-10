﻿#pragma strict

/*
- Children: Status Effect, Effect Number and Effect Boolean.
- This class defines WHEN a effect should be applied.
By entering the manager (ENTRY), by ticking (TICK)
or when leaving a manager (LEAVE).
*/

import ApplyMode;
enum ApplyMode { ENTRY, TICK, LEAVE };

var mode: ApplyMode;

private var id: int;

function SetID(id: int)
{
	this.id = id;
}

function GetID()
{
	return id;
}