// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/ICustody.sol";

/// @notice the manager of fees
contract CustodyShimFacet {

    function takeCustody(ICustody.CustodyItem[] memory) external returns (uint256) {
        //
    }

    function releaseCustody(uint256) external {
        //
    }

}
