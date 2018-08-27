import React, { Component } from 'react'
import {  Switch, Route, BrowserRouter } from 'react-router-dom'
import LheMart from '../build/contracts/LheMart.json'
import getWeb3 from './utils/getWeb3'


import ReactDOM from 'react-dom';
import Modal from 'react-modal';


import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

const contract = require('truffle-contract')
const hex2ascii = require('hex2ascii')
// const web3Utils = require('web3.utils.sha3')

var defaultAccount
var lhemartInstance
var web3

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};


class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      role: null,
      renderChild: true
    }

    this.handleChildUnmount = this.handleChildUnmount.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      // this.setState({
      //   web3: results.web3
      // })

      web3 = results.web3
      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })

  }

instantiateContract() {
  
  const lhemart = contract(LheMart)
  lhemart.setProvider(web3.currentProvider)

  // Get accounts.
  web3.eth.getAccounts((error, accounts) => {

    defaultAccount = accounts[0];
    
    lhemart.deployed().then((instance) => {
      lhemartInstance = instance

      // this.getAccountNonce();
      this.addEventWatchers();
      
      return lhemartInstance.owner();
    }).then((result) => {
      
      if (defaultAccount === result)
        this.setState({role: "owner"});          
      else 
        return lhemartInstance.participantRoles(defaultAccount);

    }).then((result) => {

      if (result === undefined)
        return;

      var roleValue = hex2ascii(result);
      roleValue = (roleValue.trim().length !== 0 ? roleValue : "buyer")
      
      return this.setState({role: roleValue});
    })   

  })
}

    
// getAccountNonce()
// {
//   web3.eth.getTransactionCount(defaultAccount, function(err, accountNonce) {
//     if (!err)
//     {
//       this.setState({acctNonce: accountNonce});  
//     }
//   }.bind(this)); 
       
// }

addEventWatchers()
{
  //admin added event
  lhemartInstance.AdminAdded().watch(function(err, response){  
    
    var eventResponse = response.args;
    
    if (!err)
    {
      alert("Admin address - " + eventResponse.admin + " added at time, " + new Date(parseInt(eventResponse.time) * 1000));
      
    }
    else
      alert("An error occurred - "+ err);
  });

  //admin removed event
  lhemartInstance.AdminRemoved().watch(function(err, response){  
    
    var eventResponse = response.args;
    
    if (!err)
    {
      alert("Admin address - " + eventResponse.admin + " removed at time, " + new Date(parseInt(eventResponse.time) * 1000));
      
    }
    else
      alert("An error occurred - "+ err);
  });


  //storeowner added event
  lhemartInstance.StoreOwnerAdded().watch(function(err, response){  
    var eventResponse = response.args;
    
    if (!err)
    {
      alert("StoreOwner address - " + eventResponse.storeOwner + ", added by admin "+  eventResponse.admin +", at time, " + new Date(parseInt(eventResponse.time) * 1000));
      
    }
    else
      alert("An error occurred - "+ err);
  });

  //storeowner removed event
  lhemartInstance.StoreOwnerRemoved().watch(function(err, response){  
    
    var eventResponse = response.args;
    
    if (!err)
    {
      alert("StoreOwner address - " + eventResponse.storeOwner + ", removed by admin "+  eventResponse.admin +", at time, " + new Date(parseInt(eventResponse.time) * 1000));
      
    }
    else
      alert("An error occurred - "+ err);
  });

  //store added event
  lhemartInstance.StoreCreated().watch(function(err, response){  
    var eventResponse = response.args;
    
    if (!err)
    {
      alert("Store - " + hex2ascii(eventResponse.storeName) + " created. \n Description - "+  hex2ascii(eventResponse.storeDescription) +
      ", at time, " + new Date(parseInt(eventResponse.time) * 1000));      
    }
    else
      alert("An error occurred - "+ err);
  });

  //store removed event
  lhemartInstance.StoreRemoved().watch(function(err, response){  
    
    var eventResponse = response.args;
    
    if (!err)
    {
      alert("Store - " + hex2ascii(eventResponse.storeName) + " - removed at time, " + new Date(parseInt(eventResponse.time) * 1000));      
    }
    else
      alert("An error occurred - "+ err);
  });

  //withdraw balance event
  lhemartInstance.StoreOwnerWithdrawnBalance().watch(function(err, response){  
    
    var eventResponse = response.args;
    
    if (!err)
    {
      alert("StoreOwner - " + eventResponse.storeOwner + " withdrew " + eventResponse.amount + ", at time, " + new Date(parseInt(eventResponse.time) * 1000));      
    }
    else
      alert("An error occurred - "+ err);
  });

  //item added to store event
  lhemartInstance.ItemAddedToStore().watch(function(err, response){  
    
    var eventResponse = response.args;
    
    if (!err)
    {
      alert("Item - " + hex2ascii(eventResponse.itemName) + " - added to store - " + hex2ascii(eventResponse.storeName) + " - at time, " + new Date(parseInt(eventResponse.time) * 1000));      
    }
    else
      alert("An error occurred - "+ err);
  });


  //item purchased event
  lhemartInstance.ItemPurchased().watch(function(err, response){  
      
    var eventResponse = response.args;
    
    if (!err)
    {
      alert(eventResponse.qtyToBuy + "units of item - " + hex2ascii(eventResponse.itemName) + " - purchased from store- " + hex2ascii(eventResponse.storeName) + " - at time, " + new Date(parseInt(eventResponse.time) * 1000));      
    }
    else
      alert("An error occurred - "+ err);
  });


}

