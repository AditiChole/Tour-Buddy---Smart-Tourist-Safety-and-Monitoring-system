const TouristID = artifacts.require('TouristID');

module.exports = async function deploy(deployer) {
  await deployer.deploy(TouristID);
};
