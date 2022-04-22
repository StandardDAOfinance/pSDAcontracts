import "dotenv/config";
import "@nomiclabs/hardhat-waffle";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BigNumber } from "ethers";
import { getDiamondFacet } from "../src/lib/deploy";

async function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * mint a single token given its values
 */
task("mint-token", "mint a token")
  .addParam("receiver", "The receiver address")
  .setAction(async ({ receiver }, hre: HardhatRuntimeEnvironment) => {
    const tokenMinterContract = await getDiamondFacet(hre, "TokenMinterFacet");

    async function mintAndWait(): Promise<BigNumber> {
      return new Promise(async (resolve, reject): Promise<any> => {
        tokenMinterContract.on(
          "Token",
          async (receiver: string, tokenId: BigNumber) => {
            console.log(`token minted: ${receiver} ${tokenId}`);
            resolve(tokenId);
          }
        );

        const tx = await tokenMinterContract.mint(receiver, {
          gasLimit: 800000,
        });
        await tx.wait();
        console.log(`mint tx: ${tx.hash}`);
      });
    }
    await mintAndWait();
  });


/**
 * mint a single token given its values
 */
task("set-minted-token", "Add a controller to the token")
  .addParam("address", "The token address")
  .setAction(async ({ address }, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const multiToken = await getDiamondFacet(hre, "TokenMinterFacet");
    console.log("\n\nNextgem - set minted token\n");
    await multiToken.setToken(address);
  });
