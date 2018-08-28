# Design pattern decisions
==========================

a. The pattern followed in this project is one that gives privileges to only certain people and even those people can only do those things and nothing beyond. Privileges given are as follows:
 - Owner : The owner is the address that deploys a contract. Only this address has the right to add administrators to the system.
 - Admin : The admin is one who has the ability to add a store owner or cann remove a store owner.
 - Store owner : The store owner is one who can create a store and manage his store on the platform.
 - Buyer : the buyer is just anyone visiting the platform, who does not have any of the above rights and so, is presented with an interface that basically shows some stores available on the platform.

Each of these participants on the platform have different views presented to them.


# Structure and access rights used
a. For every operation that changes state, an event is emitted with the details of the operation.
b. Most of the operations require a user that has a certain privilege and are restricted to addresses having only those roles in the participants' roles array. 





