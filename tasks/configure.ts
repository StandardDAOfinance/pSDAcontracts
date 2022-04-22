import "dotenv/config";
import "@nomiclabs/hardhat-waffle";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getDiamondFacet, getContractDeploymentAt } from "../src/lib/deploy";

// task to call the uri methood of the multitoken contract for a given tokenhash
task("add-contract-controller", "Add a controller to the contract")
  .addParam("contract", "The contract address")
  .addParam("controller", "The controller address")
  .setAction(
    async ({ contract, controller }, hre: HardhatRuntimeEnvironment) => {
      // get the multitoken contract
      const multiToken = await getContractDeploymentAt(
        hre,
        "Controllable",
        contract
      );
      await multiToken.addController(controller);
      console.log("add controller", contract, controller);
    }
  );

task("transfer-ownership", "Transfer the diamond ownership to a new address")
  .addParam("address", "The target address")
  .setAction(
    async (taskArgs, hre: HardhatRuntimeEnvironment): Promise<void> => {
      const ownership = await getDiamondFacet(hre, "OwnershipFacet");
      const tx = await ownership.transferOwnership(taskArgs.address, {
        gasLimit: 50000,
      });
      await tx.wait();

      console.log(`transfer tx: ${tx.hash}`);
    }
  );
