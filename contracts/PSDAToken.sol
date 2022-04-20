// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import "./ApprovedSellers.sol";
import "./ERC20MintBurn.sol";
import "./OwnableToken.sol";

/// @notice token approved seller public owner only methods

/// @notice the PSDA main token contract
contract PSDAToken is ERC20, OwnableToken, ERC20MintBurn, Pausable, Initializable {

  uint8 private decimals_ = 4;
  uint256 private  _cap;

  /// @notice only approved seller shall pass
  modifier onlyApprovedSeller(address from_) {
    if(from_ != address(0)) require(_approvedSeller(from_) == true && requireSellerApproval_ == true, "approved seller only");
    _;
  }

  constructor (string memory _name, string memory _symbol) ERC20(_name, _symbol) {
    requireSellerApproval_ = true;
    allowMinting_ = true;
  }
  
  /// @notice constructot
  function initialize(uint8 _decimals, uint256 cap_, uint256 initialSupply) public initializer  {

    require(cap_ > 0, "ERC20Capped: cap is 0");
    _cap = cap_;
    decimals_ = _decimals;

    _setApprovedSeller( address(this), true );
    _setApprovedSeller( msg.sender, true );

    _mint(msg.sender, initialSupply);

  }
 
  /// @notice return decimals
  function decimals() public view virtual override returns (uint8) {
    return decimals_;
  }

  /// @notice return cap
  function cap() public view virtual returns (uint256) {
    return _cap;
  }

  /// @notice run before a token transfer
  function _beforeTokenTransfer(address from_, address to_, uint256 _amount) internal override onlyApprovedSeller(from_) {
    super._beforeTokenTransfer(from_, to_, _amount);
    require(!paused(), "token transfer while paused");
  }

  // override base mint to check cap
  function _mint(address account, uint256 amount) internal virtual override {
    require(ERC20.totalSupply() + amount <= cap(), "ERC20Capped: cap exceeded");
    super._mint(account, amount);
  }

  /// @notice mint tokens to an address
  function mint( address recipient_, uint256 amount_) public override onlyOwner() {
    super.mint( recipient_, amount_ );
    _mint( recipient_, amount_ );
  }

  /// @notice burn tokens from address
  function burn(uint256 amount_ ) public override {
    super.burn( amount_ );
    _burn( msg.sender, amount_ );
  }

  /// @notice burn from an address
  function burnFrom( address target_, uint256 amount_) public override onlyOwner {
    super.burnFrom( target_, amount_ );
    _burn( target_, amount_ );
  }

}