returnAppropriateComponent(role)
{ 
    let component;

    if (role === "owner")
    {
      component = <Owner unmountMe={this.handleChildUnmount} />
    }
    else if (role === "admin")
    {
      component =  <Admin unmountMe={this.handleChildUnmount} />
    }
    else if (role === "storeowner")
    {
      component =  <StoreOwner unmountMe={this.handleChildUnmount} />
    }
    else if (role === "buyer")
    {
      component = <Buyer unmountMe={this.handleChildUnmount} />
    }

    return component;
}

handleChildUnmount(){
    this.setState({renderChild: false});
}


  render() {

    var componentToRender = this.returnAppropriateComponent(this.state.role);

    return(
      <div>
        <div className="App">
          <nav className="navbar pure-menu pure-menu-horizontal">
              <a href="#" className="pure-menu-heading pure-menu-link">LheMart</a>
          </nav>
          <main className="container">
            <div className="pure-g">
              <div className="pure-u-1-1">
                <h1>Your one-stop shopping platform!</h1>
                <p>Thanks <b>{this.state.role}</b> for stopping by today.</p>
              </div>
            </div>
          </main>
        </div> 
        {componentToRender}
      </div>
    );

  }

}





class Owner extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }

    console.log(lhemartInstance)
  }

  dismiss() {
    this.props.unmountMe();
  } 

  addAdmin(e) {
    
    var adminAddress = this.adminAddress.value.trim();
    if (web3.isAddress(adminAddress))
      lhemartInstance.addAdmin(adminAddress, {from : defaultAccount}); 
    else
      alert("Invalid Address")
  }

  removeAdmin(e) {
    
    var adminAddress = this.adminAddress.value.trim();
    if (web3.isAddress(adminAddress))
      lhemartInstance.removeAdmin(adminAddress, {from : defaultAccount}); 
    else
      alert("Invalid Address")
  }

  render() {
    return (
     <div>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <p><input type ="text" name="adminAddress" style={{width: '70%'}}  ref={(input) => this.adminAddress = input}/>
              <button onClick={(e) => this.addAdmin(this.adminAddress)}>Add Admin</button>
              <button onClick={(e) => this.removeAdmin(this.adminAddress)}>Remove Admin</button>
              </p>
            </div>
          </div>
        </main>
      </div>

    );
  }

}



