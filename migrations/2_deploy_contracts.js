var SafeMath = artifacts.require("./SafeMath.sol");
var LheMart = artifacts.require("./LheMart.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.deploy(LheMart);
};
