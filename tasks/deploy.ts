import 'dotenv/config';
import '@nomiclabs/hardhat-waffle';
import { task, subtask } from 'hardhat/config';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {Contract} from 'ethers';
import { connectToMoralis } from "../src/lib/moralis";
import { getDiamondFacet, getContractDeployment } from '../src/lib/deploy';

// npx hardhat node
// npx hardhat --network localhost deploy-diamond --facets "GemPoolFacet,TokenSaleFacet,ForgeFacet"
// npx hardhat --network localhost install-event-listeners --contract GemPoolFacet
// npx hardhat --network localhost install-gempools

import {
  getSelectors,
  FacetCutAction,
  getSelectorsAfterRemoveOtherFn,
  getSpecificSelector
} from './libraries/diamond';


export async function deployDiamond({facets}: any, hre: HardhatRuntimeEnvironment): Promise<string> {
  const accounts = await hre.ethers.getSigners();
  const {get, deploy} = hre.deployments;
  const libDeployParams = {
    from: await accounts[0].getAddress(),
    log: true,
    args: []
  };

  // deploy DiamondCutFacet
  const diamondCutFacet = await deploy('DiamondCutFacet', libDeployParams);
  console.log('DiamondCutFacet deployed:', diamondCutFacet.address);

  // deploy Diamond
  const deployParams = {
    from: await accounts[0].getAddress(),
    log: true,
    args: [await accounts[0].getAddress(), diamondCutFacet.address]
  };
  const diamond = await deploy('Diamond', deployParams);
  console.log('Diamond deployed:', diamond.address);

  // deploy DiamondInit
  // DiamondInit provides a function that is called when the diamond is upgraded to initialize state variables
  // Read about how the diamondCut function works here: https://eips.ethereum.org/EIPS/eip-2535#addingreplacingremoving-functions
  const diamondInit = await deploy('DiamondInit', libDeployParams);
  const diamondInitContract = await hre.ethers.getContractAt(
    diamondInit.abi,
    diamondInit.address
  );
  console.log('DiamondInit deployed:', diamondInit.address);

  // deploy facets
  console.log('');
  console.log('Deploying facets');
  const initFacets = facets.split(',');
  const FacetNames = ['DiamondLoupeFacet', 'OwnershipFacet'];
  const cut = [];
  for (const FacetName of FacetNames) {
    const facet = await deploy(FacetName, libDeployParams);
    const facetContract = await hre.ethers.getContractAt(
      facet.abi,
      facet.address
    );
    console.log(`${FacetName} deployed: ${facet.address}`);
    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facetContract)
    });
  }
  for (const FacetName of initFacets) {
    const Facet = await get(FacetName);
    const facetContract = await hre.ethers.getContractAt(
      Facet.abi,
      Facet.address
    );
    console.log(`${FacetName} deployed: ${Facet.address}`);
    cut.push({
      facetAddress: Facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facetContract)
    });
  }

  // upgrade diamond with facets
  console.log('');
  console.log('Diamond Cut:', cut);
  const diamondCut = await hre.ethers.getContractAt(
    'IDiamondCut',
    diamond.address
  );
  let tx;
  let receipt;
  // call to init function
  let functionCall = diamondInitContract.interface.encodeFunctionData(
    'init'
  );
  tx = await diamondCut.diamondCut(cut, diamondInit.address, functionCall);
  console.log('Diamond cut tx: ', tx.hash);
  receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
  console.log('Completed diamond cut');

  // we are done!
  console.log('Deploy complete\n');
  return diamond.address;
}

task('deploy-diamond', 'Deploy Nextgem diamond')
  .addParam('facets', 'The initial facets to deploy')
  .setAction(deployDiamond);

task('get-facets', 'Get the facets of a diamond').setAction(
  async (_, hre: HardhatRuntimeEnvironment): Promise<void> => {
    const {get} = hre.deployments;
    const diamondLoupeFacet = await hre.ethers.getContractAt(
      'DiamondLoupeFacet',
      (await get('Diamond')).address
    );
    console.log(await diamondLoupeFacet.facets());
  }
);

