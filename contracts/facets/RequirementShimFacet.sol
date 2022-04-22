// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IRequirement.sol";
import "../interfaces/IToken.sol";

/// @notice the manager of fees
contract RequirementShimFacet {
    /// @notice update a rewquirement
    function setRequirements(uint256, IRequirement.Requirement[] memory)
        external
    {}

    /// @notice get all requirements
    /// @return _reqs a set of requirements
    function requirements(uint256)
        external
        view
        returns (IRequirement.Requirement[] memory)
    {}

    /// @notice returns whether the specified account meets the requirement at the specified quantity factor
    /// @return _tokens whether the account meets the requirements
    function fulfillingTokens(
        address,
        IRequirement.Requirement memory,
        uint256
    ) external view returns (IToken.Token[] memory) {}

    /// @notice returns whether the specified account meets the requirements at the specified quantity factor
    function meetsRequirements(
        address,
        uint256,
        uint256
    ) external view returns (bool) {}
}
