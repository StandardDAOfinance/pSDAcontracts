// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../diamond/LibAppStorage.sol";


import "../interfaces/IBank.sol";
import "../interfaces/IToken.sol";
import "../interfaces/IERC1155.sol";
import "../interfaces/IERC20.sol";

contract BankFacet is Modifiers {

    /// @notice emitted when a token is added to the collection
    event Deposited (
        address indexed bank,
        address indexed account,
        uint256 indexed id,
        uint256 amount
    );

    /// @notice emitted when a token is added to the collection
    event Withdrew (
        address indexed bank,
        address indexed account,
        uint256 indexed id,
        uint256 amount
    );

    // balances by user by token by id. base token (eth) is 0. System multitoken address is 0.


    function _setToken(address token) internal {
        s.bankStorage.token = token;
    }

    function _getToken() internal virtual returns (address token) {
        token = s.bankStorage.token;
    }

    /// @notice Get  all account tokens
    /// @param id address of the account
    /// @param amount address of the account
    function _deposit(address _from, uint256 id, uint256 amount) internal {

        address ourToken = _getToken();
        if(id == 0) {
            require(msg.value >= amount, "insufficient attached funds");
            // nothing else to do, ether arrived with the transaction
        } else {
            uint256 balance_ = IERC1155(ourToken).balanceOf(_from, id);
            if(balance_ != 0) {
                IERC1155(ourToken).safeTransferFrom(_from, address(this), id, amount, "");
            } else {
                // if balance is zero then check to see if this is actually an erc20 token
                address erc20token = address(uint160(id));
                try IERC20(erc20token).balanceOf(_from) returns (uint256 _balance) {
                    balance_ = _balance;
                }
                catch (bytes memory) {
                    require(false, "token is not supported");
                }
                require(balance_ >= amount, "insufficient balance at sender");
                IERC20(erc20token).transferFrom(_from, address(this), amount);
            }
        }
        s.bankStorage.balances[_from][id] += amount;
        emit Deposited(address(this), _from, id, amount);

    }

    /// @notice Get  all account tokens
    /// @param id address of the account
    /// @param amount address of the account
    function deposit(uint256 id, uint256 amount) external payable onlyOwner {
        _deposit(msg.sender, id, amount);
    }

    /// @notice Get  all account tokens
    /// @param _from from address of the account (used by a third-party to deposit into another account)
    /// @param id address of the account
    /// @param amount address of the account
    function depositFrom(address _from, uint256 id, uint256 amount) external payable onlyOwner {
        _deposit(_from, id, amount);
    }

    /// @notice Get  all account tokens
    /// @param id address of the account
    /// @param amount address of the account
    function _withdrawTo(address from, address to, uint256 id, uint256 amount) internal onlyOwner {

        // make sure that msg.sender's account has enough tokens to transfer
        require(s.bankStorage.balances[to][id] >= amount, "insufficient balance");
        // deduct the funds from the sender
        s.bankStorage.balances[to][id] -= amount;
        // if the token is zero then its ether
        if(s.bankStorage.token == address(0)) {
            payable(to).transfer(amount);
        } else {
            if(IERC1155(s.bankStorage.token).balanceOf(from, id) != 0) {
                IERC1155(s.bankStorage.token).safeTransferFrom(from, to, id, amount, "");
            } else {
                // if balance is zero then check to see if this is actually an erc20 token
                address erc20token = address(uint160(id));
                try IERC20(erc20token).balanceOf(from) returns (uint256 erc20balance) {
                    if(erc20balance != 0) {
                        IERC20(erc20token).transferFrom(from, to, amount);
                    }
                }
                catch (bytes memory) {
                    require(false, "token is not supported");
                }
            }
        }
        // emit an event about the withdraw
        emit Withdrew(from, to, id, amount);

    }

    /// @notice Get  all account tokens
    /// @param id address of the account
    /// @param amount address of the account
    function withdraw(uint256 id, uint256 amount) external virtual onlyOwner returns (uint256 _amount) {
        _withdrawTo(address(this), msg.sender, id, amount);
        _amount = amount;
    }

    /// @notice Get  all account tokens
    /// @param to to address of the account
    /// @param id he token id to withdraw
    /// @param amount the amount of tokens to deposit
    function withdrawTo(address to, uint256 id, uint256 amount) external onlyOwner returns (uint256 _amount){
        _withdrawTo(address(this), to, id, amount);
        _amount == amount;
    }


    /// @notice Get get all account tokens
    /// @param _account address of the account
    /// @param _id uint256 of the token index
    /// @return _amount the account token record
    function balance(address _account, uint256 _id)
    external
    virtual
    view
    returns (uint256 _amount) {
        return s.bankStorage.balances[_account][_id];
    }


}
