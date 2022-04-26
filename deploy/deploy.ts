import 'hardhat-deploy';
import 'hardhat-deploy-ethers';

import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { BigNumber } from 'ethers';

import { deployDiamond } from '../tasks/deploy';

import { getDiamondFacet, getContractDeployment } from '../src/lib/deploy';

export default async function func(hre: HardhatRuntimeEnvironment) {

  const deploy = hre.deployments.deploy;
  const owner = await (hre.ethers as any).getSigner();
  const ownerAddress = await owner.getAddress();

  // deployment params
  const libDeployParams = {
    from: ownerAddress,
    log: true,
    args: []
  };

  // deploy the libraries
  const addressSet = await deploy('AddressSet', libDeployParams);
  const uint256Set = await deploy('UInt256Set', libDeployParams);
  const merkleProof = await deploy('MerkleProof', libDeployParams);
  const libDiamond = await deploy('LibDiamond', libDeployParams);

  // create params for further deploys
  const libAppStorageDeployParams = {
    from: ownerAddress,
    log: true,
    libraries: {
      UInt256Set: uint256Set.address,
      AddressSet: addressSet.address,
      MerkleProof: merkleProof.address
    }
  };

  // deploy libappstorage
  const libAppStorage = await deploy(
    'LibAppStorage',
    libAppStorageDeployParams
  );

  // deployment params
  const deployParams = {
    from: ownerAddress,
    log: true,
    libraries: {
      AddressSet: addressSet.address,
      UInt256Set: uint256Set.address,
      LibAppStorage: libAppStorage.address,
      LibDiamond: libDiamond.address,
      MerkleProof: merkleProof.address
    },
    args: []
  };

  // the contract list to deploy
  const contractsToDeploy = [
    'ERC20',
    'AirdropTokenSaleFacet',
    'MerkleAirdropFacet',
    'TokenMinterFacet'
  ]
  // deploy the contracts
  for (const contract of contractsToDeploy) {
    await deploy(contract, deployParams);
  }

  // add facets to the diamond
  console.log('deploy diamond');
  await deployDiamond(
    {
      facets: [
        'AirdropTokenSaleFacet',
        'MerkleAirdropFacet',
        'TokenMinterFacet'
      ].join(',')
    },
    hre
  );

  const facet = await getDiamondFacet(hre, 'TokenMinterFacet');
  const token = await getContractDeployment(hre, 'ERC20');

  console.log('set minted token');
  await facet.setToken(token.address);
  await token.addController(facet.address);

  const name = 'Standard DAO Token';
  const symbol = 'SDT';


  let tx = await token.initialize(name, symbol, { gasLimit: 200000 });
  await tx.wait();

  const [signer] = await hre.ethers.getSigners();
  const accountAddress = await signer.getAddress();

  tx = await token.setAllowMint(true);
  await tx.wait();

  //tx = await token.setCap(0);
  //await tx.wait();
}
func.tags = ['GemPoolFactory'];
