//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./IToken.sol";

/// @dev interface for a collection of tokens. lists members of collection,  allows for querying of collection members, and for minting and burning of tokens.
interface ILootbox {

    /// @notice describes a lootbox.
    struct LootboxSettings {

        // the address of the lootbox contract
        address contractAddress;

        // the minimum amount of loot per open
        uint8 minLootPerOpen;

        // the maximum amount of loot per open
        uint8 maxLootPerOpen;

        // the sum of all loot probabilities
        uint256 probabilitiesSum;

    }

    /// @notice describes the structure of the additional data that describes loot
    struct Loot {

        // the item that is the loot
        IToken.TokenDefinition item;

        uint256 id;

        uint256 amount;

        // probability of the item being awarded
        uint256 probability;

         // the index of the probability in its array
        uint256 probabilityIndex;

         // the index of the probability in its array
        uint256 probabilityRoll;

    }

    /// @notice emitted when lootbox tokens are minted
    event LootboxTokensMinted(
        address indexed minter,
        uint256 indexed hash,
        LootboxSettings mintedLootbox,
        uint256 mintedAmount
    );

    /// @notice emitted when lootbox is opened
    event LootboxOpened(
        address indexed containerAddress,
        address indexed userAddress,
        LootboxSettings containerObject,
        Loot[] itemObjects
    );

    /// @notice emitted when loot is minted
    event LootMinted(address indexed minter, uint256 indexed hash, LootboxSettings mintedLootbox, Loot mintedLoot);

    event LootAdded(address indexed adder, uint256 indexed hash, LootboxSettings targetLootbox, Loot addedLoot);

    /// @notice open the lootbox. mints loot according to lootbox data
    /// @return the the minted loot
    function getLootbox(uint256 lootboxHash) external view returns (LootboxSettings memory);

    /// @notice open the lootbox. mints loot according to lootbox data
    /// @return the the minted loot
    function addLootbox(LootboxSettings memory lootbox) external payable returns (LootboxSettings memory);

    /// @notice open the lootbox. mints loot according to lootbox data
    /// @return the the minted loot
    function open(uint256 lootboxHash) external payable returns (Loot[] memory);

    /// @notice open the lootbox. mints loot according to lootbox data
    /// @return the the minted loot
    function buyToken(uint256 quantity) external payable returns (Loot[] memory);

    /// @notice add a loot
    /// @param tokenDefinition the loot to add
    function addLoot(uint256 lootboxHash, IToken.TokenDefinition memory tokenDefinition) external;

    /// @notice add a loot
    /// @param tokenDefinition the loot to add
    function setLoot(uint256 lootboxHash, IToken.TokenDefinition memory tokenDefinition) external;

    /// @notice get all loot for lootbox
    /// @param lootboxHash the loot to add
    function loot(uint256 lootboxHash) external returns (Loot[] memory);

    /// @notice get all lootboxes in system
    function lootboxes() external returns (LootboxSettings[] memory);

    /// @notice a set of tokens.
    struct LootSet {

        mapping(uint256 => uint256) keyPointers;
        uint256[] keyList;
        ILootbox.Loot[] valueList;

    }
}
