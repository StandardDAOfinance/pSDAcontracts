//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/// @notice a pool of tokens that users can deposit into and withdraw from
interface IDeployer {

    function deploy(uint256 amount, uint256 salt) external;
    function deployment(uint256 salt) external view returns(address);
    function computeDeploymentAddress(
            bytes32 salt,
            bytes32 bytecodeHash,
            address deployer
        ) external pure returns (address);
    function computeAddress(
        bytes32 salt,
        bytes32 bytecodeHash)
        external view returns (address);

}
