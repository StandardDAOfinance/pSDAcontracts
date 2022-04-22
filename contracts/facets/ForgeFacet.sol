// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../diamond/LibAppStorage.sol";

import "../interfaces/IForge.sol";
import "../interfaces/IERC1155Mint.sol";

// struct ForgeItemRequirement {
//     address tokenAddress;
//     uint256 tokenId;
//     uint256 amount;
// }

// struct ForgeItemDefinition {
//     string name;
//     string symbol;
//     string description;

//     ForgeItemRequirement[] requirements;

//     uint256 probability;
//     uint256 maxForgeCount;
//     uint256 forgedCount;
//     uint256 tokenHash;
// }

// struct ForgeDefinition {
//     uint256 forgeId;
//     string name;
//     string symbol;
//     string description;
//     uint256 maxForgeCount;
//     uint256 forgedCount;
// }
// struct ForgeStorage {
//     // the forge settings by forge id
//     mapping(uint256 => IForge.ForgeDefinition) forges;
//     uint256[] forgeIds;
//     // the forge item settings by forge item id
//     mapping(uint256 => mapping(uint256 => IForge.ForgeItemDefinition)) forgeItems;
//     uint256[] forgeItemIds;
//     // forged item hashes by forge id
//     mapping(uint256 => UInt256Set.Set) forgedItemHashes;
//     // all forged item hashes
//     UInt256Set.Set allforgedItemHashes;
//     // all forge symbols
//     string[] symbols;
// }

// struct AppStorage {
//     // gem pools data
//     GemPoolStorage gemPoolStorage;
//     // token sale data
//     TokenSaleStorage tokenSaleStorage;
//     // forge data
//     ForgeStorage forgeStorage;
// }

//     // event ForgeCreated(address indexed creator, address indexed forgeId, ForgeDefinition forge);
    // event ForgeItemAdded(ForgeItemDefinition item);
    // event ItemForged(address receiver, ForgeItemDefinition item, uint256 quantity);