class Admin extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  dismiss() {
    this.props.unmountMe();
  } 

  addStoreOwner(e) {
    
    var storeOwnerAddress = this.storeOwnerAddress.value.trim();
    if (web3.isAddress(storeOwnerAddress))
      lhemartInstance.addStoreOwner(storeOwnerAddress, {from : defaultAccount}); 
    else
      alert("Invalid Address")
  }

  removeStoreOwner(e) {
    
    var storeOwnerAddress = this.storeOwnerAddress.value.trim();
    if (web3.isAddress(storeOwnerAddress))
      lhemartInstance.removeStoreOwner(storeOwnerAddress, {from : defaultAccount}); 
    else
      alert("Invalid Address")
  }

  render() {
    return (
     <div>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <p><input type ="text" name="storeOwnerAddress" style={{width: '70%'}}  ref={(input) => this.storeOwnerAddress = input}/>
              <button onClick={(e) => this.addStoreOwner(this.storeOwnerAddress)}>Add StoreOwner</button>
              <button onClick={(e) => this.removeStoreOwner(this.storeOwnerAddress)}>Remove StoreOwner</button>
              </p>
            </div>
          </div>
        </main>
      </div>

    );
  }
}




// Modal.setAppElement('modalAnchor');

class StoreOwner extends Component {
  constructor(props) {
    super(props)

    this.state = {
      modalIsOpen: false,
      showRouter: false,
      endOfStoresReached: false,
      nextIndex : 0,
      storeNames: [],
      storeDescriptions: [],

    }
    

    this.showCreateStoreLayout = this.showCreateStoreLayout.bind(this);
    this.closeStoreLayout = this.closeStoreLayout.bind(this);
    this.createStore = this.createStore.bind(this);
    this.removeStore = this.removeStore.bind(this);
  }

  dismiss() {
    this.props.unmountMe();
  } 

  showCreateStoreLayout = () => 
  {
    this.setState({modalIsOpen: true});
  }

  closeStoreLayout = () => 
  {
    this.setState({modalIsOpen: false});
  }

  createStore = (e) =>
  {    
    var storeName = this.storeName.value.trim();
    var storeDescription = this.storeDescription.value.trim();
    
    if (storeName.length !== 0 && storeDescription.length !== 0)
    {
      lhemartInstance.createStore (storeName, storeDescription, {from : defaultAccount});
    }
    else
      alert("Please fill all empty fields");
  }

  getStores = (e) =>
  {
    lhemartInstance.getAllOwnerStores("0x0", this.state.nextIndex, {from : defaultAccount}).then((result) => {

      if (result)
      {
        this.setState({storeNames: this.state.storeNames.concat(result[1])});
        this.setState({storeDescriptions: this.state.storeDescriptions.concat(result[2])});
        this.setState({nextIndex: parseInt(result[3])});
        this.setState({endOfStoresReached: result[4]});

        if (!this.state.endOfStoresReached)
          this.getStores(e);
        else
        {
          this.setState({showRouter: true});
          // this.dismiss();
        }
      }                
      else
       alert("An error occurred");
    });
   
  }

  // //test fxn
  // sendEther = (e) =>
  // {
  //   lhemartInstance.sendTransaction({from:defaultAccount, to: lhemartInstance, value:50000000000000000000});
    
  // }

  removeStore(e) {
    
    var storeName = this.storeName.trim();

    if (storeName.length() !== 0)
    {
      lhemartInstance.removeStore(storeName, {from : defaultAccount, gas: 40000});
    }
    else
      alert("Enter a store name");
  }

  withdrawSalesBalance(e)
  {
    web3.eth.getBalance(lhemartInstance.address, function(err,res) {
      console.log(res.toString(10)); // because you get a BigNumber
    });

    lhemartInstance.withdrawSalesBalance({from : defaultAccount, gas: 30000}).then((result) =>
    {
      console.log(result)
    });
  }

