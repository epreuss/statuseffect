#pragma strict

@script RequireComponent(PlayerControls)
@script RequireComponent(UnitAttributes)

private var controls: PlayerControls;
private var attr: UnitAttributes;

var se: StatusEffect;
var se2: StatusEffect;

function Start() 
{
	controls = GetComponent(PlayerControls);
	attr = GetComponent(UnitAttributes);
}

function Update() 
{
	if (controls.right)
		transform.position.x += attr.moveSpeed * Time.deltaTime;
	if (controls.left)
		transform.position.x -= attr.moveSpeed * Time.deltaTime;
	
	if (Input.GetKeyDown(KeyCode.T))	
		Tests();	
	if (Input.GetKeyDown(KeyCode.Y))	
		Tests2();	
}

function Tests()
{	
	GetComponent(StatusEffectsManager).OnStatusEffectReceive(se);
}

function Tests2()
{	
	GetComponent(StatusEffectsManager).OnStatusEffectReceive(se2);
}