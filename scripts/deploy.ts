// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');


  // deploy the token contract
  const PSDAToken = await ethers.getContractFactory("PSDAToken");
  const token = await PSDAToken.deploy("PSDA Token", "PSDA");
  await token.deployed();
  console.log("token deployed to:", token.address);
  
  // initialize the token
  const tokenContract = await ethers.getContractAt("PSDAToken", token.address);
  await tokenContract.initialize(4, 60000000, 1000000);


  // set the DAI address here
  const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

  // deploy the presale contract
  const PSDAPresale = await ethers.getContractFactory("PSDAPresale");
  const tokensale = await PSDAPresale.deploy();
  await tokensale.deployed();
  console.log("tokensale deployed to:", tokensale.address);

  // get the presale contract and then initialize it
  const tokensaleContract = await ethers.getContractAt("PSDAPresale", tokensale.address);
  const tx = await tokensaleContract.initialize(token.address, daiAddress);
  await tx.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