task('deploy-add-facets', "Deploy Facet And add it's selectors to Diamond Cut")
  .addParam('name', 'The Diamond Contract name')
  .setAction(
    async ({name}, hre: HardhatRuntimeEnvironment): Promise<void> => {
      const accounts = await hre.ethers.getSigners();
      const {deploy, get} = hre.deployments;
      const libDeployParams = {
        from: await accounts[0].getAddress(),
        log: true,
        args: []
      };
      console.log('Deploying facets');
      const cut = [];
      const facet = await deploy(name, libDeployParams);
      const facetContract = await hre.ethers.getContractAt(
        facet.abi,
        facet.address
      );
      console.log(`${name} deployed: ${facet.address}`);
      cut.push({
        facetAddress: facet.address,
        action: FacetCutAction.Add,
        functionSelectors: getSelectors(facetContract)
      });

      // upgrade diamond with facets
      console.log('');
      console.log('Diamond Cut:', cut);
      const diamondCut = await hre.ethers.getContractAt(
        'DiamondCutFacet',
        (await get('DiamondCutFacet')).address
      );
      let tx;
      let receipt;
      tx = await diamondCut.diamondCut(
        cut,
        hre.ethers.constants.AddressZero,
        '0x',
        {gasLimit: 8000000}
      );
      console.log('Diamond cut tx: ', tx.hash);
      receipt = await tx.wait();
      if (!receipt.status) {
        throw Error(`Diamond upgrade failed: ${tx.hash}`);
      }
      console.log('Completed diamond cut');

      // we are done!
      console.log('Facets Deployed & Added\n');
    }
  );

task('get-selector', 'Get Selector').setAction(
  async (_, hre: HardhatRuntimeEnvironment): Promise<void> => {
    const test2Facet = await hre.ethers.getContractAt(
      'Test2Facet',
      (await hre.deployments.get('Diamond')).address
    );
    // await (await test2Facet.test2Func1(5)).wait();
    console.log(getSpecificSelector(test2Facet, ['test2Payable()']));
  }
);

export interface ReplaceFacets {
  name: string;
  remove: string[];
}

export interface SelectorsType {
  name: string;
  selectors: string[];
  address: string;
}

// task(
//   'deploy-replace-facets',
//   "Deploy Facet And replace it's selectors to Diamond Cut"
// )
//   .addParam('deployparams', 'The Diamond Contract Address')
//   .setAction(
//     async ({deployparams}, hre: HardhatRuntimeEnvironment): Promise<void> => {
//       let deployData: ReplaceFacets[] = getData(deployparams, 'deploy-replace');
//       const accounts = await hre.ethers.getSigners();
//       const {deploy, get} = hre.deployments;
//       const libDeployParams = {
//         from: await accounts[0].getAddress(),
//         log: true,
//         args: []
//       };
//       console.log('Deploying facets');
//       const cut = [];
//       for (const SelectedFacet of deployData) {
//         const facet = await deploy(SelectedFacet.name, libDeployParams);
//         console.log(`${SelectedFacet.name} deployed: ${facet.address}`);
//         cut.push({
//           facetAddress: facet.address,
//           action: FacetCutAction.Replace,
//           functionSelectors: getSelectorsAfterRemoveOtherFn(
//             facet as any,
//             SelectedFacet.remove
//           )
//         });
//       }
//       // upgrade diamond with facets
//       console.log('');
//       console.log('Diamond Cut:', cut);
//       const diamondCut = await hre.ethers.getContractAt(
//         'DiamondCutFacet',
//         (await hre.deployments.get('Diamond')).address
//       );
//       let tx;
//       let receipt;
//       tx = await diamondCut.diamondCut(
//         cut,
//         hre.ethers.constants.AddressZero,
//         '0x',
//         {gasLimit: 8000000}
//       );
//       console.log('Diamond cut tx: ', tx.hash);
//       receipt = await tx.wait();
//       if (!receipt.status) {
//         throw Error(`Diamond upgrade failed: ${tx.hash}`);
//       }
//       console.log('Completed diamond cut');

//       // we are done!
//       console.log('Facets Deployed & Replaced\n');
//     }
//   );

task('add-facets', 'Add specific selectors to Diamond Cut')
  .addParam('name', 'The facet contract name')
  .setAction(
    async ({name}, hre: HardhatRuntimeEnvironment): Promise<void> => {

      console.log('Adding facets');
      const cut = [];
      const facet = await hre.ethers.getContractAt(
        name,
        (await hre.deployments.get(name)).address
      );
      console.log(`${name} deployed: ${facet.address}`);

      cut.push({
        facetAddress: facet.address,
        action: FacetCutAction.Add,
        functionSelectors: getSelectors(facet)
      });

      // upgrade diamond with facets
      console.log('');
      console.log('Diamond Cut:', cut);
      const diamondCut = await hre.ethers.getContractAt(
        'DiamondCutFacet',
        (await hre.deployments.get('Diamond')).address
      );
      let tx;
      let receipt;
      tx = await diamondCut.diamondCut(
        cut,
        hre.ethers.constants.AddressZero,
        '0x',
        {gasLimit: 8000000}
      );
      console.log('Diamond cut tx: ', tx.hash);
      receipt = await tx.wait();
      if (!receipt.status) {
        throw Error(`Diamond upgrade failed: ${tx.hash}`);
      }
      console.log('Completed diamond cut');

      // we are done!
      console.log('Facets Added\n');
    }
  );

