// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import "../access/Controllable.sol";
import "../interfaces/IMarketplace.sol";
import "../interfaces/IERC1155Receiver.sol";
import "../interfaces/IERC1155.sol";

import "../diamond/LibAppStorage.sol";
import { LibDiamond } from "../diamond/LibDiamond.sol";

contract MarketplaceFacet is IMarketplace, Modifiers {

    /// @notice list an item in the marketplace. The item is minted directly into the marketplace and cannot be withdrawn unless the item is sold. Only the owner can list an item,
    /// @param nftContract address of the contract that manages the NFT.
    function listItem(
        address nftContract, // the contract address of the NFT
        address payable receiver, // the receiver of the sale funds
        uint256 tokenId, // the token id of the NFT
        uint256 price, // the NFT price
        uint256 quantity // the quantity of the NFT
    ) external onlyOwner {
        // ensure that the price is > 0
        require(price > 0, "Price must be greater than 0");

        // ensure that item is not already listed
        require(s.marketplaceStorage.idToListed[tokenId] == false, "Item is already listed");

        // get the next id in the series
        s.marketplaceStorage.itemIds = s.marketplaceStorage.itemIds + 1;
        uint256 nextId = s.marketplaceStorage.itemIds;

        // tokens are minted directly into the marketplace
        require(IERC1155(nftContract).balanceOf(address(this), tokenId) >= quantity, "Token not in contract");

        // record the listing information
        s.marketplaceStorage.idToMarketItem[nextId] = MarketItem(
            nextId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            quantity,
            false,
            receiver
        );
        s.marketplaceStorage.idToListed[tokenId] = true; // mark the item as listed

        emit Listings(nextId, nftContract, tokenId, msg.sender, receiver, address(0), price, false);
    }

    /// @notice delist the item from the marketplace. Only delists the item but leave the gem in the marketplace
    /// @param itemId uint256 id of the item to delist
    function delistItem(uint256 itemId) external onlyOwner {
        require(s.marketplaceStorage.idToMarketItem[itemId].sold == false, "Item must not be sold");
        require(s.marketplaceStorage.idToMarketItem[itemId].seller == payable(msg.sender) || address(this) == msg.sender, "Only the owner can delist an item");

        // clear the listing data from trom the contract
        uint256 tokenId = s.marketplaceStorage.idToMarketItem[itemId].tokenId;
        s.marketplaceStorage.idToMarketItem[itemId].owner = payable(0);
        s.marketplaceStorage.idToMarketItem[itemId].price = 0;
        s.marketplaceStorage.idToMarketItem[itemId].quantity = 0;
        s.marketplaceStorage.idToMarketItem[itemId].sold = false;
        s.marketplaceStorage.idToListed[tokenId] = false;

        emit Closes(itemId);
    }

    /// @notice purchase a listed item. The item is removed from the marketplace and the funds are transferred to the seller.
    /// @param nftContract the contract address of the NFT
    /// @param itemId the id of the item to purchase
    function purchaseItem(address nftContract, uint256 itemId) external payable {

        require(s.marketplaceStorage.idToMarketItem[itemId].sold != true, "This sale has already finished");
        uint256 tokenId = s.marketplaceStorage.idToMarketItem[itemId].tokenId;
        require(s.marketplaceStorage.idToListed[tokenId] == true, "This listing is invalid");

        uint256 price = s.marketplaceStorage.idToMarketItem[itemId].price; // listing price of the item
        uint256 quantity = s.marketplaceStorage.idToMarketItem[itemId].quantity; // quantity to purchase

        // ensure that there are enough attached funds to purchase the item
        require(msg.value == price * quantity && quantity > 0, "Please submit the asking price in order to complete the purchase");

        // get the receiver of the funds
        address receiver = s.marketplaceStorage.idToMarketItem[itemId].receiver;

        // delist the item from the marketplace
        this.delistItem(itemId);

        // mark this listing as sold
        s.marketplaceStorage.idToMarketItem[itemId].owner = payable(msg.sender);
        s.marketplaceStorage.idToMarketItem[itemId].sold = true;
        s.marketplaceStorage.idToMarketItem[itemId].price = price;
        s.marketplaceStorage.idToMarketItem[itemId].quantity = quantity;

        s.marketplaceStorage.itemsSold = s.marketplaceStorage.itemsSold + 1;

        // exchange funds - send the funds to the items receiver and send the NFT to a buyer
        payable(receiver).transfer(msg.value);
        IERC1155(nftContract).safeTransferFrom(address(this), msg.sender, tokenId, quantity, "");

        // emit the event indicating a sale
        emit Sales(itemId, receiver, price, quantity, tokenId);
    }

    /// @notice fetch a listing from the marketplace
    /// @param itemId uint256 id of the item to fetch
    function fetchItem(uint256 itemId) external view returns (MarketItem memory) {
        require(s.marketplaceStorage.idToMarketItem[itemId].owner == address(0), "This item is not for sale");
        return s.marketplaceStorage.idToMarketItem[itemId];
    }

}
