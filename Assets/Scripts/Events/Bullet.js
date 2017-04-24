#pragma strict

private var owner: GameObject;
private var damage: Damage;
private var se: String;
private var direction: Vector2;

function Start() 
{
	GetComponent(Rigidbody2D).velocity = direction.normalized * 3;
}

function setOwner(owner: GameObject)
{
	this.owner = owner;
}

function setDamage(damage: Damage)
{
	this.damage = damage;
}

function setSE(se: String)
{
	this.se = se;
}

function setDirection(direction: Vector2)
{
	this.direction = direction;
}

function OnTriggerEnter2D(col: Collider2D)
{
	var pack = new SEPack(owner, col.gameObject, se);
	col.SendMessage("OnSEReceive", pack);
	Destroy(gameObject);
}