// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "../interfaces/IWithdrawable.sol";
import "../utils/InterfaceChecker.sol";

import "../diamond/LibAppStorage.sol";

/// @notice the manager of fees
contract WithdrawalFacet is Modifiers, IWithdrawable {

    /// @notice withdraw some amount of either a token or ether out of contract to caller
    /// @param token the erc20 token to withdraw or 0 for the base token (ether)
    /// @param id the token id to withdraw or 0 for the base token (ether)
    /// @param amount the amount to withdraw
    function withdraw(address recipient, address token, uint256 id, uint256 amount) external override payable onlyOwner {
        //withdraw some amount of either a token or ether out of contract to caller
        require(recipient != address(0), "recipient is not allowed to be 0");
        require(amount > 0, "amount must be greater than 0");
        // if the token is 0 then we are withdrawing ether
        if(token == address(0)) {
            payable(recipient).transfer(amount); // transfer ether
            emit TokenWithdrawn(recipient, address(0), 0, amount);
        } else {
            bool isErc20 = InterfaceChecker.isERC20(token);
            if(isErc20) {
                // if the token is an ERC20 token then we are withdrawing an ERC20 token
                require(IERC20(token).balanceOf(address(this)) >= amount, "insufficient funds");
                IERC20(token).transfer(recipient, amount); // transfer the token
                emit TokenWithdrawn(recipient, token, id, amount);
                return;
            }
            bool isErc721 = InterfaceChecker.isERC721(token);
            if(isErc721) {
                // if the token is an ERC721 token then we are withdrawing an ERC721 token
                require(IERC721(token).ownerOf(id) == address(this), "insufficient funds");
                IERC721(token).transferFrom(address(this), recipient, amount); // transfer the token
                emit TokenWithdrawn(recipient, token, id, 1);
                return;
            }
            bool isErc1155 = InterfaceChecker.isERC1155(token);
            if(isErc1155) {
                // if the token is an ERC1155 token then we are withdrawing an ERC1155 token
                require(IERC1155(token).balanceOf(address(this), id) >= amount, "insufficient funds");
                IERC1155(token).safeTransferFrom(address(this), recipient, id, amount, ""); // transfer the token
                emit TokenWithdrawn(recipient, token, id, amount);
                return;
            }
            
        }
    }


}
