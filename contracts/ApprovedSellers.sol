// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// @notice approved sellers. tracks approved sellers (people allowed to send the token)
contract ApprovedSellers {

  // generated when a approved seller is added
  event ApprovedSellerAdded(address indexed approvedSeller);
  // generated when a approved seller is removed
  event ApprovedSellerRemoved(address indexed approvedSeller);
  
  bool internal requireSellerApproval_;
  
  mapping(address => bool ) internal _isApprovedSeller;
  
  // only approved sellers shall pass
  modifier approvedSellerOnly() virtual {
    require(_approvedSeller(msg.sender) == true && requireSellerApproval_ == true, "approved seller only");
    _;
  }
  
  /// @notice add an approved seller
  function _addApprovedSeller(address approvedSeller_) internal {
    _isApprovedSeller[approvedSeller_] = true;
    emit ApprovedSellerAdded(approvedSeller_);
  }
  
  /// @notice remove an approved seller
  function _removeApprovedSeller( address approvedSeller_ ) internal {
    _isApprovedSeller[approvedSeller_] = false;
    emit ApprovedSellerRemoved(approvedSeller_);
  }
  
  /// @notice check if an address is an approved seller
  function _approvedSeller(address seller) internal view returns (bool isApproved) {
    isApproved = _isApprovedSeller[seller];
  }

  /// @notice return require seller approval flag
  function requireSellerApproval() public returns (bool _requireSellerApproval) {
    requireSellerApproval_ = _requireSellerApproval;
  }

}
