// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC1155/utils/ERC1155Receiver.sol)
pragma solidity ^0.8.0;

import "../diamond/LibAppStorage.sol";
import "../utils/UInt256Set.sol";
import "../utils/AddressSet.sol";

/**
 * @dev _Available since v3.1._
 */
contract ERC1155MinterFacet is Modifiers {
    using UInt256Set for UInt256Set.Set;
    using AddressSet for AddressSet.Set;

    /// @notice event emitted when tokens are minted
    event Minted(
        address target,
        uint256 tokenHash,
        uint256 amount
    );
    /// @notice event emitted when tokens are burned
    event Burned(
        address target,
        uint256 tokenHash,
        uint256 amount
    );

    /// @notice Mint a specified amount the specified token hash to the specified receiver
    /// @param recipient the address of the receiver
    /// @param amount the amount to mint
    function mint(
        address recipient,
        uint256 tokenId,
        uint256 amount,
        bytes memory
    ) external {
        require(recipient != address(0), "ERC1155: mint to the zero address");
        require(amount > 0, "ERC1155: mint amount must be greater than 0");
        require(
            s.erc1155Storage._minterApprovals[recipient][tokenId] >= amount || msg.sender == LibDiamond.contractOwner() || msg.sender == address(this),
            "ERC1155: mint to an unapproved address"
        );
        if (msg.sender != LibDiamond.contractOwner() && msg.sender != address(this)) {
            s.erc1155Storage._minterApprovals[recipient][tokenId] -= amount;
        }
        s.erc1155Storage._balances[tokenId][recipient] += amount;
        emit Minted(recipient, tokenId, amount);
    }

    /// @notice Burn a specified amount of the specified token hash from the specified receiver
    /// @param target the address of the receiver
    /// @param amount the amount to mint
    function burn(
        address target,
        uint256 tokenId,
        uint256 amount
    ) external {
        require(target != address(0), "ERC1155: burn from the zero address");
        require(amount > 0, "ERC1155: burn amount must be greater than 0");
        require(
            s.erc1155Storage._balances[tokenId][target] >= amount &&
                (msg.sender == target || msg.sender == LibDiamond.contractOwner() || msg.sender == address(this)),
            "ERC1155: burn of an unapproved address"
        );
        s.erc1155Storage._balances[tokenId][target] -= amount;
        emit Burned(target, tokenId, amount);
    }

    function setMintAllowance(
        address receiver,
        uint256 tokenId,
        uint256 amount
    ) external {
        require(
            msg.sender == LibDiamond.contractOwner() || msg.sender == address(this),
            "ERC1155: only contract owner can call this function"
        );
        s.erc1155Storage._minterApprovals[receiver][tokenId] += amount;

    }
}