// task('remove-facets', 'Remove specific selectors to Diamond Cut')
//   .addParam('deployparams', 'The param')
//   .setAction(
//     async ({deployparams}, hre: HardhatRuntimeEnvironment): Promise<void> => {
//       let deployData: SelectorsType[] = getData(deployparams, 'remove-facets');

//       console.log('Removing facets');
//       const cut = [];
//       for (const SelectedFacet of deployData) {
//         const facet = await hre.ethers.getContractAt(
//           SelectedFacet.name,
//           (await hre.deployments.get('Diamond')).address
//         );
//         console.log(`${SelectedFacet.name} deployed: ${facet.address}`);

//         const filteredSelecters = getSpecificSelector(
//           facet,
//           SelectedFacet.selectors
//         );
//         const selectors = [];

//         for (let i = 0; i < SelectedFacet.selectors.length; i++) {
//           selectors.push(filteredSelecters[i]);
//         }

//         cut.push({
//           facetAddress: hre.ethers.constants.AddressZero,
//           action: FacetCutAction.Remove,
//           functionSelectors: selectors
//         });
//       }

//       // upgrade diamond with facets
//       console.log('');
//       console.log('Diamond Cut:', cut);
//       const diamondCut = await hre.ethers.getContractAt(
//         'DiamondCutFacet',
//         (await hre.deployments.get('Diamond')).address
//       );
//       let tx;
//       let receipt;
//       tx = await diamondCut.diamondCut(
//         cut,
//         hre.ethers.constants.AddressZero,
//         '0x',
//         {gasLimit: 8000000}
//       );
//       console.log('Diamond cut tx: ', tx.hash);
//       receipt = await tx.wait();
//       if (!receipt.status) {
//         throw Error(`Diamond upgrade failed: ${tx.hash}`);
//       }
//       console.log('Completed diamond cut');

//       // we are done!
//       console.log('Facets Removed\n');
//     }
//   );

// task('replace-facets', 'Replace specific selectors to Diamond Cut')
//   .addParam('deployparams', 'The param')
//   .setAction(
//     async ({deployparams}, hre: HardhatRuntimeEnvironment): Promise<void> => {
//       let deployData: SelectorsType[] = getData(deployparams, 'replace-facets');

//       console.log('Replace facets');
//       const cut = [];
//       for (const SelectedFacet of deployData) {
//         const facet = await hre.ethers.getContractAt(
//           SelectedFacet.name,
//           (await hre.deployments.get('Diamond')).address
//         );
//         console.log(facet);
//         console.log(`${SelectedFacet.name} deployed: ${facet.address}`);

//         const filteredSelecters = getSpecificSelector(
//           facet,
//           SelectedFacet.selectors
//         );
//         const selectors = [];

//         for (let i = 0; i < SelectedFacet.selectors.length; i++) {
//           selectors.push(filteredSelecters[i]);
//         }

//         cut.push({
//           facetAddress: SelectedFacet.address,
//           action: FacetCutAction.Replace,
//           functionSelectors: selectors
//         });
//       }

//       // upgrade diamond with facets
//       console.log('');
//       console.log('Diamond Cut:', cut);
//       const diamondCut = await hre.ethers.getContractAt(
//         'DiamondCutFacet',
//         (await hre.deployments.get('Diamond')).address
//       );
//       let tx;
//       let receipt;
//       tx = await diamondCut.diamondCut(
//         cut,
//         hre.ethers.constants.AddressZero,
//         '0x',
//         {gasLimit: 8000000}
//       );
//       console.log('Diamond cut tx: ', tx.hash);
//       receipt = await tx.wait();
//       if (!receipt.status) {
//         throw Error(`Diamond upgrade failed: ${tx.hash}`);
//       }
//       console.log('Completed diamond cut');

//       // we are done!
//       console.log('Facets Replaced\n');
//     }
//   );