  render() {
    return (

        <main className="container" id="modalAnchor">
          <div className="pure-g">
            <div className="pure-u-1-1">

              <button onClick={(e) => this.showCreateStoreLayout()}>Create Store</button>
              <Modal
                isOpen={this.state.modalIsOpen}
                onRequestClose={this.closeStoreLayout}
                style={customStyles}
                contentLabel="CreateStoreModal">

                <h2 ref={subtitle => this.subtitle = subtitle}>Enter the store details</h2> 
                <button onClick={this.closeStoreLayout}>close</button>               
                <div>Create Store</div>
                <form>
                  <p>
                  <input type = "text" ref={(input) => this.storeName = input} placeholder="Store Name"/>
                  <input type = "text" ref={(input) => this.storeDescription = input} placeholder="Store Description"/>
                  
                  </p>
                  <button onClick = {(e) => this.createStore()}>Create</button>
                  <button onClick = {(e) => this.closeStoreLayout()}>Cancel</button>
                </form>
              </Modal>
              <button onClick={(e) => this.getStores()}>Get Stores</button>
             <button onClick={(e) => this.withdrawSalesBalance()}>Withdraw Balance</button>

             <div>
              {this.state.showRouter ?
              <ManageStoresRouter storeNames={this.state.storeNames} storeDescriptionss={this.state.storeDescriptions} /> :
              null
              }
             </div>
            </div>
          </div>
        </main>
        // : }
      //render owner component here


    );
  }

}



class ManageStoresRouter extends Component {
  constructor(props) {
    super(props)

    this.state = {
      
    }

  }

  render() {
    return (
      <BrowserRouter >  
        <ManageStores storeNames={this.props.storeNames}/>
      </BrowserRouter> 
    );
  }

}



class ManageStores extends Component {
  constructor(props) {
    super(props)

    this.state = {
      
    } 

  }

  render() {
    return (
      <BrowserRouter >  
        <Switch>  
          <Route exact path='/' render={(props) => <DisplayStores {...props}  storeNames={this.props.storeNames} 
          storeDescriptions={this.props.storeDescriptions} />}  />
          {/* <Route path='/Store/:storeName' component={Store}/>    */}
        </Switch>   
      </BrowserRouter> 
    );
  }

}

class DisplayStores extends Component {
  constructor(props) {
    super(props)

    this.state = {      
      addItemModalIsOpen: false,
      thisComponent: this,
      storeNames: [],
      storeDescriptions: [],

      showItems: false,
      endOfItemsReached: false,
      itemNames: [],
      itemPrice: [],
      quantityLeft: [],
      nextIndex: 0, 

    }

    this.showAddItemToStoreLayout = this.showAddItemToStoreLayout.bind(this)
    this.addItemToStore = this.addItemToStore.bind(this);
    this.removeStore = this.removeStore.bind(this);
    this.closeAddItemToStoreLayout = this.closeAddItemToStoreLayout.bind(this);


    console.log("in DisplayStores")
    console.log("before lhemartInstance")
    console.log(lhemartInstance)

  }

  showAddItemToStoreLayout = (e) =>
  {
    this.setState({addItemModalIsOpen: true})
  }

  addItemToStore  = (e, storeName) =>
  {
    console.log(this.itemName.value)
    console.log(this.itemDescription.value)
    console.log(this.itemPrice.value * 10**18)
    console.log(this.itemQty.value)
    
    lhemartInstance.addItemToStore(storeName, this.itemName.value, this.itemDescription.value, (this.itemPrice.value * 10**18), 
      this.itemQty.value, {from : defaultAccount});       
  }
  
  removeStore = (e, storeName) => {   

    storeName = storeName.trim();

    if (storeName.length !== 0)
    {
      lhemartInstance.removeStore(storeName, {from : defaultAccount});
    }
    else
      alert("Invalid store");
  }

