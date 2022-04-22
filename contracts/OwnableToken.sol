// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./utils/ApprovedSellers.sol";

contract OwnableToken is ApprovedSellers, Ownable {

  /// @notice add an approved seller
  function addApprovedSeller(address approvedSeller_) external onlyOwner {
    _setApprovedSeller( approvedSeller_, true );
  }

  /// @notice add multiple approved sellers
  function addApprovedSellers( address[] calldata approvedSellers_ ) external onlyOwner {
    for( uint256 iteration_; approvedSellers_.length > iteration_; iteration_++ ) {
      _setApprovedSeller( approvedSellers_[iteration_], true );
    }
  }

  /// @notice remove an approved seller
  function removeApprovedSeller( address disapprovedSeller_ ) external onlyOwner {
    _setApprovedSeller( disapprovedSeller_, false );
  }

  /// @notice remove multiple approved sellers
  function removeApprovedSellers( address[] calldata disapprovedSellers_ ) external onlyOwner {
    for( uint256 iteration_; disapprovedSellers_.length > iteration_; iteration_++ ) {
      _setApprovedSeller( disapprovedSellers_[iteration_], false );
    }
  }

} 
