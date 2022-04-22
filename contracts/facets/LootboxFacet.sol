// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../diamond/LibAppStorage.sol";


import "../interfaces/ILootbox.sol";

contract LootboxFacet {

//     // addplication storage
//     AppStorage internal s;

//     /// @notice add a loot
//     /// @param settings the loot to add
//     function createLootbox(
//         ILootbox.LootboxSettings memory settings
//     ) external {}


//     /// @notice add a loot
//     /// @param tokenDefinition the loot to add
//     function addLoot(
//         IToken.TokenDefinition memory tokenDefinition
//     ) external {}

//     /// @notice add a loot
//     /// @param tokenDefinition the loot to add
//     function setLoot(
//         uint256 index,
//         IToken.TokenDefinition memory tokenDefinition
//     ) external {}

//     /// @notice get the hash for this
//     /// @param symbol the gem symbol
//     /// @return __lootboxHash the hash for this
//     function _lootboxHash(string memory symbol) internal view returns (uint256 __lootboxHash) {
//         __lootboxHash = uint256(keccak256(abi.encodePacked('lootbox',address(this), symbol)));
//     }

//     /// @notice get the gem pool hash
//     /// @param symbol the gem symbol
//     /// @return __lootboxHash the gem pool hash
//     function lootboxHash(string memory symbol) external view returns (uint256 __lootboxHash) {
//         __lootboxHash = _lootboxHash(symbol);
//     }

//     /// @notice returns all the record hashes in the collection as an array
//     /// @return _output the collection as an array
//     function symbols() external view returns (string[] memory _output) {
//         _output = s.lootboxStorage._symbols;
//     }

//     /// @notice returns all the record hashes in the collection as an array
//     /// @return _output the collection as an array
//     function allHashes() external view returns (uint256[] memory _output) {
//         _output = s.lootboxStorage._allRecordHashes.keyList;
//     }

//     /// @notice returns all the record hashes in the collection as an array
//     /// @param lootboxId the gem pool id
//     /// @return _output the collection as an array
//     function lootboxHashes(uint256 lootboxId) external view returns (uint256[] memory _output) {
//         _output = s.lootboxStorage._recordHashes[lootboxId].keyList;
//     }

//     /// @notice create a claim
//     /// @param __lootboxHash the gem pool hash
//     /// @return _gpsettings the claim hash
//     function getLootbox(uint256 __lootboxHash) external view returns (ILootbox.LootboxSettings memory _gpsettings) {
//         require(
//             s.lootboxStorage._lootboxs[__lootboxHash]._lootboxSettings.tokenDefinition.id == __lootboxHash,
//             "invalid gem pool"
//         );
//         _gpsettings = s.lootboxStorage._lootboxs[__lootboxHash]._lootboxSettings;
//     }

//    /// @notice add a new gem pool
//     /// @param lootboxSettings the gem pool settings
//     /// @return _lootboxId the gem pool id
//     function addLootbox(ILootbox.LootboxSettings memory lootboxSettings) external payable returns (uint256 _lootboxId) {
//         // get the deterministic hash for the gem pool
//         _lootboxId = _lootboxHash(lootboxSettings.tokenDefinition.symbol);
//         require(s.lootboxStorage._lootboxs[_lootboxId]._lootboxData.pool == 0, "collection already deployed");
//         s.lootboxStorage._symbols.push(lootboxSettings.tokenDefinition.symbol);
//         // record the gem pool data
//         s.lootboxStorage._lootboxs[_lootboxId]._lootboxSettings = lootboxSettings;
//         s.lootboxStorage._lootboxs[_lootboxId]._lootboxSettings.tokenDefinition.id = _lootboxId;
//         // emit a message to announce the gem pool creation
//         emit LootboxCreated(
//             msg.sender,
//             address(this),
//             _lootboxId,
//             s.lootboxStorage._lootboxs[_lootboxId]._lootboxSettings
//         );
//     }

}
