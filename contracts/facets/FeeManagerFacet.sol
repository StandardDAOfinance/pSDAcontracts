// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IFeeManager.sol";

import "../diamond/LibAppStorage.sol";

/// @notice the manager of fees
contract FeeManagerFacet is Modifiers {

    /// @notice emitted when a fee is changed
    event FeeChanged(
        address indexed operator,
        string indexed feeLabel,
        uint256 value
    );
    
    /// @notice get the fee for a given hash
    /// @param feeTextLabel the hash of the fee
    /// @return _fee the fee
    function fee(string memory feeTextLabel)
        external
        view
        returns (uint256 _fee) {
        _fee = s.feeManagerStorage._fees[feeTextLabel];
    }

    /// @notice set the fee for the given fee type hash
    /// @param feeTextLabel the keccak256 hash of the fee type
    /// @param _fee the new fee amount
    function setFee(string memory feeTextLabel, uint256 _fee) external virtual onlyOwner {
        s.feeManagerStorage._fees[feeTextLabel] = _fee;
        emit FeeChanged(msg.sender, feeTextLabel, _fee);
    }


}
