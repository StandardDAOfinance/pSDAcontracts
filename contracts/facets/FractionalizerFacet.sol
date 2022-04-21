// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC1155/utils/ERC1155Receiver.sol)
pragma solidity ^0.8.0;

import "../diamond/LibAppStorage.sol";
import "../token/ERC721A/ERC721A.sol";
import { Create2 } from "@openzeppelin/contracts/utils/Create2.sol";
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

/**
 * @dev Implements attributes on a token. an attribute is a value that can be modified by permissioned contracts. The attribute is also displayed on the token.
 */
contract FractionalizerFacet is Modifiers {

    event Fractionalized(address indexed tokenAddress, uint256 indexed tokenId, address fractionalizedToken, uint256 fractionalizedQuantity);

    /// @notice set an attribute to a tokenid keyed by string
    function fractionalize(
        string memory symbol,
        string memory name,
        string memory baseUri,
        address tokenAddress,
        uint256 tokenId,
        uint256 fractionalizedQuantity,
        address tokenReceiver
    ) external onlyOwner returns (address _address) {
        // make a keccak256 hash of the token address and token id
        bytes32 _tokenHash = tokenHash(tokenAddress, tokenId);

        // compute the create2 address
        _address = Create2.computeAddress(_tokenHash, keccak256(type(FractionalizedToken).creationCode));

        // require this token is not already fractionalized
        require(s.fractionalizerStorage.fractionalizedTokens[_address].tokenAddress == address(0), "ERC1155: token already fractionalized");

        // create the fractionalized token using create2
        _address = address(Create2.deploy(0, _tokenHash, type(FractionalizedToken).creationCode));

        // set the fractionalized token data
        s.fractionalizerStorage.fractionalizedTokens[_address] = FractionalizedTokenData(
            symbol,
            name,
            tokenAddress,
            tokenId,
            _address,
            fractionalizedQuantity
        );

        // initialize the token
        FractionalizedToken(_address).initialize(symbol, name, baseUri, tokenReceiver, fractionalizedQuantity);

        // send a fractionalized event
        emit Fractionalized(tokenAddress, tokenId, _address, fractionalizedQuantity);
    }

    /// @notice get the token hash
    function tokenHash(address tokenAddress, uint256 tokenId) public pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(tokenAddress, tokenId)
        );
    }

}
