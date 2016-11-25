#pragma strict

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