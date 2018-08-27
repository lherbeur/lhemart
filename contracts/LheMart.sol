pragma solidity ^0.4.21;

import "./library/SafeMath.sol";

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

    function addAdmin (address newAdmin) public     
    {
        require(owner == msg.sender);

        participantRoles[newAdmin] = "admin";
        emit AdminAdded(newAdmin, block.timestamp);
    }

    function removeAdmin (address admin) public     
    {
       require(owner == msg.sender);

        participantRoles[admin] = "0x0000000000";
        emit AdminRemoved(admin, block.timestamp);
    }
  
    function addStoreOwner (address newStoreOwner) public
    {
        require(participantRoles[msg.sender] == "admin");

        participantRoles[newStoreOwner] = "storeowner";
        allStoreOwners.push(newStoreOwner);
        emit StoreOwnerAdded(newStoreOwner, msg.sender, block.timestamp);
    }
    
    function removeStoreOwner (address storeOwner) public     
    {
        require(participantRoles[msg.sender] == "admin");

        participantRoles[storeOwner] = "0x0000000000";
        emit StoreOwnerRemoved(storeOwner, msg.sender, block.timestamp);
    }

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
    
    function removeStore (bytes32 name) public     
    {
        require(participantRoles[msg.sender] == "storeowner");

        // Store [] memory ownerStores = stores[msg.sender];
        uint storeIndex = storeIndices[msg.sender][name];
        delete stores[msg.sender][storeIndex];
        storeIndices[msg.sender][name] = 0;
               
        emit StoreRemoved(msg.sender, name, block.timestamp);
    }

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
    
    function getItemsInStore (address storeOwner, bytes32 storeName, uint nextIndex) public
    view
    returns (bytes32 [5], uint [5], uint [5], uint, bool)
    {
        uint storeIndex = getStoreIndex(storeOwner, storeName);

        return getItemDetails(nextIndex, storeOwner, storeIndex);
    }

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

    function getStoreOfOwner(address storeOwner, uint storeIndex)
    private
    view
    returns (Store storage)
    {
        return stores[storeOwner][storeIndex];
    }

    function getStoreIndex(address storeOwner, bytes32 storeName) public view returns(uint){
        return storeIndices[storeOwner][storeName];
    }

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

    function withdrawSalesBalance() public
    {
        require(participantRoles[msg.sender] == "storeowner");

        uint amountPayable = ownerSalesBalances[msg.sender];

        // require(amountPayable > 0);
        ownerSalesBalances[msg.sender] = 0;
        
        // msg.sender.transfer(amountPayable);
       
        emit StoreOwnerWithdrawnBalance(msg.sender, amountPayable, block.timestamp);
    }

    function () external payable {

    }

}

