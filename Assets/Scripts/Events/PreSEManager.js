#pragma strict

private var eventsPreSE: List.<EventPreSE>;

function Awake() 
{
	eventsPreSE = new List.<EventPreSE>();
}

function RegisterEvent(event: EventPreSE)
{
	eventsPreSE.Add(event);
}

function RemoveEvent(event: EventPreSE)
{
	eventsPreSE.Remove(event);
}

function Inspect(SE: StatusEffect)
{	
	var allEN = new List.<EffectNumber>();
	allEN = SE.GetEffectsNumber();
	for (EN in allEN)	
		if (!EN.IsAdvanced())		
			TryApplyEvents(EN);		
	Debugger.instance.Log(this + " inspected " + SE.name);	
}

private function TryApplyEvents(EN: EffectNumber)
{
	var resultEvents: List.<EventPreSE>;
	
	resultEvents = GetEvents(EN, MULTIPLY);
	for (e in resultEvents)
		e.Apply(EN);
	
	resultEvents = GetEvents(EN, SUM);
	for (e in resultEvents)
		e.Apply(EN);
}

private function GetEvents(EN: EffectNumber, effectType: EffectNumberType)
{
	var result = new List.<EventPreSE>();
	for (t in eventsPreSE)	
		if (t.CanApply(EN, effectType))
			result.Add(t);
	return result;
}

