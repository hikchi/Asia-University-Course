const AsiaUniversityBankSol = artifacts.require("./AsiaUniversityBankSol.sol");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(AsiaUniversityBankSol);
  const AU = await AsiaUniversityBankSol.deployed()
  await AU.setBalance({from: accounts[0]})
};
