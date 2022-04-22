// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../token/ERC721A/ERC721A.sol";

import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/// @notice a fractionalized token based on erc721
contract FractionalizedToken is ERC721A, Initializable {

    address internal _minter;
    uint256 internal _totalFractions;

    /// @notice initialize the token
    function initialize(
        string memory symbol,
        string memory name,
        string memory baseUri,
        address __minter,
        uint256 __totalFractions
    ) public initializer {
        // initialize the token name and symbol
        _initializeToken(name, symbol, baseUri);
        // mint the tokens to the minter
        _mint(
            __minter,
            __totalFractions,
            "",
            true
        );
    }

    /// @notice get the minter of this token
    function minter() public view returns (address) {
        return _minter;
    }

    /// @notice get the total number of fractions
    function totalFractions() public view returns (uint256) {
        return _totalFractions;
    }

}