  closeAddItemToStoreLayout = () => 
  {
    this.setState({addItemModalIsOpen: false});
  }

  filterNamesAndDescriptions()
  {
    this.setState({storeNames: this.props.storeNames.filter(storeNames => storeNames !== "0x0000000000000000000000000000000000000000000000000000000000000000")})
    this.setState({storeDescriptions: this.props.storeDescriptions.filter(storeDescriptions => storeDescriptions !== "0x0000000000000000000000000000000000000000000000000000000000000000")})
            
  }

  getItemsInStore = (storeName, freshcall = false) =>
  {
    console.log("freshcall-"+freshcall)
    if (freshcall == true)
    {
      console.log("in freshcall==true")
      this.setState({itemNames: []});
      this.setState({itemPrice: []});
      this.setState({quantityLeft: []});        
      this.setState({nextIndex: 0});
      this.setState({endOfItemsReached: false});

         
    console.log("itemNames-"+this.state.itemNames)
    console.log("itemPrice-"+this.state.itemPrice)
    console.log("quantityLeft-"+this.state.quantityLeft)
    console.log("nextIndex-"+this.state.nextIndex)
    console.log("endOfItemsReached-"+this.state.endOfItemsReached)
    }


   


    lhemartInstance.getItemsInStore(defaultAccount, storeName, this.state.nextIndex, {from : defaultAccount}).then((result) => {

      if (result)
      {
        console.log("in result")
        console.log(result)
        this.setState({itemNames: this.state.itemNames.concat(result[0])});
        this.setState({itemPrice: this.state.itemPrice.concat(result[1])});
        this.setState({quantityLeft: this.state.quantityLeft.concat(result[2])});        
        this.setState({nextIndex: parseInt(result[3])});
        this.setState({endOfItemsReached: result[4]});

        if (!this.state.endOfItemsReached)
          this.getItemsInStore(storeName);
        else
        {
          this.setState({itemNames: this.state.itemNames.filter(itemName => itemName !== "0x0000000000000000000000000000000000000000000000000000000000000000")});
          this.setState({itemPrice:  this.state.itemPrice.filter(itemPrice => itemPrice !== "0x0000000000000000000000000000000000000000000000000000000000000000")});
          this.setState({quantityLeft: this.state.quantityLeft.filter(quantityLeft => quantityLeft !== "0x0000000000000000000000000000000000000000000000000000000000000000")});     

          this.setState({showItems: true});
        }

        console.log("end of  if (result)")
      }
      
    });

  }

  closeShowItems= () =>
  {
    this.setState({showItems: false})
  }

  listItems = () => {
    
    let items = this.state.itemNames
    let prices = this.state.itemPrice
    let qtyLeft = this.state.quantityLeft
    let list = []
    for (let i = 0; i < this.state.itemNames.length; i++) {
      var itemDetails = hex2ascii(items[i]) + ", Cost - " + (prices[i]/10**18) + "eth, Qty left - " + qtyLeft[i]
      list.push(<li>{itemDetails}</li>)
    }
    
    return list
  }


