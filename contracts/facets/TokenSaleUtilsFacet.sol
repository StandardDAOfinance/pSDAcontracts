// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC1155/utils/ERC1155Receiver.sol)
pragma solidity ^0.8.0;

import "../diamond/LibAppStorage.sol";
import "../utils/UInt256Set.sol";
import "../utils/AddressSet.sol";
import "../interfaces/IERC1155.sol";
import "../interfaces/IERC1155Mint.sol";
import "../interfaces/IERC1155Burn.sol";
import "../interfaces/IMarketplace.sol";

import "hardhat/console.sol";

interface ITokenSaleFacet {
    function listItem(
        address nftContract, // the contract address of the NFT
        address payable receiver, // the receiver of the sale funds
        uint256 tokenId, // the token id of the NFT
        uint256 price, // the NFT price
        uint256 quantity // the quantity of the NFT
    ) external;

    function setTokens(
       ITokenSale.TokenSaleEntry memory tokensToSell
    ) external;
}

interface IFractionalizerFacet {
    function fractionalize(
        string memory symbol,
        string memory name,
        string memory baseUri,
        address tokenAddress,
        uint256 tokenId,
        uint256 fractionalizedQuantity,
        address tokenReceiver
    ) external returns (address _address);
}

/**
 * @dev _Available since v3.1._
 */
contract TokenSaleUtilsFacet is Modifiers {

    /// @notice Mint a specified amount the specified token hash to the specified receiver
    function fractionalizeAndList(
        string memory symbol,
        string memory name,
        string memory baseUri,
        address tokenAddress,
        uint256 tokenId,
        uint256 fractionalizedQuantity,
        uint256 price,
        address receiver
    ) external {

        require(tokenAddress != address(0), "Receiver must not be the zero address");
        require(receiver != address(0), "Receiver must not be the zero address");
        require(price > 0, "Price must be greater than 0");
        require(IERC1155(tokenAddress).balanceOf(msg.sender, tokenId) > 0, "Token not owned by sender");

        // transfer the original token to this contract
        IERC1155(tokenAddress).safeTransferFrom(msg.sender, address(this), tokenId, 1 , "");

        // fractionalize the token and mint the token to the tokensale (the diamond address)
        address fractionalizedAddresss = IFractionalizerFacet(address(this)).fractionalize(
            symbol,
            name,
            baseUri,
            tokenAddress,
            tokenId,
            fractionalizedQuantity,
            address(this)
        );
        console.log("fractionalizedAddresss", fractionalizedAddresss);

        // create the token sale struct
        ITokenSale.TokenSaleEntry memory tokenSale = ITokenSale.TokenSaleEntry(
            payable(receiver),
            tokenAddress,
            tokenId,
            fractionalizedAddresss,
            fractionalizedQuantity,
            price,
            0
        );
        // set the token sale with it
        ITokenSaleFacet(address(this)).setTokens(tokenSale);
        console.log("tokenSale");
    }

}