// each forge has a number of forge items, each of which has a number of requirements. in order to forge an item, the requirements must be met.
// if multiple items are available, the item to forge can be selected by index, or can be selected at random if the probability is set.
contract ForgeFacet {

    // addplication storage
    AppStorage internal s;

    /// @notice get the forge by forgeHash
    function _getForgeByHash(uint256 forgeHash) internal view returns (ForgeDefinition memory _forge) {
        require(s.forgeStorage.forges[forgeHash].forgeId == forgeHash, "forgeHash does not match the forgeId" );
        _forge = s.forgeStorage.forges[forgeHash];
    }
    function getForgeByHash(uint256 forgeHash) external view returns (ForgeDefinition memory _forge) {
        _forge = _getForgeByHash(forgeHash);
    }
    /// @notice  get the forge forgeHash given its symbol
    function _getForgeHash(string calldata symbol) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked("forge", address(this), symbol)));
    }
    function getForgeHash(string calldata symbol) external view returns (uint256) {
        return _getForgeHash(symbol);
    }
    /// @notice get the forge by symbol
    function _getForge(string calldata symbol) internal view returns (ForgeDefinition memory) {
        // require that the forge exists
        uint256 forgeHash = _getForgeHash(symbol);
        require(s.forgeStorage.forges[forgeHash].forgeId == forgeHash, "forge does not exist");
        return s.forgeStorage.forges[forgeHash];
    }
    function getForge(string calldata symbol) external view returns (ForgeDefinition memory) {
        return _getForge(symbol);
    }
    /// @notice forge setter
    function _setForge(ForgeDefinition calldata forge) internal {
        s.forgeStorage.forges[forge.forgeId] = forge;
    }

    /// @notice create a forge given the forge info
    function _createForge(string calldata name, string calldata symbol, string calldata description, ForgeItemDefinition[] calldata items) internal {
        // make sure that this forge is not already created - first get the forge id (forgeHash)
        uint256 forgeHash = _getForgeHash(symbol);
        require(s.forgeStorage.forges[forgeHash].forgeId == 0, "forge already exists");
        // create the forge
        ForgeDefinition memory forge =  ForgeDefinition(
        s.forgeStorage.forges[forgeHash].forgeId, 
        name, 
        symbol, 
        description, 
        items.length, 
        0, 
        0);

        s.forgeStorage.forges[forgeHash] = forge;
        s.forgeStorage.symbols.push(symbol);
        // add the items
        for (uint256 i = 0; i < items.length; i++) {
            _addForgeItem(items[i]);
        }
        // emit the event
        emit ForgeCreated(msg.sender, forgeHash, forge);
    }

    /// @notice get all the forges of the system
    function getForges() external view returns (ForgeDefinition[] memory) {
        // need to return the structs stored in the map, pointed to by the forgeIds array
        ForgeDefinition[] memory forges = new ForgeDefinition[](s.forgeStorage.forgeIds.length);
        for (uint256 i = 0; i < s.forgeStorage.forgeIds.length; i++) {
            forges[i] = s.forgeStorage.forges[s.forgeStorage.forgeIds[i]];
        }
        return forges;
    }
    /// @notice get all the forgeable item definitions
    function forgeableItems(uint256 forgeId) external view returns (ForgeItemDefinition[] memory) {
        // make sure this forge exists
        require(s.forgeStorage.forges[forgeId].forgeId == forgeId, "forge does not exist");
        // need to return the structs stored in the map, pointed to by the forgeIds array
        // ForgeItemDefinition[] memory forgeItems = new ForgeItemDefinition[](s.forgeStorage.forges[forgeId].forgeItems.length);

        // for (uint256 i = 0; i < s.forgeStorage.forgeItems[forgeId].length; i++) {
        //     forgeItems[i] = s.forgeStorage.forgeItems[forgeId][i];
        // }
        // return forgeItems;
    }
    /// @notice get all the forge ids
    function forgeIds() external view returns (uint256[] memory) {
        return s.forgeStorage.forgeIds;
    }
    /// @notice add a forgeable item to an existing forge
    function addForgeableItem(uint256 forgeId, ForgeItemDefinition calldata item) external returns (uint256) {
        // make sure this forge exists
        require(s.forgeStorage.forges[forgeId].forgeId == forgeId, "forge does not exist");
        // add the item
        _addForgeItem(item);
    }
    function _addForgeItem(ForgeItemDefinition calldata item) internal {
        // add the item
        uint256 itemId = s.forgeStorage.forgeItemIds.length;
        // s.forgeStorage.forgeItems[item.forgeId][itemId] = item;
        s.forgeStorage.forgeItemIds.push(itemId);
        // emit the event
        emit ForgeItemAdded(item);
    }
    /// @notice get all the items that are forgeable given the forge and the input itens passed in (item ids repeated to indicate quantity)
    function _matchingForgeableItems(uint256 forgeId, uint256[] calldata inputItems) internal view returns (ForgeItemDefinition[] memory) {
        // make sure this forge exists
        require(s.forgeStorage.forges[forgeId].forgeId == forgeId, "forge does not exist");
        // get the items
        // ForgeItemDefinition[] memory forgeItems = new ForgeItemDefinition[](s.forgeStorage.forgeItems[forgeId].length);
        // for (uint256 i = 0; i < s.forgeStorage.forgeItems[forgeId].length; i++) {
        //     forgeItems[i] = s.forgeStorage.forgeItems[forgeId][i];
        // }
        // // filter the items - cannot use push to add to matchingItems so must preallocate  matchingItems
        // ForgeItemDefinition[] memory matchingItems = new ForgeItemDefinition[](s.forgeStorage.forgeItemIds[forgeId].length);
        // uint256 matchingItemsLength = 0;
        // for (uint256 i = 0; i < s.forgeStorage.forgeItemIds[forgeId].length; i++) {
        //     uint256 forgeItemId = s.forgeStorage.forgeItemIds[forgeId][i];
        //     // check if the item is in the input
        //     bool found = false;
        //     for (uint256 j = 0; j < inputItems.length; j++) {
        //         if (forgeItems[i].itemId == inputItems[j]) {
        //             found = true;
        //             break;
        //         }
        //     }
        //     if (found) {
        //         matchingItems[matchingItemsLength] = s.forgeStorage.forgeItems[forgeId][i];
        //         matchingItemsLength++;
        //     }
        // }

    }
    /// @notice get all the items that are forgeable given the forge and the input itens passed in (item ids repeated to indicate quantity)
    function matchingForgeableItems(uint256 forgeId, uint256[] calldata inputItems) external view returns (ForgeItemDefinition[] memory) {
        return _matchingForgeableItems(forgeId, inputItems);
    }

    /// @notice forge an item given the forge id and the input itens passed in (item ids repeated to indicate quantity)
    function forgeMatchingItem(address receiver, uint256 forgeId, uint256[] calldata inputItems, uint256 matchingItemIndex) external payable returns (ForgeItemDefinition memory) {
        // make sure this forge exists
        require(s.forgeStorage.forges[forgeId].forgeId == forgeId, "forge does not exist");
        // filter the items - cannot use push to add to matchingItems so must preallocate  matchingItems
        // ForgeItemDefinition[] memory matchingItems = new ForgeItemDefinition[](s.forgeStorage.forgeItemIds[forgeId].length);
        // uint256 matchingItemsLength = 0;
        // for (uint256 i = 0; i < s.forgeStorage.forgeItemIds[forgeId].length; i++) {
        //     uint256 forgeItemId = s.forgeStorage.forgeItemIds[forgeId][i];
        //     // check if the item is in the input
        //     bool found = false;
        //     for (uint256 j = 0; j < inputItems.length; j++) {
        //         if (s.forgeStorage.forgeItems[i].itemId == inputItems[j]) {
        //             found = true;
        //             break;
        //         }
        //     }
        //     if (found) {
        //         matchingItems[matchingItemsLength] = s.forgeStorage.forgeItems[forgeId][i];
        //         matchingItemsLength++;
        //     }
        // }
        // // make sure the matching item index is valid
        // require(matchingItemIndex < matchingItemsLength, "matching item index is invalid");
        // // mint the item
        // ForgeItemDefinition memory forgedItem = _mintForgeItem(receiver, matchingItems[matchingItemIndex]);
        // // return the matching item
        // return matchingItems[matchingItemIndex];
    }

    /// @notice mint a forge item
    function _mintForgeItem(address receiver, ForgeItemDefinition calldata item) internal returns (ForgeItemDefinition memory) {
        // mint the item
        // ForgeItemDefinition memory forgedItem = item;
        // forgedItem.owner = receiver;
        // forgedItem.itemId = s.forgeStorage.forgeItemIds[item.forgeId].length;
        // s.forgeStorage.forgeItems[item.forgeId].push(forgedItem);
        // s.forgeStorage.forgeItemIds[item.forgeId].push(forgedItem.itemId);
        // // emit the event
        // emit ForgeItemMinted(forgedItem);
        // return forgedItem;
    }

    event ForgeCreated(address indexed sender, uint256 indexed forgeId, ForgeDefinition forge);
    event ForgeItemAdded(ForgeItemDefinition item);
    event ForgeItemMinted(ForgeItemDefinition item);
}
