// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC20/ERC20.sol";

contract TestDAI is ERC20 {
    constructor() ERC20() {
        // initialize the token name and symbol
        _initializeToken("TestDAI", "TESTDAI");
        _mint(msg.sender, 1000000000000000000000000000);
    }
}