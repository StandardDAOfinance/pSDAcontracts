import "dotenv/config";
import "@nomiclabs/hardhat-waffle";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getDiamondFacet } from "../src/lib/deploy";

/**
 * mint a list of tokens from a json file
 */
task("get-attribute", "get token attribute")
  .addParam("token", "The token id")
  .addParam("attribute", "The token attribute")
  .setAction(async ({ token, attribute }, hre: HardhatRuntimeEnvironment) => {
    // the generative token factory
    const tokenMinterContract = await getDiamondFacet(
      hre,
      "TokenAttributeFacet"
    );
    const tx = await tokenMinterContract.getAttribute(token, attribute);
    console.log(`${attribute}: ${tx}`);
  });

/**
 * mint a list of tokens from a json file
 */
task("set-attribute", "set the token attribute")
  .addParam("token", "The token id")
  .addParam("attribute", "The token attribute")
  .addParam("value", "The attribute value")
  .setAction(
    async ({ token, attribute, value }, hre: HardhatRuntimeEnvironment) => {
      // the generative token factory
      const tokenMinterContract = await getDiamondFacet(
        hre,
        "TokenAttributeFacet"
      );
      const tx = await tokenMinterContract.setAttribute(
        token,
        attribute,
        value
      );
      await tx.wait();
      const attr = await tokenMinterContract.getAttribute(token, attribute);
      console.log(`${value}: ${attr}`);
    }
  );
