#pragma strict

class SEPack
{
	var sender: GameObject;
	var receiver: GameObject;
	var damage: Damage;
	var se: String;
		
	function SEPack (sender: GameObject, receiver: GameObject, se: String)
	{
		this.sender = sender;
		this.receiver = receiver;
		this.se = se;
	}
}

class Damage
{
	var value: Number;
	
	function Damage(value: Number)
	{
		this.value = value;
	}
	
}
