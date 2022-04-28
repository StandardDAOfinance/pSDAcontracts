// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/UInt256Set.sol";
import "../utils/AddressSet.sol";

import "../interfaces/ITokenMinter.sol";
import "../interfaces/IAirdropTokenSale.sol";
import "../interfaces/IERC721A.sol";

import {LibDiamond} from "./LibDiamond.sol";

// merkle utils storage
struct MerkleUtilsStorage {
    mapping(uint256 => uint256) tokenHashToIds;
}

// token minter storage
struct TokenMinterStorage {
    address token;
}

struct AirdropTokenSaleStorage {
    uint256 tsnonce;
    mapping(uint256 => uint256) nonces;
    // token sale settings
    mapping(uint256 => IAirdropTokenSale.TokenSaleSettings) _tokenSales;
    // is token sale open
    mapping(uint256 => bool) tokenSaleOpen;
    // total purchased tokens per drop - 0 for public tokensale
    mapping(uint256 => mapping(address => uint256)) purchased;
    // total purchased tokens per drop - 0 for public tokensale
    mapping(uint256 => uint256) totalPurchased;
}

struct MerkleAirdropStorage {
    mapping (uint256 => IAirdrop.AirdropSettings) _settings;
    uint256 numSettings;
    mapping (uint256 => mapping(uint256 => uint256)) _redeemedData;
    mapping (uint256 => mapping(address => uint256)) _redeemedDataQuantities;
    mapping (uint256 => mapping(address => uint256)) _totalDataQuantities;
}

struct MarketUtilsStorage {
    mapping(uint256 => bool) validTokens;
}

struct AppStorage {

    // merkle airdrop storage
    MerkleAirdropStorage merkleAirdropStorage;
   
    // airdrop token sale storage
    AirdropTokenSaleStorage airdropTokenSaleStorage;

    // token minter storage
    TokenMinterStorage tokenMinterStorage;
}

library LibAppStorage {
    function diamondStorage() internal pure returns (AppStorage storage ds) {
        assembly {
            ds.slot := 0
        }
    }
}

contract Modifiers {
    AppStorage internal s;
    modifier onlyOwner() {
        require(LibDiamond.contractOwner() == msg.sender || address(this) == msg.sender, "ERC1155: only the contract owner can call this function");
        _;
    }
}
