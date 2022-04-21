import "dotenv/config";
import "@nomiclabs/hardhat-waffle";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getDiamondFacet, getContractDeployment } from "../src/lib/deploy";
import { BigNumber } from "ethers";

async function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * mint a list of tokens from a json file
 */
task("stake-token", "stake a token")
  .addParam("token", "The token id")
  .setAction(async ({ token }, hre: HardhatRuntimeEnvironment) => {
    // the generative token factory
    const tokenContract = await getContractDeployment(hre, "ERC1155");
    const tokenMinterContract = await getDiamondFacet(
      hre,
      "AttributeMutationPoolFacet"
    );

    //event GemTokenMinted(address indexed receiver, uint256 indexed tokenId, uint256 indexed auditHash, uint256 amount);
    tokenMinterContract.on(
      "TokenDeposited",
      (staker: string, tokenId: BigNumber) => {
        console.log(`TokenDeposited: ${staker} ${tokenId}`);
      }
    );

    tokenContract.on(
      "ApprovalForAll",
      async (account: string, operator: string, approved: boolean) => {
        console.log(`TokenDeposited: ${account} ${operator} ${approved}`);
        const tx = await tokenMinterContract.stake(token, { gasLimit: 800000 });
        await tx.wait();
      }
    );

    let tx = await tokenContract.setApprovalForAll(
      tokenMinterContract.address,
      true,
      { gasLimit: 400000 }
    );
    await tx.wait();

    console.log("pausing...");
    await pause(30000);
  });

/**
 * mint a list of tokens from a json file
 */
task("unstake-token", "stake a token")
  .addParam("token", "The token id")
  .setAction(async ({ token }, hre: HardhatRuntimeEnvironment) => {
    // the generative token factory
    const tokenMinterContract = await getDiamondFacet(
      hre,
      "AttributeMutationPoolFacet"
    );

    //event GemTokenMinted(address indexed receiver, uint256 indexed tokenId, uint256 indexed auditHash, uint256 amount);
    tokenMinterContract.on(
      "TokenWithdrawn",
      (staker: string, tokenId: BigNumber, totalAccrued: BigNumber) => {
        console.log(`TokenWithdrawn: ${staker} ${tokenId} ${totalAccrued}`);
      }
    );

    const tx = await tokenMinterContract.unstake(token, { gasLimit: 400000 });
    await tx.wait();

    await pause(30000);
  });
