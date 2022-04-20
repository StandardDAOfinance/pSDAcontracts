// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ApprovedSellers.sol";

contract OwnableToken is ApprovedSellers, Ownable {

  /// @notice add an approved seller
  function addApprovedSeller(address approvedSeller_) external onlyOwner {
    _addApprovedSeller( approvedSeller_ );
  }

  /// @notice add multiple approved sellers
  function addApprovedSellers( address[] calldata approvedSellers_ ) external onlyOwner {
    for( uint256 iteration_; approvedSellers_.length > iteration_; iteration_++ ) {
      _addApprovedSeller( approvedSellers_[iteration_] );
    }
  }

  /// @notice remove an approved seller
  function removeApprovedSeller( address disapprovedSeller_ ) external onlyOwner {
    _removeApprovedSeller( disapprovedSeller_ );
  }

  /// @notice remove multiple approved sellers
  function removeApprovedSellers( address[] calldata disapprovedSellers_ ) external onlyOwner {
    for( uint256 iteration_; disapprovedSellers_.length > iteration_; iteration_++ ) {
      _removeApprovedSeller( disapprovedSellers_[iteration_] );
    }
  }

} 
