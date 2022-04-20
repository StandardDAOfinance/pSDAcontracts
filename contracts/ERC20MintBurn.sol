// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// #notice erc20 mint / burn methods
contract ERC20MintBurn {

  event AllowMintingStateUpdated(bool mintingState);
  event AllowBurningStateUpdated(bool burningState);

  bool internal allowMinting_;
  bool internal allowBurning_;

  /// @notice set allow minting state
  function setMintingState(bool _mintingState) internal {
    allowMinting_ = _mintingState;
    emit AllowMintingStateUpdated(allowMinting_);
  }

  /// @notice set allow burning state
  function setBurningState(bool _burningState) internal {
    allowBurning_ = _burningState;
    emit AllowBurningStateUpdated(allowBurning_);
  }

  /// @notice mint tokens to an address. simply checks mint state
  function mint(address, uint256) public virtual {
    require(allowMinting_ == true, "minting is not allowed");
  }
  
  /// @notice burn tokens from an address. simply checks burn state
  function burn(uint256) public virtual {
    require(allowBurning_ == true, "burning is not allowed");
  }

  /// @notice burn from an address. simply checks burn state
  function burnFrom(address, uint256) public virtual {
    require(allowBurning_ == true, "burning is not allowed");
  }

}
