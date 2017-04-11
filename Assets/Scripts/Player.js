#pragma strict

@script RequireComponent(PlayerControls)
@script RequireComponent(UnitAttributes)

private var controls: PlayerControls;
private var attr: UnitAttributes;

var se: String;
var se2: String;

function Start() 
{
	controls = GetComponent(PlayerControls);
	attr = GetComponent(UnitAttributes);
}

function Update() 
{
	if (Input.GetKeyDown(KeyCode.T))	
		Tests();	
	if (Input.GetKeyDown(KeyCode.Y))	
		Tests2();	
	
	if (attr.stun)
		return;
	
	if (controls.right)
		transform.position.x += attr.moveSpeed * Time.deltaTime;
	if (controls.left)
		transform.position.x -= attr.moveSpeed * Time.deltaTime;	
}

function Tests()
{	
	var SE = StatusEffectDatabase.instance.GetSE(se);
	GetComponent(StatusEffectsManager).ReceiveStatusEffect(SE);
}

function Tests2()
{	
	var SE = StatusEffectDatabase.instance.GetSE(se2);
	GetComponent(StatusEffectsManager).ReceiveStatusEffect(SE);
}