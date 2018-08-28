
/*
Copyright Lhemart August 2018
*/
pragma solidity ^0.4.21;

import "./library/SafeMath.sol";


/** @title LheMart
* @author Wunmi GEORGE
*/
contract LheMart
{
    using SafeMath for uint;

    address public owner;
    mapping (address => bytes32) public participantRoles;
    mapping (address => Store []) public stores;
    mapping (address => mapping(bytes32 => uint)) storeIndices;    
    mapping (address => uint) private ownerSalesBalances;
    address [] public allStoreOwners;

    struct Store
    {
        bytes32 storeName;
        bytes32 storeDescription;
        bytes32 [] itemNames;
        mapping(bytes32 => Item) items;
    }

    struct Item
    {
        bytes32 itemName;
        bytes32 itemDescription;
        uint itemPrice;
        uint quantityLeft;
        uint itemIndexInStore;
    }


    event AdminAdded(address admin, uint time);
    event AdminRemoved(address admin, uint time);
    event StoreOwnerAdded(address storeOwner, address admin, uint time);
    event StoreOwnerRemoved(address storeOwner, address admin, uint time);
    event StoreCreated(address storeOwner, bytes32 storeName, bytes32 storeDescription, uint time);
    event StoreRemoved(address storeOwner, bytes32 storeName, uint time);
    event ItemAddedToStore(address storeOwner, bytes32 storeName, bytes32 itemName, bytes32 itemDescription, uint price, uint qtyLeft, uint time);
    event ItemRemovedFromStore(address storeOwner, bytes32 storeName, bytes32 itemName, uint time);
    event ItemPurchased(address storeOwner, address buyer, bytes32 storeName, bytes32 itemName, uint qtyToBuy, uint time);
    event StoreOwnerWithdrawnBalance(address storeOwner, uint amount, uint time);
    
    function LheMart() public
    {
        owner = msg.sender;
    }

    /**
    * @notice Add `newAdmin` as admin.
    * @dev This function adds an admin
    * @param newAdmin - address of admin to add
    */
    function addAdmin (address newAdmin) public     
    {
        require(owner == msg.sender);

        participantRoles[newAdmin] = "admin";
        emit AdminAdded (newAdmin, block.timestamp);
    }

    /**
    * @dev This function removes an admin
    * @param admin - address of admin to remove
    */
    function removeAdmin (address admin) public     
    {
       require(owner == msg.sender);

        participantRoles[admin] = "0x0000000000";
        emit AdminRemoved(admin, block.timestamp);
    }
  
    /**
    * @dev This function adds a store owner
    * @param newStoreOwner - address of new store owner
    */
    function addStoreOwner (address newStoreOwner) public
    {
        require(participantRoles[msg.sender] == "admin");

        participantRoles[newStoreOwner] = "storeowner";
        allStoreOwners.push(newStoreOwner);
        emit StoreOwnerAdded(newStoreOwner, msg.sender, block.timestamp);
    }    
    
    /**
    * @dev This function removes a store owner
    * @param storeOwner - address of store owner to remove
    */
    function removeStoreOwner (address storeOwner) public     
    {
        require(participantRoles[msg.sender] == "admin");

        participantRoles[storeOwner] = "0x0000000000";
        emit StoreOwnerRemoved(storeOwner, msg.sender, block.timestamp);
    }

    /**
    * @dev This function creates a store 
    * @param name - name of the store 
    * @param description - short description of store
    */
    function createStore (bytes32 name, bytes32 description) public     
    {
        require(participantRoles[msg.sender] == "storeowner");
        stores[msg.sender].push(Store ({
            storeName: name,
            storeDescription: description,
            itemNames: new bytes32[](0)
        }));

        storeIndices[msg.sender][name] = stores[msg.sender].length - 1;
        emit StoreCreated(msg.sender, name, description, block.timestamp);
    }
    
    /**
    * @dev This function removes a store 
    * @param name - name of the store
    */
    function removeStore (bytes32 name) public     
    {
        require(participantRoles[msg.sender] == "storeowner");

        // Store [] memory ownerStores = stores[msg.sender];
        uint storeIndex = storeIndices[msg.sender][name];
        delete stores[msg.sender][storeIndex];
        storeIndices[msg.sender][name] = 0;
               
        emit StoreRemoved(msg.sender, name, block.timestamp);
    }

    /**
    * @dev This function gets all the stores owned by a particular store owner
    * @param storeOwner - address of the store owner
    * @param nextIndex - next index used for iteratively getting all the stores of a particular store owner
    */
    function getAllOwnerStores (address storeOwner, uint nextIndex) public
    view 
    returns (address, bytes32[5], bytes32[5], uint, bool)    
    {
        address storeOwnerAddr;
        bytes32[5] memory storeNames;
        bytes32[5] memory storeDescription;        
        bool endOfStoresReached;

        if (storeOwner == 0x0)
        {
            require(participantRoles[msg.sender] == "storeowner");
            storeOwner = msg.sender;
        }  
        
        storeOwnerAddr = storeOwner;
        
        Store [] storage ownerStores = stores[storeOwner]; 
                
        for (uint i=0; i<5; i++)
        {
            if (nextIndex + i < ownerStores.length)
            {
                storeNames[i] = ownerStores[nextIndex + i].storeName; 
                storeDescription[i] = ownerStores[nextIndex + i].storeDescription;
            }
            else
            {
                endOfStoresReached = true;
                break;
            } 
        }

        nextIndex += 5;
        return (storeOwnerAddr, storeNames, storeDescription, nextIndex, endOfStoresReached);
    }

    /**
    * @dev This function adds an item to a store
    * @param storeName - name of the store
    * @param name - name of the item to be added 
    * @param description - description of the item
    * @param price - price of the item
    * @param qtyLeft - quantity of the item available
    */
    function addItemToStore (bytes32 storeName, bytes32 name, bytes32 description, uint price, uint qtyLeft) public     
    {
        require(participantRoles[msg.sender] == "storeowner");

        Store [] storage ownerStores = stores[msg.sender];
        uint storeIndex = storeIndices[msg.sender][name];
        Store storage currentStore = ownerStores[storeIndex];
        
        // uint itemIndex = currentStore.numOfItems;
        currentStore.items[name] = Item ({
                            itemName: name,
                            itemDescription: description,
                            itemPrice: price,
                            quantityLeft: qtyLeft,
                            itemIndexInStore: currentStore.itemNames.length
                        });
        currentStore.itemNames.push(name);
                    
        // itemindices increment
        // currentStore.itemIndices[name] = itemIndex;
        // ++currentStore.numOfItems;
        emit ItemAddedToStore(msg.sender, storeName, name, description, price, qtyLeft, block.timestamp);
    }

    /**
    * @dev This function removes an item from a store
    * @param storeName - name of the store
    * @param itemName - name of the item to be removed
    */
    function removeItemFromStore (bytes32 storeName, bytes32 itemName) public     
    {
        require(participantRoles[msg.sender] == "storeowner");

        Store [] storage ownerStores = stores[msg.sender];
        uint storeindex = storeIndices[msg.sender][storeName];
        Store storage currentStore = ownerStores[storeindex];
        
        // uint itemIndex = currentStore.itemIndices[itemName];
        
        // delete currentStore.items[itemIndex];
        // delete currentStore.itemIndices[itemName];
        // --currentStore.numOfItems;
        delete currentStore.itemNames[currentStore.items[itemName].itemIndexInStore];
        delete currentStore.items[itemName];
        emit ItemRemovedFromStore(msg.sender, storeName, itemName, block.timestamp);
    }
    
    /**
    * @dev This function gets all the items in a store
    * @param storeOwner - address of the store owner
    * @param storeName - name of the store from which to get items
    * @param nextIndex - next index used for iteratively getting all the items in the store
    */
    function getItemsInStore (address storeOwner, bytes32 storeName, uint nextIndex) public
    view
    returns (bytes32 [5], uint [5], uint [5], uint, bool)
    {
        uint storeIndex = getStoreIndex(storeOwner, storeName);

        return getItemDetails(nextIndex, storeOwner, storeIndex);
    }

    /**
    * @dev This function gets the details of items in a store. Helper for the 'getItemsInStore' function
    * @param storeOwner - address of the store owner
    * @param storeIndex - index of the store
    * @param nextIndex - next index used for iteratively getting all the items in the store
    */
    function getItemDetails(uint nextIndex, address storeOwner, uint storeIndex)
    view
    returns (bytes32 [5] itemName, uint [5] itemPrice, uint[5] quantityLeft, uint nextIndexx, bool endOfItemsReached) //bytes32 [5],
    {
        Store storage store = getStoreOfOwner(storeOwner, storeIndex); //stores[storeOwner][storeIndex]; //
        // bytes32[5] memory itemName;
        // // bytes32 [5] memory itemDescription;
        // uint [5] memory itemPrice;
        // uint [5] memory quantityLeft;
        // bool endOfItemsReached;

        nextIndexx = nextIndex;

        for (uint i=0; i<5; i++)
        {
            if (nextIndexx + i < store.itemNames.length)
            {
                Item item = store.items[store.itemNames[nextIndexx + i]];

                itemName[i] = item.itemName; 
                // itemDescription[i] = item.itemDescription; 
                itemPrice[i] = item.itemPrice;
                quantityLeft[i] = item.quantityLeft;
            }
            else
            {
                endOfItemsReached = true;
                break;
            } 
        }

        nextIndexx += 5;
    }

    /**
    * @dev This function gets the store of an onwer. Serves as a helper to the getItemDetails function
    * @param storeOwner - address of the store owner
    * @param storeIndex - index of the store in the stores mapping
    */
    function getStoreOfOwner(address storeOwner, uint storeIndex)
    private
    view
    returns (Store storage)
    {
        return stores[storeOwner][storeIndex];
    }

    /**
    * @dev This function gets the index of a store form the storeIndices mapping  
    * @param storeOwner - address of the store owner
    * @param storeName - name of the store, whose index is to be retrieved
    */
    function getStoreIndex(address storeOwner, bytes32 storeName) public view returns(uint){
        return storeIndices[storeOwner][storeName];
    }

    /**
    * @dev This function allows a buyer to buy an item from a store.
    * @param storeOwner - address of the store owner
    * @param storeName - name of the store 
    * @param itemName - name of the item to be purchased 
    * @param qtyToBuy - amount of the item to be purchased 
    */
    function purchaseItem(address storeOwner, bytes32 storeName, bytes32 itemName, uint qtyToBuy) public
    payable
    {
        uint storeIndex = storeIndices[storeOwner][storeName];
        
        Store storage currentStore = stores[storeOwner][storeIndex];
        Item storage currentItem =  currentStore.items[itemName];

        require(qtyToBuy <= currentItem.quantityLeft);

        // uint totalPrice = currentItem.itemPrice.mul(qtyToBuy);
        
        uint totalPrice = currentItem.itemPrice * qtyToBuy;

        require(msg.value > totalPrice);

        // //based on a 1% split ratio. 1% for lhemart and 99% for the owner
        // // uint payableToOwner = totalPrice.mul(99).div(100);
        // uint payableToOwner = (totalPrice * 99)/100;        
        ownerSalesBalances[storeOwner] = totalPrice;

        currentItem.quantityLeft -= qtyToBuy;

        emit ItemPurchased(storeOwner, msg.sender, storeName, itemName, qtyToBuy, block.timestamp);
    }

    /**
    * @dev This functiona allows a store owner to withdraw sales proceeds that have accrued to the store owner
    */
    function withdrawSalesBalance() public
    {
        require(participantRoles[msg.sender] == "storeowner");

        uint amountPayable = ownerSalesBalances[msg.sender];

        // require(amountPayable > 0);
        ownerSalesBalances[msg.sender] = 0;
        
        // msg.sender.transfer(amountPayable);
       
        emit StoreOwnerWithdrawnBalance(msg.sender, amountPayable, block.timestamp);
    }

    /**
    * @dev Fallback function
    */
    function () external payable {

    }

}

