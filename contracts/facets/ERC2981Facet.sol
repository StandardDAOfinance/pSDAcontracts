//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../diamond/LibAppStorage.sol";

import "../interfaces/IERC2981Holder.sol";
import "../interfaces/IERC2981.sol";

///
/// @dev An implementor for the NFT Royalty Standard. Provides interface
/// response to erc2981 as well as a way to modify the royalty fees
/// per token and a way to transfer ownership of a token.
///
contract ERC2981Facet is IERC2981, IERC2981Holder, Modifiers {

    /// @dev only the royalty owner shall pass
    modifier onlyRoyaltyOwner(uint256 _id) {
        require(s.erc2981Storage.royaltyReceiversByHash[_id] == msg.sender,
        "Only the owner can modify the royalty fees");
        _;
    }

    /**
     * @dev ERC2981 - return the receiver and royalty payment given the id and sale price
     * @param _tokenId the id of the token
     * @param _salePrice the price of the token
     * @return receiver the receiver
     * @return royaltyAmount the royalty payment
     */
    function royaltyInfo(
        uint256 _tokenId,
        uint256 _salePrice
    ) external view override returns (
        address receiver,
        uint256 royaltyAmount
    ) {
        require(_salePrice > 0, "Sale price must be greater than 0");
        require(_tokenId > 0, "Token Id must be valid");

        // get the receiver of the royalty
        receiver = s.erc2981Storage.royaltyReceiversByHash[_tokenId];

        // calculate the royalty amount. royalty is expressed as permilliage of total supply
        royaltyAmount = s.erc2981Storage.royaltyFeesByHash[_tokenId] / 1000000 * _salePrice;
    }

    /// @notice set the fee permilliage for a token hash
    /// @param _id - id of the token hash
    /// @param _fee - the fee permilliage to set
    function setFee(uint256 _id, uint256 _fee) external override onlyRoyaltyOwner(_id) {
        require(_id != 0, "Fee cannot be zero");
        s.erc2981Storage.royaltyFeesByHash[_id] = _fee;
    }

    /// @notice get the fee permilliage for a token hash
    /// @param _id - id of the token hash
    /// @return fee - the fee
    function getFee(uint256 _id) external view override returns (uint256 fee) {
        fee = s.erc2981Storage.royaltyFeesByHash[_id];
    }

    /// @notice get the royalty receiver for a token hash
    /// @param _id - id of the token hash
    /// @return owner - the royalty owner
    function royaltyOwner(uint256 _id) external view override returns (address owner) {
        owner = s.erc2981Storage.royaltyReceiversByHash[_id];
    }

    /// @notice set the royalty owner for a token hash
    /// @param _id - id of the token hash
    /// @param _owner - the royalty owner
    function setRoyaltyOwner(uint256 _id, address _owner) external onlyOwner {
        s.erc2981Storage.royaltyReceiversByHash[_id] = _owner;
    }

    /// @notice get the royalty receiver for a token hash
    /// @param _id - id of the token hash
    /// @param _newOwner - address of the new owners
    function transferOwnership(uint256 _id, address _newOwner) external override onlyRoyaltyOwner(_id) {
        require(_id != 0 && _newOwner != address(0), "Invalid token id or new owner");
        s.erc2981Storage.royaltyReceiversByHash[_id] = _newOwner;
    }
}
