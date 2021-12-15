const AsiaUniversityBank = artifacts.require("./AsiaUniversityBank.sol");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(AsiaUniversityBank);
  const AU = await AsiaUniversityBank.deployed()
  await AU.setBalance({from: accounts[0]})
};
