#pragma strict

@script RequireComponent(UnitAttributes)

import System.Collections.Generic;

/*
Every unit must have an Status Effects Manager if they want
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
private var postManager: PostSEManager;

private var lock: boolean;
private var instanceID: int;

private var onListAdd: Function;
private var onListRemove: Function;
private var onSEStack: Function;
private var onSEPop: Function;

function Awake()
{
	statusEffects = new List.<StatusEffect>();
	unitAttr = GetComponent(UnitAttributes);
	postManager = GetComponent(PostSEManager);
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
	if (Input.GetKeyDown(KeyCode.P))	
		PurgeStatusEffect(StatusEffectDatabase.instance.GetSEID("Testings 2"));
	if (Input.GetKeyDown(KeyCode.L))	
		PopStatusEffect(StatusEffectDatabase.instance.GetSEID("Testings 2"));
	if (Input.GetKeyDown(KeyCode.R))	
		ReapplyTemporaryEffects(null);
}

function RegisterListOperationsCallbacks(onListAdd: Function, onListRemove: Function, onSEStack: Function, onSEPop: Function)
{
	this.onListAdd = onListAdd;
	this.onListRemove = onListRemove;
	this.onSEStack = onSEStack;
	this.onSEPop = onSEPop;
}

/*
Called by EventsManager and StatusEffect.
*/
function ReceiveStatusEffect(newSE: StatusEffect) 
{
	var SE = HasStatusEffectByID(newSE.GetID());
	if (SE != null) // Already has the SE.
	{
		Debugger.instance.Log(gameObject, "Duplicated SE");
		if (SE.independent)		
			AddStatusEffect(newSE);			
		else
		{
			if (SE.stackable)
			{			
				SE.Stack();
				onSEStack(newSE.GetID());				
			}
			if (SE.refreshable)			
				SE.Refresh();				
			Destroy(newSE.gameObject);			
		}
	}
	else // Doesn't have the new SE.
		AddStatusEffect(newSE);
}

/*
Called by units that want to purge SEs.
*/
function PurgeStatusEffect(SEID: int)
{
	for (s in statusEffects)
		if (s.GetID() == SEID)
		{
			s.Purge();
			break;
		}
}

/*
Called by units that want to pop SEs.
*/
function PopStatusEffect(SEID: int)
{
	for (s in statusEffects)
		if (s.GetID() == SEID)
		{
			// If stacks are 1, SE is purged instead of popped.
			var willBePurged = s.currentStacks == 1;
			s.Pop();
			if (!willBePurged)								
				onSEPop(SEID);			
			break;
		}	
}

/*
Called by Status Effects of the manager's list, when they expire.
*/
function RemoveStatusEffect(deadSE: StatusEffect): IEnumerator
{
	//Debugger.instance.Log(gameObject, "Try remove " + deadSE + ", lock: " + lock);
	if (lock)
	{
		//Debugger.instance.Log(gameObject, "Cant remove, locked");
		yield;
		RemoveStatusEffect(deadSE);
	}
	else	
	{
		lock = true;		
		for (var i = 0; i < statusEffects.Count; i++)
			if (statusEffects[i].GetID() == deadSE.GetID())
			{
				Debugger.instance.Log(gameObject, "Removed " + deadSE);
				onListRemove(deadSE);				
				statusEffects[i].OnRemoveFromManager();			
				statusEffects.RemoveAt(i);					
				break;
			}		
		lock = false;		
		ReapplyTemporaryEffects(null);
	}
}

function GetUnitAttributes(): UnitAttributes
{
	return unitAttr;
}

/*
Called when a new SE is received in this manager.
*/
private function AddStatusEffect(newSE: StatusEffect): IEnumerator
{
	//Debugger.instance.Log(gameObject, "Try add " + newSE + ", lock: " + lock);
	if (lock)
	{
		//Debugger.instance.Log(gameObject, "Cant add, locked");
		yield;
		AddStatusEffect(newSE);
	}
	else
	{
		lock = true;
		Debugger.instance.Log(gameObject, "Added " + newSE);
		statusEffects.Add(newSE);
		onListAdd(newSE);
		lock = false;
		
		// This order is important!
		// Debugger.instance.Log(gameObject, "Reapply - Entry SE");			
		// ReapplyTemporaryEffects();
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
function ReapplyTemporaryEffects(requester: StatusEffect)
{	
	//Debugger.instance.Log(gameObject, "Reapply");
	ReapplyTemporaryEffectsNumber(requester);
	ReapplyTemporaryEffectsBoolean(requester);
}

// Used to read in inspector. Could be local.
var allEN: List.<EffectNumber>;

/*
Important: 
- This method DOES NOT reapply permanent effects!
- It DOES NOT reapply LEAVE effects!
*/
private function ReapplyTemporaryEffectsNumber(requester: StatusEffect)
{	
	allEN = new List.<EffectNumber>();
	for (SE in statusEffects)
	{
		var effectsNumber = SE.GetValidEffectsNumberForReapply();	
		for (e in effectsNumber)
			allEN.Add(e);
	}
	var effectsForEachAttr = new List.<EffectNumber>();
	for (var type = 0; type < System.Enum.GetValues(typeof(AttrNumberType)).Length; type++)
	{
		var currentAttrValue = unitAttr.access[type];
	
		for (EN in allEN)		
			if (EN.targetAttr == type)						
				effectsForEachAttr.Add(EN);									
		unitAttr.RecalculateAttrNumber(type, effectsForEachAttr);
		effectsForEachAttr.Clear();
		
		var resultAttrValue = unitAttr.access[type];
		var attrChange = resultAttrValue - currentAttrValue;
		if (requester != null && attrChange != 0)
		{
			var data = new AttrNumberChangeData(requester, type, attrChange);
			postManager.OnAttrNumberChange(data);
		}
	}
}

private function ReapplyTemporaryEffectsBoolean(requester: StatusEffect)
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
		if (SE.GetID() == id)
			return SE;
	return null;
}
