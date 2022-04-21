import "dotenv/config";
import "@nomiclabs/hardhat-waffle";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getDiamondFacet, getContractDeployment } from "../src/lib/deploy";

// task to call the uri methood of the multitoken contract for a given tokenhash
task(
  "tokenuri",
  "Call the uri method of the multitoken contract for a given tokenhash"
)
  .addParam("tokenid", "The tokenhash")
  .setAction(async ({ tokenid }, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const multiToken = await getContractDeployment(hre, "ERC1155");
    console.log("\n\nNextgem - call uri\n");
    console.log(await multiToken.uri(tokenid));
  });

// task to call the uri methood of the multitoken contract for a given tokenhash
task(
  "contracturi",
  "Call the contracturi method of the multitoken contract"
).setAction(async ({ tokenid }, hre: HardhatRuntimeEnvironment) => {
  // get the multitoken contract
  const multiToken = await getDiamondFacet(hre, "ERC1155SetContractURIFacet");
  console.log("\n\nNextgem - call contractURI\n");
  console.log(await multiToken.contractURI());
});

// task to call the uri methood of the multitoken contract for a given tokenhash
task("add-token-controller", "Add a controller to the token")
  .addParam("controller", "The controller address")
  .setAction(async ({ controller }, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const multiToken = await getContractDeployment(hre, "ERC1155");
    console.log("\n\nNextgem - add controller\n");
    await multiToken.addController(controller);
  });

task("set-minted-token", "Add a controller to the token")
  .addParam("address", "The token address")
  .setAction(async ({ address }, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const multiToken = await getDiamondFacet(hre, "TokenMinterFacet");
    console.log("\n\nNextgem - set minted token\n");
    await multiToken.setToken(address);
  });

// task to call the uri methood of the multitoken contract for a given tokenhash
task("set-token-data", "Set the token data")
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
task("token-data", "Get the token data").setAction(
  async ({}, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const multiToken = await getContractDeployment(hre, "ERC1155");
    console.log("base uri", await multiToken.uriBase());
    console.log("name", await multiToken.name());
    console.log("symbol", await multiToken.symbol());
  }
);

// task to call the uri methood of the multitoken contract for a given tokenhash
task("setbaseuri", "Set the token base URI")
  .addParam("uri", "The uri")
  .setAction(async ({ uri }, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const multiToken = await getContractDeployment(hre, "ERC1155");
    console.log("\n\nNextgem - call uri\n");
    const tx = await multiToken.setUriBase(uri, { gasLimit: 200000 });
    await tx.wait();
    console.log(await multiToken.uriBase());
  });

// task to get contract addresses
task('contract-addresses', 'get the contract addresses')
  .setAction(async ({}, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    // const multiToken = await getContractDeployment(hre, 'ERC1155');
    // const diamond = await getDiamondFacet(hre, 'TokenMinterFacet');
    // // get accounta ddress
    const accountAddress = (await hre.ethers.getSigners())[0];
    console.log('\n\nNextgem - get addresses\n');
    // console.log('ERC1155 token', multiToken.address);
    // console.log('diamond', diamond.address);
    console.log('account', await accountAddress.getAddress());
  });

  
task('transfer-ownership', 'Transfer the diamond ownership to a new address')
.addParam('address', 'The target address')
.setAction(async (taskArgs, hre: HardhatRuntimeEnvironment): Promise<void> => {

  const ownership = await getDiamondFacet(hre, 'OwnershipFacet');
  const tx = await ownership.transferOwnership(taskArgs.address, {gasLimit: 50000});
  await tx.wait();

  console.log(`transfer tx: ${tx.hash}`);

});
