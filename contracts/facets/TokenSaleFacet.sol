// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC1155/utils/ERC1155Receiver.sol)
pragma solidity ^0.8.0;

import "../diamond/LibAppStorage.sol";
import "../interfaces/ITokenSale.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @dev Implements a token sale. Contains a number of tokens for sale. Sets of tokens are minted into the contract (or transferred into it) and then sold at a set price.
 */
contract TokenSaleFacet is Modifiers, ITokenSale {

    /// @notice add some tokens to the sale
    function setTokens(
       ITokenSale.TokenSaleEntry memory tokensToSell
    ) external onlyOwner {
        // validate the token information
        require(tokensToSell.receiver != address(0), "Receiver must not be the zero address");
        require(tokensToSell.sourceToken != address(0), "source must not be the zero address");
        require(tokensToSell.sourceTokenId > 0, "source token id must be greater than 0");
        require(tokensToSell.price > 0, "Price must be greater than 0");
        require(tokensToSell.quantity > 0, "Quantity must be greater than 0");

        // allow setting an empty token list, or updating an existing token list
        require(s.tokenSaleStorage.tokenSaleEntries[tokensToSell.sourceToken].sourceToken == address(0) ||
            (s.tokenSaleStorage.tokenSaleEntries[tokensToSell.sourceToken].sourceToken != address(0) && s.tokenSaleStorage.tokenSaleEntries[tokensToSell.sourceToken].sourceToken == tokensToSell.sourceToken),
        "Token address must be a valid token address");

        emit TokensSet(tokensToSell.sourceToken, tokensToSell);
    }

    /// @notice get an attribute for a tokenid keyed by string
    function getTokens(
        address tokensAddress
    ) public view returns (ITokenSale.TokenSaleEntry memory) {
        require(tokensAddress != address(0), "Token address must not be the zero address");
        require(s.tokenSaleStorage.tokenSaleEntries[tokensAddress].sourceToken != address(0) && s.tokenSaleStorage.tokenSaleEntries[tokensAddress].sourceToken == tokensAddress,
            "Token address must be a valid token address");
        return s.tokenSaleStorage.tokenSaleEntries[tokensAddress];
    }

    function purchase(address tokenToPurchase) public payable {

        // validate that the incoming token is a valid token
        require(tokenToPurchase != address(0), "Token address must not be the zero address");
        require(s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].sourceToken != address(0) && s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].sourceToken == tokenToPurchase,
            "Token address must be a valid token address");
        require(s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].quantity > s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].quantitySold,
            "No more tokens left to sell");
        require(msg.value >= s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].price, "You must pay the price");

        // increase the quantity sold
        s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].quantitySold++;
        uint256 nextId = s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].quantitySold;
        // transfer the token to the buyer
        IERC721(tokenToPurchase).safeTransferFrom(address(this), msg.sender, nextId);
        // transfer fundfs to the receiver
        payable(s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].receiver).transfer(msg.value);

        // emit the event
        emit TokenSold(
            msg.sender,
            tokenToPurchase,
            s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].sourceTokenId,
            s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].price
        );

    }

    function send(address tokenToPurchase, address receiver) public onlyOwner {

        // validate that the incoming token is a valid token
        require(receiver != address(0), "Receiver must not be the zero address");
        require(tokenToPurchase != address(0), "Token address must not be the zero address");
        require(s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].sourceToken != address(0) && s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].sourceToken == tokenToPurchase,
            "Token address must be a valid token address");
        require(s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].quantity > s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].quantitySold,
            "No more tokens left to sell");

        // increase the quantity sold
        s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].quantitySold++;
        uint256 nextId = s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].quantitySold;
        // transfer the token to the buyer
        IERC721(tokenToPurchase).safeTransferFrom(address(this), receiver, nextId);

        // emit the event
        emit TokenSold(
            msg.sender,
            tokenToPurchase,
            s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].sourceTokenId,
            s.tokenSaleStorage.tokenSaleEntries[tokenToPurchase].price
        );

    }

}
