﻿#pragma strict

var owner: Transform;
var attr: UnitAttributes;

function Update() 
{
	transform.position = owner.position;
	transform.position.y += 1.5;
	
	GetComponent(Text).text = "" + owner.GetComponent(UnitAttributes).health;
}