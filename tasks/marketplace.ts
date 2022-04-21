import "dotenv/config";
import "@nomiclabs/hardhat-waffle";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getDiamondFacet, getContractDeployment } from "../src/lib/deploy";
import { BigNumber } from "ethers";
import fs from "fs";

/**
 * mint a single token given its values
 */
task("purchase-token", "purchase an item from the marketplace")
  .addParam("itemid", "The item id of the marketplace listing")
  .setAction(async ({ itemid, attach }, hre: HardhatRuntimeEnvironment) => {
    // the generative token factory
    const marketplaceContract = await getDiamondFacet(hre, "MarketplaceFacet");
    const multiToken = await getContractDeployment(hre, "ERC1155");
    const marketItem = await marketplaceContract.fetchItem(itemid);
    const itemPrice = marketItem[5];

    const owner = (await hre.ethers.getSigners())[0];
    console.log("account", await owner.getAddress());
    async function purchaseAndWait(itemid: any): Promise<void> {
      return new Promise(async (resolve, reject) => {
        marketplaceContract.on(
          "Sales",
          async (
            itemId: string,
            purchaser: BigNumber,
            price: string,
            quantity: BigNumber,
            tokenId: BigNumber
          ) => {
            console.log(
              `ItemSold: ${itemId} ${purchaser} ${price} ${quantity} ${tokenId}`
            );
            resolve();
          }
        );

        const tx = await marketplaceContract.purchaseItem(
          multiToken.address,
          itemid,
          { gasLimit: 400000, value: itemPrice }
        );
        console.log(`purchaseItem tx: ${tx.hash}`);
        await tx.wait();
      });
    }
    await purchaseAndWait(itemid);
  });

/**
 * mint a single token given its values
 */
task("list-token", "list a token")
  .addParam("tokenhash", "The token hash")
  .addParam("price", "The token price in ETH")
  .setAction(async ({ tokenhash, price }, hre: HardhatRuntimeEnvironment) => {
    // the contracts
    const multiToken = await getContractDeployment(hre, "ERC1155Facet");
    const marketplaceContract = await getDiamondFacet(hre, "MarketplaceFacet");

    const ownerAddress = (await hre.ethers.getSigners())[0];

    async function listAndWait(): Promise<void> {
      return new Promise(async (resolve, reject) => {
        marketplaceContract.on(
          "Listings",
          async (
            itemId: string,
            nftContract: BigNumber,
            tokenId: BigNumber,
            seller: BigNumber,
            owner: string,
            price: string,
            sold: boolean
          ) => {
            console.log(
              `Listings: ${itemId} ${nftContract} ${tokenId} ${seller} ${owner} ${price} ${sold}`
            );
            resolve();
          }
        );
        const tx = await marketplaceContract.listItem(
          multiToken.address,
          await ownerAddress.getAddress(),
          tokenhash,
          hre.ethers.utils.parseEther(price),
          1,
          false,
          { gasLimit: 400000 }
        );
        console.log(`list tx: ${tx.hash}`);
        await tx.wait();
      });
    }
    await listAndWait();
    process.exit(0);
  });

/**
 * mint a list of tokens from a json file
 */
task("mint-token-list", "mint a token given its gem details")
  .addParam("secret", "The naster secret used to make audit hashes")
  .addParam("list", "The path to the token list to mint")
  .setAction(async ({ secret, list }, hre: HardhatRuntimeEnvironment) => {
    // the generative token factory
    const tokenMinterContract = await getContractDeployment(hre, "TokenMinter");

    //event GemTokenMinted(address indexed receiver, uint256 indexed tokenId, uint256 indexed auditHash, uint256 amount);
    tokenMinterContract.on(
      "GemTokenMinted",
      (
        receiver: string,
        tokenId: BigNumber,
        auditHash: BigNumber,
        amount: BigNumber
      ) => {
        console.log(
          `GemTokenMinted: ${receiver} ${tokenId} ${auditHash} ${amount}`
        );
      }
    );
    // read the given list of tokens
    const data = JSON.parse(fs.readFileSync(list, "utf8"));
    if (!data.tokens) throw new Error("no tokens found in list");

    // iterate over the tokens, minting one at a time
    for (const token of data.tokens) {
      const { receiver, collection, gianumber } = token;
      // string memory secret, address receiver, string memory collection, string memory giaNumber, uint256 amount
      const tx = await tokenMinterContract.mint(
        secret,
        receiver,
        collection,
        gianumber,
        1
      );
      await tx.wait();
    }
  });
//   task('list-one-token', 'mint a token given its gem details and list it in the marketplace')
//   .addParam('tokenid', 'The token id')
//   .addParam('price', 'The price')
// .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment): Promise<void> => {
//   await hre.run('mint-token', {
//      ...taskArgs,
//      action: 'one'
//    });
// });
// /**
//  * mint a single token given its values
//  */
//  subtask('list-token', 'list a token given its gem details and list it in the marketplace')
//  .addParam('action', `"one" or "all"`)
//  .addParam('tokenid', 'The token id')
//  .addParam('price', 'The price')
//  .setAction(
//     async (
//       {action, tokenid, price},
//       hre: HardhatRuntimeEnvironment
//     ) => {
//       if (!action.match(/^(one|all)$/)) {
//         throw new Error(`action must be "one" or "all"`);
//       }

//       const tokenMinterContract =await getDiamondFacet(hre, 'TokenMinterFacet');
//       const marketplaceContract =await getDiamondFacet(hre, 'MarketplaceFacet');
//       const multiToken = await getContractDeployment(hre, 'MultiToken');
//       await multiToken.addController(tokenMinterContract.address)
//       await tokenMinterContract.setToken(multiToken.address);

//       async function listAndWait(tokenId: any, price: any): Promise<void> {
//         return new Promise(async (resolve, reject) => {
//           marketplaceContract.on(
//             'Listings',
//             async (
//               itemId: string,
//               nftContract: BigNumber,
//               tokenId: BigNumber,
//               seller: BigNumber,
//               owner: string,
//               price: string,
//               sold: boolean
//             ) => {
//               console.log(
//                 `Listings: ${itemId} ${nftContract} ${tokenId} ${seller} ${owner} ${price} ${sold}`
//               );
//               resolve();
//             }
//           );
//           const ownerAddress = (await hre.ethers.getSigners())[0];
//           const tx = await marketplaceContract.listItem(
//             multiToken.address,
//             await ownerAddress.getAddress(),
//             tokenId,
//             price,
//             1,
//             false,
//             {gasLimit: 500000}
//           );
//           console.log(`list tx: ${tx.hash}`);
//           await tx.wait();
//         });
//       }
//       await listAndWait(tokenid, hre.ethers.utils.parseEther(price));
//       console.log('pausing...')
//       await pause(30000);

//     }
//   );
