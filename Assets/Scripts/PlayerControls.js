#pragma strict

var right: boolean;
var left: boolean;

function Update() 
{	
	right = Input.GetKey(KeyCode.D) || Input.GetKey(KeyCode.RightArrow);
	left = Input.GetKey(KeyCode.A) || Input.GetKey(KeyCode.LeftArrow);
}