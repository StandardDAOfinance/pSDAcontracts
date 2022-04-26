// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import "../interfaces/ITokenMinter.sol";
import "../interfaces/IERC1155Mint.sol";
import "../interfaces/IERC1155Burn.sol";

import "../diamond/LibAppStorage.sol";
import { LibDiamond } from "../diamond/LibDiamond.sol";

interface ITokenAttributeSetter {
    function setAttribute(
        uint256 _tokenId,
        string memory key,
        uint256 value
    ) external;
}

contract TokenMinterFacet {

    // application storage
    AppStorage internal s;

    event Token(address indexed receiver, uint256 indexed tokenId);
    event TokenBurn(address indexed target, uint256 indexed tokenId);

    modifier onlyController {
        require(msg.sender == LibDiamond.contractOwner()  || msg.sender == address(this), "only the contract owner can mint");
        _;
    }

    function setToken(address token) external onlyController {
        s.tokenMinterStorage.token = token;
    }

}
