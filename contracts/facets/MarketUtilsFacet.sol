// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC1155/utils/ERC1155Receiver.sol)
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../diamond/LibAppStorage.sol";
import "../utils/UInt256Set.sol";
import "../utils/AddressSet.sol";
import "../interfaces/IERC1155.sol";
import "../interfaces/IERC1155Mint.sol";
import "../interfaces/IERC1155Burn.sol";


interface ITokenMinterFacet {
    function mint(string memory secret, address receiver, string memory giaNumber, uint256 amount) external returns (bytes32);
}

interface IMarketplaceFacet {
    function listItem(
        address nftContract, // the contract address of the NFT
        address payable receiver, // the receiver of the sale funds
        uint256 tokenId, // the token id of the NFT
        uint256 price, // the NFT price
        uint256 quantity // the quantity of the NFT
    ) external ;
}

/**
 * @dev _Available since v3.1._
 */
contract MarketUtilsFacet is Modifiers, ReentrancyGuard {

    /// @notice Mint a specified amount the specified token hash to the specified receiver
    function mintAndList(
        string memory secret,
        address receiver,
        string memory giaNumber,
        uint256 price,
        uint256 quantity
    ) external nonReentrant {

        require(receiver != address(0), "Receiver must not be the zero address");
        require(price > 0, "Price must be greater than 0");
        require(quantity > 0, "Quantity must be greater than 0");
        require(msg.sender == LibDiamond.contractOwner(), "You shall not pass");
        bytes32 tokenId = ITokenMinterFacet(address(this)).mint(secret, s.tokenMinterStorage.token, giaNumber, quantity);
        s.marketUtilsStorage.validTokens[uint256(tokenId)] = true;
        IMarketplaceFacet(address(this)).listItem(
            s.tokenMinterStorage.token,
            payable(receiver),
            uint256(tokenId),
            price,
            quantity
        );

    }

    /// @notice Mint a specified amount the specified token hash to the specified receiver
    function sendAndList(
        uint256 tokenId,
        address receiver,
        uint256 price
    ) external nonReentrant {

        require(receiver != address(0), "Receiver must not be the zero address");
        require(price > 0, "Price must be greater than 0");
        require(s.marketUtilsStorage.validTokens[tokenId] == true, "Token is not valid");
        require(IERC1155(s.tokenMinterStorage.token).balanceOf(msg.sender, tokenId) >= 1, "You do not have enough tokens");

        // transfer from the sender to us
        IERC1155(s.tokenMinterStorage.token).safeTransferFrom(
            msg.sender,
            address(this),
            uint256(tokenId),
            1,
            ""
        );
        // list the item
        IMarketplaceFacet(address(this)).listItem(
            s.tokenMinterStorage.token,
            payable(receiver),
            uint256(tokenId),
            price,
            1
        );
    }

}
