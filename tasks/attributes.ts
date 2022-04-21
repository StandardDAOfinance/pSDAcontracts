
import "dotenv/config";
import "@nomiclabs/hardhat-waffle";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getDiamondFacet } from "../src/lib/deploy";


/**
* mint a list of tokens from a json file
*/
task('get-token-power', 'get token power')
  .addParam('token', 'The token id')
  .setAction(async ({ token }, hre: HardhatRuntimeEnvironment) => {

    // the generative token factory
    const tokenMinterContract = await getDiamondFacet(hre, "TokenAttributeFacet");
    const tx = await tokenMinterContract.getAttribute(
      token,
      'Power'
    );
    console.log(`power: ${tx}`);

  });

/**
 * mint a list of tokens from a json file
 */
task('staked-token-power', 'stake a token')
  .addParam('token', 'The token id')
  .setAction(async ({ token }, hre: HardhatRuntimeEnvironment) => {

    // the generative token factory
    const attributeMutationPoolFacet = await getDiamondFacet(hre, "AttributeMutationPoolFacet");
    const tx = await attributeMutationPoolFacet.getAccruedValue(
      token
    );
    console.log(`power (with accrued value): ${tx}`);

  });