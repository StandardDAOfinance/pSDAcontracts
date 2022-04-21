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
    'ERC1155',
    'AirdropTokenSaleFacet',
    'AttributeMutationPoolFacet',
    'ERC1155ReceiverFacet',
    'MerkleAirdropFacet',
    'MarketplaceFacet',
    'MarketUtilsFacet',
    'TokenAttributeFacet',
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
        'AttributeMutationPoolFacet',
        'ERC1155ReceiverFacet',
        'MerkleAirdropFacet',
        'MarketplaceFacet',
        'MarketUtilsFacet',
        'TokenAttributeFacet',
        'TokenMinterFacet'
      ].join(',')
    },
    hre
  );

  const facet = await getDiamondFacet(hre, 'TokenMinterFacet');
  const token = await getContractDeployment(hre, 'ERC1155');

  console.log('set minted token');
  await facet.setToken(token.address);
  await token.addController(facet.address);

  const baseuri = 'https://metadata.bitgem.co/daodon/';
  const name = 'DAODon Token';
  const symbol = 'DAODON';

  console.log('set uri', baseuri);
  let tx = await token.setUri(baseuri, {gasLimit: 200000});
  await tx.wait();
  tx = await token.setName(name, {gasLimit: 200000});
  await tx.wait();
  tx = await token.setSymbol(symbol, {gasLimit: 200000});
  await tx.wait();


  const [signer] = await hre.ethers.getSigners();
  const accountAddress = await signer.getAddress();

  async function doStuff(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      // the generative token factory
      const tokenContract = await getContractDeployment(hre, 'ERC1155');
      const tokenMinterContract =await getDiamondFacet(hre, 'TokenMinterFacet');
      const attribPool = await getDiamondFacet(
        hre,
        'AttributeMutationPoolFacet'
      );
      let _tokenId: any;

      attribPool.on(
        'TokenDeposited',
        (staker: string, tokenId: BigNumber) => {
          console.log(`TokenDeposited: ${staker} ${tokenId}`);
          resolve();
        }
      );

      tokenContract.on(
        'ApprovalForAll',
        async (account: string, operator: string, approved: boolean) => {
          console.log(`ApprovalForAll: ${account} ${operator} ${approved}`);
          const bal = await tokenContract.balanceOf("0x97AEd3F8aaCbcB22b374aC49bC2354374f17235a", _tokenId);
          console.log(`balance: ${bal}`);
          const tx = await attribPool.stake(_tokenId, {gasLimit: 800000});
          await tx.wait();
        }
      );

      tokenMinterContract.on(
        'Token',
        async (receiver: string, tokenId: BigNumber) => {
          console.log(`Token: ${receiver} ${tokenId}`);
          _tokenId = tokenId;
          let tx = await tokenContract.setApprovalForAll(
            tokenMinterContract.address,
            true,
            {gasLimit: 400000}
          );
          await tx.wait();
        }
      );

      console.log('mint', accountAddress);
      const tx = await tokenMinterContract.mint(accountAddress, {
        gasLimit: 800000
      });
      await tx.wait();
    });
  }

  await doStuff();
}
func.tags = ['GemPoolFactory'];