  render() {

    var thisComponent =  this;

    return (
      <main className="container" id="modalAnchor">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <b>Your Stores</b>

              <ul>
                   {this.props.storeNames.filter(storeName => storeName !== "0x0000000000000000000000000000000000000000000000000000000000000000")
                  .map(function(storeName, index){
                     
                    return <div><li key={index}>
                      <a href="#" onClick={(e) => thisComponent.getItemsInStore(storeName, true)} >
                      <img width = "60" height="60" src="http://hackathon-in-a-box.org/img/box.png"/>{hex2ascii(storeName)}
                    <br/>
                    </a>
                    </li> 

                    <Modal
                        isOpen={thisComponent.state.showItems}
                        onRequestClose={thisComponent.closeShowItems}
                        style={customStyles}
                        contentLabel="ShowItems">

                        <h2 ref={subtitle => thisComponent.subtitle = subtitle}>Items in Store</h2> 
                        <button onClick={thisComponent.closeShowItems}>close</button>  
                        
                        <ol>
                          {thisComponent.listItems()}
                        </ol>

                      </Modal>
                   




                    <button onClick={(e) => thisComponent.showAddItemToStoreLayout()}>Add Item</button>
                    <Modal
                        isOpen={thisComponent.state.addItemModalIsOpen}
                        onRequestClose={thisComponent.closeAddItemToStoreLayout}
                        style={customStyles}
                        contentLabel="AddItemToStoreModal">

                        <h2 ref={subtitle => thisComponent.subtitle = subtitle}>Enter the Item details</h2> 
                        <button onClick={thisComponent.closeAddItemToStoreLayout}>close</button>               
                        <div>Add Item to Store</div>
                        <form>
                          <p>
                          <input type = "text" ref={(input) => thisComponent.itemName = input} placeholder="Item Name"/>
                          <input type = "text" ref={(input) => thisComponent.itemDescription = input} placeholder="Item Description"/>
                          <input type = "text" ref={(input) => thisComponent.itemPrice = input} placeholder="Item Price"/>
                          <input type = "text" ref={(input) => thisComponent.itemQty = input} placeholder="Item Quantity"/>
                          
                          </p>
                          <button onClick = {(e) => thisComponent.addItemToStore(e, storeName)}>Add Item</button>
                          <button onClick = {(e) => thisComponent.closeAddItemToStoreLayout()}>Cancel</button>
                        </form>
                      </Modal>

                    {/* <button onClick={(e) => thisComponent.removeStore(e, storeName)}>Remove Store</button> */}
                    </div>
                    
                    })}
              </ul>

            </div>
          </div>
      </main>
    );
  }

}




class Buyer extends Component {
  constructor(props) {
    super(props)

    this.state = {

      storeOwners: [],
      storeNames: [],
      storeDescriptions: [],
    
      showStores: false,
	    showItems: false,
      endOfItemsReached: false,
      itemNames: [],
      itemPrice: [],
      quantityLeft: [],
      nextIndex: 0, 
      itemsNextIndex: 0, 
    }
  }

  getOwnersForBuyer = (e) =>
  {
    //get list of store owners first
      lhemartInstance.allStoreOwners(0, {from : defaultAccount}).then((result) => {
                
        if (result !== undefined || result !== null)
        {
          this.setState({storeOwners: this.state.storeOwners.concat(result)});

          this.getStoresForBuyer();
        }
        else
          alert("An error occurred");  
      }); 
    
  }

  getStoresForBuyer = (e) =>
  {
    lhemartInstance.getAllOwnerStores(this.state.storeOwners[0], this.state.nextIndex, {from : defaultAccount}).then((result) => {

      if (result)
      {
        this.setState({storeNames: this.state.storeNames.concat(result[1])});
        this.setState({storeDescriptions: this.state.storeDescriptions.concat(result[2])});
        this.setState({nextIndex: parseInt(result[3])});
        this.setState({endOfStoresReached: result[4]});

        if (!this.state.endOfStoresReached)
          this.getStoresForBuyer(e);
        else
        {
          this.setState({showStores: true});
        }
      }                
      else
       alert("An error occurred");
    });
   

  }

