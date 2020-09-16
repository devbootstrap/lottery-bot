const SimpleCounter = artifacts.require("SimpleCounter");

module.exports = function(_deployer) {
  _deployer.deploy(SimpleCounter);
};
