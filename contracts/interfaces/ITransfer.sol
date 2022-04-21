//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/// @notice transfer funds from one account to another
interface ITransfer {

    event Transfer(address indexed from, address indexed to, uint256 id, uint256 amount);

    /// @notice transfer funds from msg.sender to recipient
    /// @param to address of the account
    /// @param id id of the token, 0 for ether, or address or erc20 token
    /// @param amount address of the account
    function transfer(address to, uint256 id, uint256 amount) external;

    /// @notice transfer funds from msg.sender to recipient
    /// @param from address of the sender account
    /// @param to address of the recipient account
    /// @param id id of the token, 0 for ether, or address or erc20 token
    /// @param amount address of the account
    function transferFrom(address from, address to, uint256 id, uint256 amount) external;

}
