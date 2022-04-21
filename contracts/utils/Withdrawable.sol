//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../interfaces/IWithdrawable.sol";

contract Withdrawable is IWithdrawable {

    function withdraw(
        address recipient,
        address token,
        uint256 id,
        uint256 amount)
        external
        virtual
        override {
        // if token is address(0) then send ether to recipient. Else if token is not address(0) then
        // use erc165 to determine the token type (erc1155/erc721/erc20) and send the token to recipient
        // then emit a TokenWithdawn event
    }

}
