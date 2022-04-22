// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// @notice the manager of fees
contract FeeShimFacet {

    /// @notice get the fee for a given hash
    function fee(string memory)
        external
        pure
        returns (uint256 _fee) {
        _fee = 0;
    }

}
