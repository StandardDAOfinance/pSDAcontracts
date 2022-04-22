//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../interfaces/IToken.sol";

/// @notice interface takes custody of a array of tokens (erc20/erc721/erc1155) and releases custody of the tokens to the address that placed them in custody.
interface ICustody {

    struct CustodyItem {
        IToken.TokenType tokenType;
        address tokenAddress;
        uint256 tokenId;
        uint256 amount;
        address ownerAddress;
    }

    function takeCustody(CustodyItem[] memory items) external returns (uint256 custodyReceipt);
    function releaseCustody(uint256 custodyReceipt) external;

}