  getItemsInStore = (storeName, freshcall = false) =>
  {
    if (freshcall == true)
    {
      console.log("in freshcall==true")
      this.setState({itemNames: []});
      this.setState({itemPrice: []});
      this.setState({quantityLeft: []});        
      this.setState({itemsNextIndex: 0});
      this.setState({endOfItemsReached: false});

         
    console.log("itemNames-"+this.state.itemNames)
    console.log("itemPrice-"+this.state.itemPrice)
    console.log("quantityLeft-"+this.state.quantityLeft)
    console.log("nextIndex-"+this.state.itemsNextIndex)
    console.log("endOfItemsReached-"+this.state.endOfItemsReached)
    }


   


    lhemartInstance.getItemsInStore(this.state.storeOwners[0], storeName, this.state.itemsNextIndex, {from : defaultAccount}).then((result) => {

      if (result !==null && result !== undefined)
      {
        this.setState({itemNames: this.state.itemNames.concat(result[0])});
        this.setState({itemPrice: this.state.itemPrice.concat(result[1])});
        this.setState({quantityLeft: this.state.quantityLeft.concat(result[2])});        
        this.setState({itemsNextIndex: parseInt(result[3])});
        this.setState({endOfItemsReached: result[4]});

        if (!this.state.endOfItemsReached)
          this.getItemsInStore(storeName);
        else
        {
          this.setState({itemNames: this.state.itemNames.filter(itemName => itemName !== "0x0000000000000000000000000000000000000000000000000000000000000000")});
          this.setState({itemPrice:  this.state.itemPrice.filter(itemPrice => itemPrice !== "0x0000000000000000000000000000000000000000000000000000000000000000")});
          this.setState({quantityLeft: this.state.quantityLeft.filter(quantityLeft => quantityLeft !== "0x0000000000000000000000000000000000000000000000000000000000000000")});     

          this.setState({showItems: true});
        }

        console.log("end of  if (result)")
      }
      else
        alert("An error occurred.")
      
    });

  }

  closeShowItems= () =>
  {
    this.setState({showItems: false})
  }

  listItems = () => {
    
    let items = this.state.itemNames
    let prices = this.state.itemPrice
    let qtyLeft = this.state.quantityLeft
    let list = []
    for (var i = 0; i < items.length; i++) {
      var cost = this.state.itemPrice[i];
      var itemDetails = hex2ascii(items[i]) + ", Cost - " + (prices[i]/10**18) + "eth, Qty left - " + qtyLeft[i]
      list.push(<li>{itemDetails}
        <input type = "text" ref={(input) => i = input} placeholder="Quantity to buy"/>                          
        <button onClick = {(e) => this.purchaseItem(this.state.storeOwners[0], this.state.storeNames[0],
          i, cost)}>Buy</button></li>)

    }
    
    return list
  }

  purchaseItem = (storeOwner, storeName, i, cost) => {
    
    var qtyToBuy = (i.value > 0) ? 1 : parseInt(i.value)
    lhemartInstance.purchaseItem(storeOwner, storeName, this.state.itemNames[0] , qtyToBuy, {from: defaultAccount, value: parseInt(cost)});
  }   

  render() {

    let thisComponent = this;
    
    return (
     
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <button onClick = {(e) => this.getOwnersForBuyer()}>Check out Stores</button>
              <br/><br/>
              <b>Some Stores</b>

              <ul>
                   {this.state.storeNames.filter(storeName => storeName !== "0x0000000000000000000000000000000000000000000000000000000000000000")
                  .map(function(storeName, index){
                     
                    return <div><li key={index}>
                      <a href="#" onClick={(e) => thisComponent.getItemsInStore(storeName, true)} >
                      <img width = "60" height="60" src="http://hackathon-in-a-box.org/img/box.png"/>{hex2ascii(storeName)}
                    <br/>
                    </a>
                    </li> 

                    <Modal
                        isOpen={thisComponent.state.showItems}
                        onRequestClose={thisComponent.closeShowItems}
                        style={customStyles}
                        contentLabel="ShowItems">

                        <h2 ref={subtitle => thisComponent.subtitle = subtitle}>Items in Store</h2> 
                        <button onClick={thisComponent.closeShowItems}>close</button>  
                        
                        <ol>
                          {thisComponent.listItems()}
                        </ol>

                      </Modal>
                      </div>
                  })}
                </ul>
            </div>
          </div>
        </main>

    );
  }

}


export default App
