var LheMart = artifacts.require("LheMart");
//var Vesting = artifacts.require("Vesting");
// var DeployedAddresses = artifacts.require("DeployedAddresses");


contract('LheMart', function(accounts) {

	var owner = accounts[0];
    var lheMartInstance;
	var testAddress = "0xee370bbaf46ed8af654cd9987d64652dedf5f63e";
    var adminAddress = "0x99348969332828A99E395ebaAF2E79010f77acCe";

  //Test 1 - add admin
  it("should add admin correctly", function() {
	 
     return LheMart.new().then(function(instance) {
          lheMartInstance = instance;

        }).then(function() {
         lheMartInstance.addAdmin(testAddress, { from: owner});
         
         return lheMartInstance.participantRoles(testAddress);

        }).then(function(role) {

          assert.equal(role, "admin", "Admin not correctly added");
       });
	});
	
  //Test 2 - add admin
  it("should remove admin correctly", function() {

     return LheMart.new().then(function(instance) {
          lheMartInstance = instance;

        }).then(function() {
         lheMartInstance.removeAdmin(testAddress, { from: owner});
         
         return lheMartInstance.participantRoles(testAddress);

        }).then(function(role) {

          assert.equal(role, "", "Admin not correctly removed");
       });
	});
	
	//Test 3 - add store owner
  it("should add a store owner correctly", function() {
		
		return LheMart.new().then(function(instance) {
	 
		  lheMartInstance = instance;
		  
        }).then(function() {
		
		  lheMartInstance.addAdmin(adminAddress, { from: owner});
		 }).then(function() {
		
		  lheMartInstance.addStoreOwner(testAddress, { from: adminAddress});
		 }).then(function() {
		
		  return lheMartInstance.participantRoles(testAddress);
		 }).then(function(role) {

          assert.equal(role, "storeowner", "Store owner not correctly added");
       });
	});
	
	//Test 4 - remove store owner
  it("should remove a store owner correctly", function() {
  
		return LheMart.new().then(function(instance) {
	 
		  lheMartInstance = instance;
		  
        }).then(function() {
		
		  lheMartInstance.addAdmin(adminAddress, { from: owner});
		 }).then(function() {
		
		  lheMartInstance.addStoreOwner(testAddress, { from: adminAddress});
		 }).then(function() {
		
		  lheMartInstance.removeStoreOwner(testAddress, { from: adminAddress});
		 }).then(function() {
		
		  return lheMartInstance.participantRoles(testAddress);
		 }).then(function(role) {

          assert.equal(role, "", "Store owner not correctly removed");
       });
	});
	
	//Test 5 - create store
	it("should create a store correctly", function() {
  		
		return LheMart.new().then(function(instance) {
	 
		  lheMartInstance = instance;
		  
        }).then(function() {
		
		  lheMartInstance.addAdmin(adminAddress, { from: owner});
		 }).then(function() {
		
		  lheMartInstance.addStoreOwner(testAddress, { from: adminAddress});
		 }).then(function() {
		
		  lheMartInstance.createStore("My store", "A store to sell things I want to sell.", { from: testAddress});
		 }).then(function() {
		
		  return lheMartInstance.stores(testAddress).length;
		 }).then(function(storesLength) {

          assert.equal(storesLength, 1, "Store not correctly added");
       });
	});
	
	
});
