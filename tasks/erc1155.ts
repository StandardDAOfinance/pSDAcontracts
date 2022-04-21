import 'dotenv/config';

import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

import {getContractDeployment, getContractDeploymentAt} from '../src/lib/deploy';

// check to see if this contract is an erc1155 contract
task('iserc1155', 'Check to see if this contract is an erc1155 contract')
.addParam('address', 'The address to check')
  .setAction(async ({address}, hre: HardhatRuntimeEnvironment) => {
    // get the multitoken contract
    const checker = await getContractDeployment(hre, 'InterfaceChecker');
    console.log('\n\nNextgem - check interface\n');
    const isErc1155 = await checker.isERC1155(address, {gasLimit: 200000})
    console.log('is erc1155', isErc1155);
  });

  task('send-1155', 'send a token to a user')
      .addParam('address', 'The target address')
      .addParam('token', 'The erc1155 address')
      .addParam('id', 'The token id')
      .addParam('amount', 'The token id')
      .setAction(async ({ address, token, id, amount }, hre: HardhatRuntimeEnvironment): Promise<void> => {

  const multiToken = await getContractDeploymentAt(hre, 'ERC1155', token);
  const signerAddress = (await hre.ethers.getSigners())[0];
  const ownerAddress = await signerAddress.getAddress();
  const tx = await multiToken.safeTransferFrom(
    ownerAddress,
    address,
    id,
    amount,
    '');
  await tx.wait();
  console.log(`transfer tx: ${tx.hash}`);

});