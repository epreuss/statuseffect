#pragma strict

@script RequireComponent(UnitAttributes)

import System.Collections.Generic;

/*
Every unit must have an EffectsManager if it wants
to use Effects in the primitive variables of UnitAttributes.

This manager will receive Status Effects, which are 
made of one or more Effects. Each Effect inside a Status Effect
is used to recalculate non-permanent buffs and debuffs.

Eg.: We have 3 SE, each one giving 1, 2 and 3 bonus armor.
When we add a new SE that envolves armor, the manager
finds every Effect related to armor in his SE list and 
uses them to ask UnitAttributes to recalculate the total armor.
*/

var statusEffects: List.<StatusEffect>;
private var unitAttr: UnitAttributes;

private var lock: boolean;

function Start()
{
	unitAttr = GetComponent(UnitAttributes);
}

function Update()
{
	if (!lock)
	{
		lock = true;
		for (SE in statusEffects)					
			SE.OnFrame();					
		lock = false;
	}
}

/*
Other units call this method to send
statusEffects to the unit associated to this manager.
*/
function OnStatusEffectReceive(newSE: StatusEffect) 
{
	var SE = HasStatusEffectByID(newSE.getID());
	if (SE != null) // Already has the SE.
	{
		if (SE.stackable)
			SE.Stack();
		else if (SE.independent)
			AddStatusEffect(newSE);		
		else 
			SE.RefreshDuration();
	}
	else // Doesn't have the new SE.
		AddStatusEffect(newSE);
}

/*
Called by Status Effects of the manager's list,
when they end their life time.
*/
function RemoveStatusEffect(deadSE: StatusEffect): IEnumerator
{
	if (lock)
	{
		yield;
		RemoveStatusEffect(deadSE);
	}
	else	
	{
		lock = true;
		for (var i = 0; i < statusEffects.Count; i++)
			if (statusEffects[i].getID() == deadSE.getID())
			{
				Destroy(statusEffects[i]);
				statusEffects.RemoveAt(i);				
				break;
			}		
		lock = false;
		ReapplyEffectsNumber(TICK);
		ReapplyEffectsNumber(LEAVE);		
	}
}

function GetUnitAttributes(): UnitAttributes
{
	return unitAttr;
}

private function AddStatusEffect(newSE: StatusEffect)
{
	statusEffects.Add(newSE);
	ReapplyEffectsNumber(ENTRY);	
	newSE.SetManager(this);	
	newSE.OnEntry();		
}

/*
This is the main function of this manager.
To reapply attribute effects, it searches
for each EffectNumber inside each Status Effect.
Then, the manager groups up every EffectNumber
of the same AttrNumberType (eg.: MOVESPEED).
After that, it sends an EffectNumber list to the 
AttrNumber inside UnitAttributes, to recalculate 
its current value. The UnitAttributes then updates
the primitive value with the calculated current value.

Technical notes:
It does NOT process 'permanent' Effects Number.
If the manager were to process permanent effects, it
would reapply the permanent effect multiple times,
when this specific effect should only be applied once.
*/
function ReapplyEffectsNumber(mode: ApplyMode)
{
	var allEN = new List.<EffectNumber>();
	for (SE in statusEffects)
	{
		var effectsNumber = SE.GetEffectsNumber();	
		for (e in effectsNumber)
			allEN.Add(e);
	}
	var effectsForEachAttr = new List.<EffectNumber>();
	for (var type = 0; type < System.Enum.GetValues(typeof(AttrNumberType)).Length; type++)
	{
		for (EN in allEN)
		{
			if (EN.targetAttr == type && !EN.permanent && EN.mode == mode)
				effectsForEachAttr.Add(EN);
		}		
		unitAttr.RecalculateAttrNumber(type, effectsForEachAttr);
		effectsForEachAttr.Clear();
	}
}

private function HasStatusEffectByID(id: int)
{
	for (SE in statusEffects)
		if (SE.getID() == id)
			return SE;
	return null;
}