// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC1155/utils/ERC1155Receiver.sol)
pragma solidity ^0.8.0;

/**
 * @dev Enables the diamond to receiver erc721 tokens. This contract also requires supportsInterface to support ERC721. This is implemenented in the DiamondInit contract.
 */
contract ERC721ReceiverFacet {

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

}
