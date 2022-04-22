// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// @notice approved sellers. tracks approved sellers (people allowed to send the token)
contract ApprovedSellers {

  // generated when a approved seller is added
  event ApprovedSellerAdded(address indexed approvedSeller);
  // generated when a approved seller is removed
  event ApprovedSellerRemoved(address indexed approvedSeller);
  
  bool internal requireSellerApproval_;
  
  mapping(address => bool) internal _isApprovedSeller;

  /// @notice add an approved seller
  function _setApprovedSeller(address seller, bool approveState) internal {
    _isApprovedSeller[seller] = approveState;
    if(approveState) emit ApprovedSellerAdded(seller);
    else emit ApprovedSellerRemoved(seller);
  }
  
  /// @notice check if an address is an approved seller
  function _approvedSeller(address seller) internal view returns (bool) {
    return _isApprovedSeller[seller];
  }
  function approvedSeller(address seller) public view returns (bool) {
    return _approvedSeller(seller);
  }

  /// @notice return require seller approval flag
  function requireSellerApproval() public view returns (bool _requireSellerApproval) {
    _requireSellerApproval = requireSellerApproval_;
  }

  function _setRequireSellerApproval(bool _requireSellerApproval) internal {
    requireSellerApproval_ = _requireSellerApproval;
  }
  
}
