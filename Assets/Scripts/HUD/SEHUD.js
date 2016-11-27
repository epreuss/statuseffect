#pragma strict

@HideInInspector var targetSE: StatusEffect;

function Start () {

}

function Update () {

}

function SetSE(targetSE: StatusEffect)
{
	this.targetSE = targetSE;
	GetComponent(Image).color = targetSE.color;
}