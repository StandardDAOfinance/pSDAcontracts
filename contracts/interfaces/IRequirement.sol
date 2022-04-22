// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IToken.sol";
import "../utils/UInt256Set.sol";

/// @notice describes a list of requirements which will be checked against when someone performs an action
interface IRequirement is IToken {

    /// @notice an input requirement
    struct Requirement {

        // the minter that this requirement aplpies to.
        address minter;
        // the token source to match for this requirement. Other a collection or a single token id
        TokenSource source;
        // the quantity of tokens to match for this requirement. must have at least this many tokens
        uint256 quantity;
        // whether or not to take custody of the tokens if the requirement is met
        bool takeCustody;
        // whether or not to burn the tokens if the requirement is met
        bool burn;
        // whether or not to require the exact amount of tokens to match for this requirement
        bool requireExactAmount;

    }

    // data for requirements
    struct RequirementData {

        address token;
        address manager;

        mapping(uint256 => Requirement[]) requirements;
        mapping(uint256 => TokenSet) tokens;

        UInt256Set.Set burnedTokenIds;
        mapping(uint256 => uint256) burnedTokenQuantities;

    }

    struct RequirementSettings {
        RequirementData data;
    }

    /// @notice get all requirements
    /// @return _reqs a set of requirements
    function requirements(uint256 collectionId) external view returns (Requirement[] memory _reqs);

    /// @notice returns whether the specified account meets the requirement at the specified quantity factor
    /// @param account the minter to check
    /// @param req the requirement list to check
    /// @param quantity the quantity factor to check
    /// @return _tokens whether the account meets the requirements
    function fulfillingTokens(address account, Requirement memory req, uint256 quantity) external view returns (Token[] memory _tokens);

    /// @notice returns whether the specified account meets the requirements at the specified quantity factor
    /// @param account the minter to check
    /// @param collectionId the requirement list to check
    /// @param quantity the quantity factor to check
    /// @return _meetsRequirements whether the account meets the requirements
    function meetsRequirements(address account, uint256 collectionId, uint256 quantity) external view returns (bool _meetsRequirements);

    function custodyRequirements(
        uint256 transferId,
        address from,
        address token,
        Requirement[] memory reqs,
        uint256 quantity) external returns(Token[] memory _transferredTokens);

    function releaseRequirements(
        uint256 transferId,
        address token,
        address to) external;
}
