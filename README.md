# Status Effect

This repository's objetive is to create a robust Status Effect system for games.

The game engine used is Unity.

## Features

- Quick access primitive variables. 

- Generic attributes. No special cases for any type of attribute. 

- Each actor has a manager to handle status effects.

- Centralization of status effects. Access to an unit's status 
effects in one main list.

## Technical basis

- Unit: An actor of the game. Eg.: Player, enemy, monster.

- Primitive: A number or boolean. 

- Unit Attributes: Stores Primitives and Attributes that are updated
based on Effects received by a manager. 

- Effect: Its primary objetive is to modify an Attribute. It tells WHEN an Effect
should be applied. Eg.: Events of type On Enter, On Tick or On Leave. It has no operations, only definitions.

- Attribute Number/Boolean: A class that handles Effect Number/Boolean. 
It recalculates its current value based on these effects, saves a base value 
and set a roof and floor limit for the Primitive. 

- Effect Number/Boolean (extends Effect): Modifies an Attribute temporary or permanently.
It teels HOW an Attribute should be modified. Eg.: By sum or multiplication.
It has no operations, only definitions.

- Status Effect (extends Effect): A class that holds and operates a list of Effects.
This is the most powerful class in the system. It manages the events cited in Effect
for every Effect it holds.

- Status Effect Manager: A class that holds and operates a list of Status Effects.
Its main operation is to gather all Effects Number/Boolean of the same type
and send a update request to the Unit Attributes.
Eg.: Groups up every Effect Number that targets MOVESPEED Attribute.

## Authors

* **Estevan Silva** - *Initial work* (https://github.com/epreuss)
