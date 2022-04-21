import 'dotenv/config';

import 'hardhat-deploy';
import 'hardhat-deploy-ethers';

import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Contract } from 'ethers';

export async function getDiamondFacet(hre: HardhatRuntimeEnvironment, facetName: string ): Promise<Contract> {
    const diamondDeployer = await hre.deployments.get('Diamond');
    return await hre.ethers.getContractAt(facetName, diamondDeployer.address);
}

export async function getContractDeployment(hre: HardhatRuntimeEnvironment, contractName: string): Promise<Contract> {
    const contractDeployer = await hre.deployments.get(contractName);
    return hre.ethers.getContractAt(
        contractDeployer.abi,
        contractDeployer.address
    );
}

export async function getContractDeploymentAt(hre: HardhatRuntimeEnvironment, contractName: string, address: string): Promise<Contract> {
    const contractDeployer = await hre.deployments.get(contractName);
    return hre.ethers.getContractAt(
        contractDeployer.abi,
        address
    );
}
