# Lhemart: An online market place on the Ethereum blockchain
============================================================

This project was built in Solidity, on the Ethereum blockchain. The online market place is an e-commerce blockchain application. 
Lhemart provides a list of stores to a user, who is willing to browse items and buy in the marketplace.

There is a hierarchy of authority defined within the system.
a. There is an owner, who has the right to add administrators to the platform. There can only be one owner.
b. There is the admin, who after being assigned this role, can add store owners to the platform. 
There can be more than 1 admin.
c. There is the store owner, who owns stores and can manage the store, by adding or removing items to the store. The store owner can also withdraw his balance at any time he wants to. There can be many store owners.
d. There is the buyer, who visits the site and can view stores and store items and then buy an item. There would be several buyers.

# Tools
a. Metamask.
b. Ganache.
c. Truffle
d. npm was used for managing the dependencies.
e. React
f. Solidity 


# Installation
a. Clone the github repo.
b. cd into the root of the project.
c. Install metamask 
d. Install ganache, start it up and have it set to http://localhost:7545. 
e. run the following: 
    npm install
	truffle.cmd install oraclize-api
    truffle.cmd compile
    truffle.cmd migrate
    npm run start - This should start the app in the browser at http://localhost:3000/.


# Other notes
The Oraclize contract does not have an interface to it. The contract might be run in the Oraclize IDE. 