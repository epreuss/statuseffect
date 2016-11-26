#pragma strict

@script RequireComponent(UnitAttributes)

import System.Collections.Generic;

/*
Every unit must have an EffectsManager if they want
to use Effects in the primitive variables of UnitAttributes.

This manager will receive Status Effects, which are 
made of one or more Effects. Each Effect inside a SE
is used to recalculate permanent and temporary buffs and debuffs.

Eg.: We have 3 SE, each one giving 1, 2 and 3 bonus armor.
When we add a new SE that gives 4 armor, the manager
finds every Effect related to armor in his SE list and 
send them to UnitAttributes, which will recalculate the total armor,
resulting in 1+2+3+4 = 10.
*/

var statusEffects: List.<StatusEffect>;
private var unitAttr: UnitAttributes;

private var lock: boolean;

function Awake()
{
	statusEffects = new List.<StatusEffect>();
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
Status Effects to the unit associated to this manager.
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
when their life time end.
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
				Debugger.instance.Log(gameObject, "Removed " + deadSE);
				statusEffects[i].OnRemoveFromManager();			
				statusEffects.RemoveAt(i);	
				break;
			}		
		lock = false;
		Debugger.instance.Log(gameObject, "Reapply - Leave SE");			
		ReapplyTemporaryEffects();				
	}
}

function GetUnitAttributes(): UnitAttributes
{
	return unitAttr;
}

private function AddStatusEffect(newSE: StatusEffect): IEnumerator
{
	if (lock)
	{
		yield;
		AddStatusEffect(newSE);
	}
	else
	{
		lock = true;
		Debugger.instance.Log(gameObject, "Added " + newSE);
		statusEffects.Add(newSE);
		lock = false;

		// This order is important!
		Debugger.instance.Log(gameObject, "Reapply - Entry SE");			
		ReapplyTemporaryEffects();			
		newSE.SetManager(this);	
		newSE.OnEntry();		
	}
}

/*
This is the main function of this manager.
To reapply attribute effects, it searches
for each EffectNumber and EffectBoolean inside each SE.
Then, the manager groups up every EffectNumber and EffectBoolean
of the same attribute type (eg.: MOVESPEED, STUN).
After that, it sends an effects list to the target
attribute inside UnitAttributes, to recalculate 
its current value. The UnitAttributes then updates
the primitive value with the calculated current value.

Important!
It does NOT process 'permanent' Effects Number!
If the manager were to process permanent effects, it
would reapply the permanent effect multiple times. That is wrong. 
That's why this method only works with temporary effects.
*/
function ReapplyTemporaryEffects()
{
	ReapplyTemporaryEffectsNumber();
	ReapplyTemporaryEffectsBoolean();
}

/*
Important: 
- This method DOES NOT reapply permanent effects!
- It DOES NOT reapply LEAVE effects!
*/
private function ReapplyTemporaryEffectsNumber()
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
			if (EN.targetAttr == type && !EN.permanent && EN.mode != LEAVE)
				effectsForEachAttr.Add(EN);
		}		
		unitAttr.RecalculateAttrNumber(type, effectsForEachAttr);
		effectsForEachAttr.Clear();
	}
}

private function ReapplyTemporaryEffectsBoolean()
{
	var allEB = new List.<EffectBoolean>();
	for (SE in statusEffects)
	{
		var effectsBoolean = SE.GetEffectsBoolean();	
		for (e in effectsBoolean)
			allEB.Add(e);
	}
	var effectsForEachAttr = new List.<EffectBoolean>();
	for (var type = 0; type < System.Enum.GetValues(typeof(AttrBooleanType)).Length; type++)
	{
		for (EB in allEB)
		{			
			if (EB.targetAttr == type)
				effectsForEachAttr.Add(EB);
		}		
		unitAttr.RecalculateAttrBoolean(type, effectsForEachAttr);
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
