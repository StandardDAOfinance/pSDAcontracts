// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import "../interfaces/IRequirement.sol";
import "../interfaces/ICustody.sol";

import "../diamond/LibAppStorage.sol";
import {LibDiamond} from "../diamond/LibDiamond.sol";

contract RequirementFacet is Modifiers {
    /// @notice update a rewquirement
    function setRequirements(
        uint256 collectionId,
        IRequirement.Requirement[] memory
    ) external {}

    /// @notice get all requirements
    /// @return _reqs a set of requirements
    function requirements(uint256 collectionId)
        external
        view
        returns (IRequirement.Requirement[] memory _reqs)
    {}

    /// @notice returns whether the specified account meets the requirement at the specified quantity factor
    /// @param account the minter to check
    /// @param req the requirement list to check
    /// @param quantity the quantity factor to check
    /// @return _tokens whether the account meets the requirements
    function fulfillingTokens(
        address account,
        IRequirement.Requirement memory req,
        uint256 quantity
    ) external view returns (IToken.Token[] memory _tokens) {}

    /// @notice returns whether the specified account meets the requirements at the specified quantity factor
    /// @param account the minter to check
    /// @param collectionId the requirement list to check
    /// @param quantity the quantity factor to check
    /// @return _meetsRequirements whether the account meets the requirements
    function meetsRequirements(
        address account,
        uint256 collectionId,
        uint256 quantity
    ) external view returns (bool _meetsRequirements) {}
}
