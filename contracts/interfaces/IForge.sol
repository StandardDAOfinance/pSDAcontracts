// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./ITokenDefinitions.sol";
import "./IRequirement.sol";

// defines the forge. The forge contains items that can be minted in exchange for input items
struct ForgeDefinition {
    // forge identifier
    uint256 forgeId;
    // forge symbol, name, description
    string name;
    string symbol;
    string description;
    // max number of forge operations
    uint256 maxForgeCount;
    // number of times this forge has been used
    uint256 forgedCount;
    // fee for each forge operation
    uint256 forgeFee;
}

// defines a single requirement for a forge item
struct ForgeItemRequirement {
    // the token address of the item
    address tokenAddress;
    // the token id of the item
    uint256 tokenId;
    // the amount of the item required
    uint256 amount;
}

// defines each item that can be forged
struct ForgeItemDefinition {

    // item name, symbol, description
    string name;
    string symbol;
    string description;

    // requirements for this item
    ForgeItemRequirement[] requirements;

    // probability of this item being forged, if multiple items are possible, the probability is the sum of all probabilities
    uint256 probability;
    // number of times this item can be forged
    uint256 maxForgeCount;
    // number of times this item has been forged
    uint256 forgedCount;
    // fee to be paid for forging this item. overrides the forge fee of the forge if nonzero
    uint256 forgeFee;
    // token hash to mint for this item. if zero, then the token hash is autogenerated
    uint256 tokenHash;
}

/// @notice a crafting matrix describes a set of items that can be crafted
interface IForge {

    /// @notice create a new forge
    /// @param name the name of the forge
    /// @param symbol the symbol of the forge
    /// @param description the description of the forge
    /// @param items the items that can be forged
    function createForge(string calldata name, string calldata symbol, string calldata description, ForgeItemDefinition[] calldata items) external;

    /// @notice get the forge definition
    /// @param symbol the symbol of the forge
    function getForge(string calldata symbol) external view returns (ForgeDefinition memory);

    // function _setForge(ForgeDefinition calldata forge) internal;

    /// @notice get the list of forgeable items
    function forgeableItems() external view returns (ForgeItemDefinition[] memory);

    /// @notice add a new forgeable item
    /// @param item the item to add
    /// @return the index of the item
    function addForgeableItem(ForgeItemDefinition calldata item) external returns (uint256);

    /// @notice forge an item
    /// @param symbol the symbol of the forge
    /// @param inputItems the input items
    /// @return the forged item
    function forgeAnyItem(string calldata symbol, uint256[] calldata inputItems) external returns (ForgeItemDefinition memory);

    /// @notice forge an item
    /// @param symbol the symbol of the forge
    /// @param index the index of the item to forge
    /// @param inputItems the input items
    /// @return the forged item
    function forgeItemAtIndex(string calldata symbol, uint256 index, uint256[] calldata inputItems) external returns (ForgeItemDefinition memory);

    /// @notice get the hash of a forge
    /// @param symbol the symbol of the forge
    function getForgeHash(string calldata symbol) external view returns (uint256);

    /// @notice get the forge by hash
    /// @param hash the hash of the forge
    function getForgeByHash(uint256 hash) external view returns (ForgeDefinition memory);

    /// @notice ForgeCreated
    /// @param forge the forge that was created
    event ForgeCreated(ForgeDefinition forge);

    /// @notice ForgeItemAdded
    /// @param item the item that was added
    event ForgeItemAdded(ForgeItemDefinition item);

    /// @notice ItemForged
    /// @param receiver the receiver of the item
    /// @param item the item that was forged
    /// @param quantity the quantity of the item that was forged
    event ItemForged(address receiver, ForgeItemDefinition item, uint256 quantity);

}
