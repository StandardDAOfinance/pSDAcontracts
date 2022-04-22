// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IFeeManager.sol";
import "../interfaces/ICustody.sol";

import "../diamond/LibAppStorage.sol";

/// @notice the manager of fees
contract CustodyFacet is Modifiers {

    function takeCustody(ICustody.CustodyItem[] memory items) external returns (uint256 custodyReceipt) {
        //
    }

    function releaseCustody(uint256 custodyReceipt) external {
        //
    }

}
