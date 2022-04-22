import "dotenv/config";

import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { getContractDeployment } from "../src/lib/deploy";

// task to call the uri methood of the multitoken contract for a given tokenhash
task(
  "contract-uri",
  "Call the contracturi method of the multitoken contract"
).setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  // get the multitoken contract
  const multiToken = await getContractDeployment(hre, "erc721");
  console.log("contract uri", await multiToken.contractURI());
});

// task to call the uri methood of the multitoken contract for a given tokenhash
task(
  "set-contract-uri",
  "Call the contracturi method of the multitoken contract"
)
  .addParam("uri", "The uri")
  .setAction(async ({ uri }, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const multiToken = await getContractDeployment(hre, "erc721");
    const tx = await multiToken.setUri(uri);
    await tx.wait();
    console.log("contract uri", await multiToken.contractURI());
  });
