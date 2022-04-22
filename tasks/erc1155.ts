import "dotenv/config";

import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import {
  getContractDeployment,
  getContractDeploymentAt,
} from "../src/lib/deploy";

// check to see if this contract is an erc1155 contract
task("is-erc1155", "Check to see if this contract is an erc1155 contract")
  .addParam("address", "The address to check")
  .setAction(async ({ address }, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const checker = await getContractDeployment(hre, "InterfaceChecker");
    console.log("\n\nNextgem - check interface\n");
    const isErc1155 = await checker.isERC1155(address, { gasLimit: 200000 });
    console.log("is erc1155", isErc1155);
  });

task("send-1155", "send a token to a user")
  .addParam("address", "The target address")
  .addParam("token", "The erc1155 address")
  .addParam("id", "The token id")
  .addParam("amount", "The token id")
  .setAction(
    async (
      { address, token, id, amount },
      hre: HardhatRuntimeEnvironment
    ): Promise<void> => {
      const multiToken = await getContractDeploymentAt(hre, "ERC1155", token);
      const signerAddress = (await hre.ethers.getSigners())[0];
      const ownerAddress = await signerAddress.getAddress();
      const tx = await multiToken.safeTransferFrom(
        ownerAddress,
        address,
        id,
        amount,
        ""
      );
      await tx.wait();
      console.log(`transfer tx: ${tx.hash}`);
    }
  );

// task to call the uri methood of the multitoken contract for a given tokenhash
task(
  "uri-1155",
  "Call the uri method of the erc1155 contract for a given tokenhash"
)
  .addParam("id", "The tokenhash")
  .setAction(async ({ tokenid }, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const multiToken = await getContractDeployment(hre, "ERC1155");
    console.log("uri:", await multiToken.uri(tokenid));
  });

// task to call the uri methood of the multitoken contract for a given tokenhash
task("set-1155-data", "Set the token data")
  .addParam("name", "The name of the token")
  .addParam("symbol", "The symbol of the token")
  .addParam("baseuri", "The baseuri of the token")
  .setAction(
    async ({ name, symbol, baseuri }, hre: HardhatRuntimeEnvironment) => {
      // get the multitoken contract
      const multiToken = await getContractDeployment(hre, "ERC1155");
      console.log("\n\nNextgem - call uri\n");
      let tx = await multiToken.setUri(baseuri, { gasLimit: 200000 });
      await tx.wait();
      tx = await multiToken.setName(name, { gasLimit: 200000 });
      await tx.wait();
      tx = await multiToken.setSymbol(symbol, { gasLimit: 200000 });
      await tx.wait();
      console.log("name", await multiToken.name());
      console.log("symbol", await multiToken.symbol());
    }
  );

// task to call the uri methood of the multitoken contract for a given tokenhash
task("1155-data", "Get the token data").setAction(
  async (_, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const multiToken = await getContractDeployment(hre, "ERC1155");
    console.log("base uri", await multiToken.uriBase());
    console.log("name", await multiToken.name());
    console.log("symbol", await multiToken.symbol());
  }
);