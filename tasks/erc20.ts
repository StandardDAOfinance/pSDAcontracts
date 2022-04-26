import "dotenv/config";

import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import {
  getContractDeployment,
  getContractDeploymentAt
} from "../src/lib/deploy";

// check to see if this contract is an erc721 contract
task("get-allowance", "Get the allowance for the operator / spender combo")
  .addParam("operator", "The operator  to check")
  .addParam("spender", "The spender to check")
  .setAction(async ({ operator, spender }, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const token = await getContractDeployment(hre, "ERC20");
    const allowance = await token.allowance(operator, spender);
    console.log("allowance", allowance.toString());
  });

// 
task("approve", "Approve the given operator for this account")
  .addParam("operator", "The operator address to approve")
  .addParam("amount", "Amount to approve operator")
  .setAction(async ({ operator, amount }, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const token = await getContractDeployment(hre, "ERC20");
    const ownerAddress = (await hre.ethers.getSigners())[0];

    const tx = await token.approve(operator, amount);
    await tx.wait();
    let allowance = await token.allowance(ownerAddress, ownerAddress);
    console.log("allowance", allowance.toString());
  });

task("approve-transfer", "Approve the given spender for transfer")
  .addParam("spender", "The operator address to approve")
  .addParam("amount", "Amount to approve operator")
  .setAction(async ({ operator }, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const token = await getContractDeployment(hre, "ERC20");
    const ownerAddress = (await hre.ethers.getSigners())[0];

    const tx = await token.approveTransfer(operator);
    await tx.wait();
    let allowance = await token.allowance(ownerAddress, ownerAddress);
    console.log("allowance", allowance.toString());
  });

task("balance-of", "Get the balance of the given erc20 token for the given address")
  .addParam("address", "The address of the token to check")
  .addParam("token", "The erc20 address")
  .setAction(async ({ address, token }, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const _token = await getContractDeploymentAt(hre, "ERC20", token);

    let bal = await _token.balanceOf(address);
    console.log("balance", bal.toString());
  });

  task("transfer", "Transfer the token to the given address")
  .addParam("address", "The address to send to")
  .addParam("amount", "The erc20 address")
  .setAction(async ({ address, amount }, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const _token = await getContractDeployment(hre, "ERC20");
    let tx = await _token.transfer(address, amount);
    await tx.wait();
    let bal = await _token.balanceOf(address);
    console.log("balance", bal.toString());
  });
