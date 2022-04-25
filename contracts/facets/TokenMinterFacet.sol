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

    /// @notice mint a token associated with a collection with an amount
    /// @param target the mint receiver
    /// @param id the collection id
    function burn(address target, uint256 id) external onlyController {

        delete s.tokenMinterStorage._tokenMinters[id];

        // burn the token
        IERC1155Burn(s.tokenMinterStorage.token).burn(target, id, 1);

        // emit the event
        emit TokenBurn(target, id);
    }

    function mint(address receiver) external onlyController returns(bytes32 publicHash)  {

        // require receiver not be the zero address
        require(receiver != address(0x0), "receiver cannot be the zero address");

        // create a keccak256 hash using the contract address, the collection, and the gia number
        publicHash =  keccak256(abi.encodePacked(
            address(this),
            s.tokenMinterStorage._tokenCounter
        ));
        s.tokenMinterStorage._tokenCounter++;

        // store the audit hash
        s.tokenMinterStorage._tokenMinters[uint256(publicHash)] = msg.sender;

        ITokenAttributeSetter(address(this)).setAttribute(
            uint256(publicHash),
            "Rarity",
            0
        );
        ITokenAttributeSetter(address(this)).setAttribute(
            uint256(publicHash),
            "Type",
            0
        );
        ITokenAttributeSetter(address(this)).setAttribute(
            uint256(publicHash),
            "Power",
            1
        );

        // mint the token to the receiver using the public hash
        IERC1155Mint(s.tokenMinterStorage.token).mint(
            receiver,
            uint256(publicHash),
            1,
            ""
        );

        // emit the event
        emit Token(receiver, uint256(publicHash));
    }

}
