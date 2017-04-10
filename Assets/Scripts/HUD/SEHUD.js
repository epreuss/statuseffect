#pragma strict

var icon: Image;
var stack: Text;
@HideInInspector var targetSE: StatusEffect;

function Start() 
{
	stack.text = "";
}

function Update() 
{
	if (targetSE.IsOverTime())
		icon.fillAmount = 1 - (targetSE.timerDuration / targetSE.duration);
}

function SetSE(targetSE: StatusEffect)
{
	this.targetSE = targetSE;	
	UpdateIcon();
	UpdateStack();
}

function UpdateIcon()
{
	icon.color = targetSE.color;	
	if (targetSE.icon)
	{
		icon.sprite = targetSE.icon;
		GetComponent(Image).sprite = targetSE.icon;
	}
}

function UpdateStack()
{
	if (targetSE.currentStacks > 1)
		stack.text = targetSE.currentStacks + "";
	else
		stack.text = "";
}