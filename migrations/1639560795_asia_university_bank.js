const AsiaUniversityBank = artifacts.require("./AsiaUniversityBank.sol");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(AsiaUniversityBank);
};
