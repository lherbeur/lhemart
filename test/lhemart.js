const hex2ascii = require('hex2ascii')

var LheMart = artifacts.require("LheMart");


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

		  var roleValue = hex2ascii(role);
          assert.equal(roleValue, "admin", "Admin not correctly added");
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

		  var roleValue = hex2ascii(role);
          assert.equal(roleValue.trim(), "0x0000000000", "Admin not correctly removed");
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

		  var roleValue = hex2ascii(role);
          assert.equal(roleValue, "storeowner", "Store owner not correctly added");
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

		  var roleValue = hex2ascii(role);
          assert.equal(roleValue, "0x0000000000", "Store owner not correctly removed");
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
		
		  lheMartInstance.createStore("First store", "A first store to sell things I want to sell.", { from: testAddress});
		 }).then(function() {
		
		  lheMartInstance.createStore("Second store", "A second store to sell things I want to sell.", { from: testAddress});
		 }).then(function() {
		
		  return lheMartInstance.storeIndices(testAddress, "Second store"); 
		  
		 }).then(function(storeIndex) {

		  var storeIndexValue = parseInt(storeIndex);
          assert.equal(storeIndexValue, 1, "Store not correctly added");
       });
	});
	
	
});
