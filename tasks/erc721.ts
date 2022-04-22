import "dotenv/config";

import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import {
  getContractDeployment,
  getContractDeploymentAt,
} from "../src/lib/deploy";

// check to see if this contract is an erc721 contract
task("is-erc721", "Check to see if this contract is an erc721 contract")
  .addParam("address", "The address to check")
  .setAction(async ({ address }, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const checker = await getContractDeployment(hre, "InterfaceChecker");
    console.log("\n\nNextgem - check interface\n");
    const iserc721 = await checker.iserc721(address, { gasLimit: 200000 });
    console.log("is erc721", iserc721);
  });

task("send-721", "send a token to a user")
  .addParam("address", "The target address")
  .addParam("token", "The erc721 address")
  .addParam("id", "The token id")
  .setAction(
    async (
      { address, token, id },
      hre: HardhatRuntimeEnvironment
    ): Promise<void> => {
      const multiToken = await getContractDeploymentAt(hre, "erc721", token);
      const signerAddress = (await hre.ethers.getSigners())[0];
      const ownerAddress = await signerAddress.getAddress();
      const tx = await multiToken.safeTransferFrom(ownerAddress, address, id);
      await tx.wait();
      console.log(`transfer tx: ${tx.hash}`);
    }
  );

// task to call the uri methood of the multitoken contract for a given tokenhash
task(
  "uri-721",
  "Call the tokenUri method of the erc721 contract for a given tokenhash"
)
  .addParam("id", "The tokenhash")
  .setAction(async ({ tokenid }, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const multiToken = await getContractDeployment(hre, "erc721");
    console.log("token-uri:", await multiToken.tokenURI(tokenid));
  });
