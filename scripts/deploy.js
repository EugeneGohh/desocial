const hre = require("hardhat");

const main = async () => {
  const messageContractFactory = await hre.ethers.getContractFactory("Message");
  const messageContract = await messageContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.001"),
  });

  await messageContract.deployed();

  console.log("Message address: ", messageContract.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
