// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/UInt256Set.sol";
import "../utils/AddressSet.sol";

import "../interfaces/IMarketplace.sol";
import "../interfaces/ITokenMinter.sol";
import "../interfaces/ITokenSale.sol";
import "../interfaces/IForge.sol";
import "../interfaces/IGemPool.sol";
import "../interfaces/IClaim.sol";
import "../interfaces/IRequirement.sol";
import "../interfaces/IAirdropTokenSale.sol";
import "../interfaces/IERC721A.sol";

import {LibDiamond} from "./LibDiamond.sol";

struct SvgLayer {
    address svgLayersContract;
    uint16 offset;
    uint16 size;
}


struct GemPoolStorage {
    // gem pools data
    mapping(uint256 => IGemPool.GemPoolStruct) _gemPools;
    // record hashes created by the gem pools
    mapping(uint256 => UInt256Set.Set) _recordHashes;
    // gem requirements banked within the gem pool
    mapping(uint256 => IToken.Token[]) _bankedRequirements;
    // claim data
    mapping(uint256 => IClaim.Claim) _claims;
    uint256 _claimIndex;
    // staked totals
    mapping(address => uint256) _stakedTotal;
    //requirement data
    IRequirement.RequirementData _requirementData;
    // all symbols listed in the gem pool
    string[] _symbols;
}

struct ForgeStorage {
    // the forge settings by forge id
    mapping(uint256 => ForgeDefinition) forges;
    uint256[] forgeIds;
    // the forge item settings by forge item id
    mapping(uint256 => mapping(uint256 => ForgeItemDefinition)) forgeItems;
    uint256[] forgeItemIds;
    // forged item hashes by forge id
    mapping(uint256 => UInt256Set.Set) forgedItemHashes;
    // all forged item hashes
    UInt256Set.Set allforgedItemHashes;
    // all forge symbols
    string[] symbols;
}

// struct for erc1155 storage
struct ERC1155Storage {
    mapping(uint256 => mapping(address => uint256)) _balances;
    mapping(address => mapping(address => bool)) _operatorApprovals;
    mapping(address => mapping(uint256 => uint256)) _minterApprovals;

    // mono-uri from erc1155
    string _uri;
    string _uriBase;
    string _symbol;
    string _name;

    address _approvalProxy;
}

// struct for erc721a storage
struct ERC721AStorage {
    // The tokenId of the next token to be minted.
    uint256 _currentIndex;

    // The number of tokens burned.
    uint256 _burnCounter;

    // Token name
    string _name;

    // Token symbol
    string _symbol;

    // Mapping from token ID to ownership details
    // An empty struct value does not necessarily mean the token is unowned. See ownershipOf implementation for details.
    mapping(uint256 => IERC721A.TokenOwnership) _ownerships;

    // Mapping owner address to address data
    mapping(address => IERC721A.AddressData) _addressData;

    // Mapping from token ID to approved address
    mapping(uint256 => address) _tokenApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) _operatorApprovals;
}

// erc2981 storage struct
struct ERC2981Storage {
    // royalty receivers by token hash
    mapping(uint256 => address) royaltyReceiversByHash;
    // royalties for each token hash - expressed as permilliage of total supply
    mapping(uint256 => uint256) royaltyFeesByHash;
}

// attribute mutatiom pool storage
struct AttributeMutationPoolStorage {
    string _attributeKey;
    uint256 _attributeValuePerPeriod;
    uint256 _attributeBlocksPerPeriod;
    uint256 _totalValueThreshold;
    mapping (address => mapping (uint256 => uint256)) _tokenDepositHeight;
}

// token attribute storage
struct TokenAttributeStorage {
    mapping(uint256 => mapping(string => uint256)) attributes;
}

// merkle utils storage
struct MerkleUtilsStorage {
    mapping(uint256 => uint256) tokenHashToIds;
}

// NFT marketplace storage
struct MarketplaceStorage {
    uint256 itemsSold;
    uint256 itemIds;
    mapping(uint256 => IMarketplace.MarketItem) idToMarketItem;
    mapping(uint256 => bool) idToListed;
}

// token minter storage
struct TokenMinterStorage {
    address token;
    mapping(uint256 => uint256) tokenAuditHashes;
    mapping(uint256 => string) tokenGiaNumbers;
}

// fractionalized token storage
struct FractionalizedTokenData {
    string symbol;
    string name;
    address tokenAddress;
    uint256 tokenId;
    address fractionalizedToken;
    uint256 totalFractions;
}

// fractionalizer storage
struct FractionalizerStorage {
    address fTokenTemplate;
    mapping(address => FractionalizedTokenData) fractionalizedTokens;
}

// token sale storage
struct TokenSaleStorage {
    mapping(address => ITokenSale.TokenSaleEntry) tokenSaleEntries;
}

// fee manager storage
struct FeeManagerStorage {
    mapping(string => uint256) _fees;
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

struct BankStorage {
    address token;
    mapping(address => mapping(uint256 => uint256)) balances;
}


struct AppStorage {
    // gem pools data
    MarketplaceStorage marketplaceStorage;
    // gem pools data
    TokenMinterStorage tokenMinterStorage;
    // the erc1155 token
    ERC1155Storage erc1155Storage;
    // fractionalizer storage
    FractionalizerStorage fractionalizerStorage;
    // market utils storage
    MarketUtilsStorage marketUtilsStorage;
    // token sale storage
    TokenSaleStorage tokenSaleStorage;
    // merkle airdrop storage
    MerkleAirdropStorage merkleAirdropStorage;
    // erc721a storage
    ERC721AStorage erc721AStorage;
    // erc2981 storage
    ERC2981Storage erc2981Storage;
    // attribute mutation pool storage
    AttributeMutationPoolStorage attributeMutationPoolStorage;
    // token attribute storage
    TokenAttributeStorage tokenAttributeStorage;
    // airdrop token sale storage
    AirdropTokenSaleStorage airdropTokenSaleStorage;
    // fee manager storage
    FeeManagerStorage feeManagerStorage;
    // bank storage
    BankStorage bankStorage;
    // forge storage
    ForgeStorage forgeStorage;
    // gem pool storage
    GemPoolStorage gemPoolStorage;
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
