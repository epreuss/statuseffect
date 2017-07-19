#pragma strict

//Debugger.instance.Log(gameObject, "");

var showDebug: boolean;
@HideInInspector static var instance: Debugger;

var logs: String; 

function Awake()
{
	instance = this;	
}

function Log(log: String) 
{
	var message = Time.frameCount + ": " + log;
	logs += message + "\n";
	if (showDebug)
		Debug.Log(message);
}

function Log(owner: GameObject, log: String) 
{
	var message = Time.frameCount + ", " + owner.name + ": " + log;
	logs += message + "\n";
	if (showDebug)
		Debug.Log(message);
}
