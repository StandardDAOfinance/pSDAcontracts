//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./IToken.sol";

///
/// @notice a list of token definitions
///
interface ITokenDefinitions {

    struct TokenDefinitionsSettings {

        IToken.TokenDefinition[] tokenDefinitions;

    }

    /// @notice emitted when a lootbox is created
    event TokenDefinitionsCreated(
        address indexed creator,
        address indexed contractAddress,
        IToken.TokenDefinition[] definitions
    );

    /// @notice emitted when a lootbox is created
    event TokenDefinitionAdded(
        address indexed creator,
        address indexed contractAddress,
        IToken.TokenDefinition definitions
    );

    /// @notice a set of tokens.
    struct TokenDefinitionSet {

        mapping(uint256 => uint256) keyPointers;
        uint256[] keyList;
        IToken.TokenDefinition[] valueList;

    }

    function tokenDefinitions() external view returns (IToken.TokenDefinition[] memory);
    function makeHash(IToken.TokenDefinition memory _definition) external view returns (uint256);
}
