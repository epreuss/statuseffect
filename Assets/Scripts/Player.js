#pragma strict

@script RequireComponent(PlayerControls)
@script RequireComponent(UnitAttributes)

var bulletPrefab: GameObject;
var enemy: GameObject;
private var controls: PlayerControls;
private var attr: UnitAttributes;

var se: String;
var se2: String;
var attackSE: String;

function Start() 
{
	controls = GetComponent(PlayerControls);
	attr = GetComponent(UnitAttributes);
}

function Update() 
{
	if (attr.stun)
		return;
	
	if (Input.GetKeyDown(KeyCode.T))	
		Tests();	
	if (Input.GetKeyDown(KeyCode.Y))	
		Tests2();	
	if (Input.GetKeyDown(KeyCode.C))	
		ShootAtEnemy();	
	if (Input.GetKeyDown(KeyCode.Z))	
		ShootAtPlayer();	
	if (controls.right)
		transform.position.x += attr.access[MOVESPEED] * Time.deltaTime;
	if (controls.left)
		transform.position.x -= attr.access[MOVESPEED]* Time.deltaTime;	
}

function ShootAtEnemy()
{
	var direction = Vector2(1, 0);
	var bullet = Instantiate(bulletPrefab, transform.position + direction, Quaternion.identity);
	bullet.GetComponent(Bullet).setOwner(gameObject);
	bullet.GetComponent(Bullet).setDirection(direction);
	bullet.GetComponent(Bullet).setSE(attackSE);
}

function ShootAtPlayer()
{
	var direction = Vector2(-1, 0);
	var bullet = Instantiate(bulletPrefab, enemy.transform.position + direction, Quaternion.identity);
	bullet.GetComponent(Bullet).setOwner(enemy);
	bullet.GetComponent(Bullet).setDirection(direction);
	bullet.GetComponent(Bullet).setSE(attackSE);
}

function Tests()
{	
	var pack = new SEPack(gameObject, gameObject, se);
	SendMessage("OnSEReceive", pack);
}

function Tests2()
{	
	var pack = new SEPack(gameObject, gameObject, se2);
	SendMessage("OnSEReceive", pack);
}