import "dotenv/config";
import "@nomiclabs/hardhat-waffle";
import { task, subtask } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BigNumber, Contract } from "ethers";
import { getDiamondFacet } from "../src/lib/deploy";

async function pause(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * mint a single token given its values
 */
 task('mint-token', 'mint a token')
 .addParam('receiver', 'The receiver address')
 .setAction(
   async (
     {receiver},
     hre: HardhatRuntimeEnvironment
   ) => {
 
     const tokenMinterContract =await getDiamondFacet(hre, 'TokenMinterFacet');
 
     async function mintAndListAndWait(): Promise<BigNumber> {
       return new Promise(async (resolve, reject): Promise<any> => {
 
         tokenMinterContract.on(
           'Token',
           async (
             receiver: string,
             tokenId: BigNumber,
           ) => {
             console.log(
               `Token: ${receiver} ${tokenId}`
             );
             resolve(tokenId);
           }
         );
 
         const tx = await tokenMinterContract.mint(
           receiver,
           {gasLimit: 800000}
         );
         await tx.wait();
         console.log(`mint tx: ${tx.hash}`);
       });
     }
     await mintAndListAndWait();
     console.log('pausing...')
     await pause(30000);
 
   }
 );
 
 task('burn-token', 'burn a token')
   .addParam('secret', 'The secret')
   .addParam('id', 'The id')
   .setAction(
     async (
       { secret, id },
       hre: HardhatRuntimeEnvironment
     ) => {
       const tokenMinterContract = await getDiamondFacet(hre, 'TokenMinterFacet');
       const tx = await tokenMinterContract.burn(
         secret,
         tokenMinterContract.address,
         id,
         1);
       await tx.wait();
       console.log(`burn tx: ${tx.hash}`);
   });
 