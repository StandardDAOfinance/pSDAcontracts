// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../diamond/LibAppStorage.sol";

import "../interfaces/IGemPool.sol";
import "../interfaces/IClaim.sol";
import "../interfaces/IBank.sol";
import "../interfaces/IERC1155.sol";
import "../interfaces/IERC1155Mint.sol";
import "../interfaces/IERC1155Burn.sol";
import "../interfaces/IFeeManager.sol";
import "../interfaces/ITransfer.sol";

contract GemPoolFacet is Modifiers {
    using UInt256Set for UInt256Set.Set;

    /// @notice generated when a gem pool is created
    event GemPoolCreated(
        // the gem pool account
        address indexed creator,
        // the gem pool account
        address indexed contractAddress,
        // the gem pool id
        uint256 indexed pool,
        // the gem pool definition
        IGemPool.GemPoolSettings gemPoolDefinition
    );

    /// @notice generated when a gem is created
    event GemCreated(
        // the gem pool account
        address account,
        // the gem pool id
        uint256 pool,
        // the gem hash
        uint256 gemHash,
        // the gem token definition
        IToken.TokenDefinition tokenDefinition,
        // the gem token quantity
        uint256 quantity
    );

    /// @notice emitted when a token is added to the collection
    event ClaimCreated(
        address indexed user,
        address indexed minter,
        IClaim.Claim claim
    );

    /// @notice emitted when a token is removed from the collection
    event ClaimRedeemed (
        address indexed user,
        address indexed minter,
        IClaim.Claim claim
    );


    /// @notice validate that the claim is valid
    /// @param claim the claim to validate
    /// @return _valid the gem pool to validate against
    function _validateCreateClaim(IClaim.Claim memory claim)
    internal returns(bool _valid) {
        // zero payment
        require(msg.value != 0, "Zero payment attached");
        // zero qty
        require(claim.mintQuantity != 0, "Zero quantity order");
        _valid = true;
    }

    /// @notice the hash of the next gem to be minted
    function _nextTokenHash()
        internal view returns (uint256) {
        return uint256(
            keccak256(abi.encodePacked(
                "claim",
                address(this),
                s.gemPoolStorage._claimIndex)
            )
        );
    }

    // Added new hash function for Gems to avoid getting
    // `Token already registered.` from Minting registry
    // TODO: Check with Seb about this approach.
    function _nextGemHash(uint256 id)
        internal view returns (uint256) {
        return uint256(
            keccak256(abi.encodePacked(
                "gem",
                address(this),
                id)
            )
        );
    }


    /// @notice get the hash for this
    /// @param symbol the gem symbol
    /// @return __gemPoolHash the hash for this
    function _gemPoolHash(string memory symbol) internal view returns (uint256 __gemPoolHash) {
        __gemPoolHash = uint256(keccak256(abi.encodePacked("gemPool", address(this), symbol)));
    }

    /// @notice get the gem pool hash
    /// @param symbol the gem symbol
    /// @return __gemPoolHash the gem pool hash
    function gemPoolHash(string memory symbol) external view returns (uint256 __gemPoolHash) {
        __gemPoolHash = _gemPoolHash(symbol);
    }

    /// @notice returns all the record hashes in the collection as an array
    /// @return _output the collection as an array
    function symbols() external view returns (string[] memory _output) {
        _output = s.gemPoolStorage._symbols;
    }

    /// @notice returns all the record hashes in the collection as an array
    /// @param gemPoolId the gem pool id
    /// @return _output the collection as an array
    function poolHashes(uint256 gemPoolId) external view returns (uint256[] memory _output) {
        _output = s.gemPoolStorage._recordHashes[gemPoolId].keyList;
    }

    /// @notice returns the token at the given index
    /// @param gemPoolId the gem pool id
    /// @param token the index of the token to return
    /// @return _isMember the token at the given index
    function isPoolMember(uint256 gemPoolId, uint256 token) external view returns (bool _isMember) {
        _isMember = s.gemPoolStorage._recordHashes[gemPoolId].exists(token);
    }

    /// @notice gives all the record hashes in the collection as an array
    /// @param gemPoolId the collection as an array
    /// @return _output the collection as an array
    function poolMembers(uint256 gemPoolId) external view virtual returns (uint256[] memory _output) {
        _output = s.gemPoolStorage._recordHashes[gemPoolId].keyList;
    }

    /// @notice create a claim
    /// @param __gemPoolHash the gem pool hash
    /// @return _gpsettings the claim hash
    function getGemPool(uint256 __gemPoolHash) external view returns (IGemPool.GemPoolSettings memory _gpsettings) {
        require(
            s.gemPoolStorage._gemPools[__gemPoolHash]._gemPoolSettings.tokenDefinition.id == __gemPoolHash,
            "invalid gem pool"
        );
        _gpsettings = s.gemPoolStorage._gemPools[__gemPoolHash]._gemPoolSettings;
    }

    /// @notice add a new gem pool
    /// @param gemPoolSettings the gem pool settings
    /// @return _gemPoolId the gem pool id
    function addGemPool(IGemPool.GemPoolSettings memory gemPoolSettings) public returns (uint256 _gemPoolId) {
        // get the deterministic hash for the gem pool
        _gemPoolId = _gemPoolHash(gemPoolSettings.tokenDefinition.symbol);
        require(s.gemPoolStorage._gemPools[_gemPoolId]._gemPoolData.pool == 0, "collection already deployed");
        s.gemPoolStorage._symbols.push(gemPoolSettings.tokenDefinition.symbol);
        // record the gem pool data
        s.gemPoolStorage._gemPools[_gemPoolId]._gemPoolSettings = gemPoolSettings;
        s.gemPoolStorage._gemPools[_gemPoolId]._gemPoolSettings.tokenDefinition.id = _gemPoolId;
        // emit a message to announce the gem pool creation
        emit GemPoolCreated(
            msg.sender,
            address(this),
            _gemPoolId,
            s.gemPoolStorage._gemPools[_gemPoolId]._gemPoolSettings
        );
    }

    /// @notice validate that the claim is valid
    /// @param claim the claim to validate
    /// @param _valid the gem pool to validate against
    function _validateCollectClaim(IClaim.Claim memory claim)
    internal view returns(bool _valid) {

        // validation checks - disallow if not owner (holds coin with claimHash)
        // or if the unlockTime amd unlockPaid data is in an invalid state
        require(IERC1155(address(this)).balanceOf(msg.sender, claim.id) == 1,
            "Not the claim owner");
        uint256 unlockTime = claim.createdTime + claim.depositLength;
        uint256 unlockPaid = claim.depositAmount;
        // both values must be greater than zero
        require(unlockTime != 0 && unlockPaid > 0, "Invalid claim");
        _valid = true;

    }

    /// @notice create a claim
    /// @param claim the claim
    /// @return _claim the claim
    function createClaim(IClaim.Claim memory claim) public payable returns (IClaim.Claim memory _claim) {
        _createClaims(claim, msg.value);
        // create the claim and send it to the user
        _claim = s.gemPoolStorage._claims[
            claim.id
        ];
        // record the record hash data
        s.gemPoolStorage._recordHashes[claim.poolId].insert(_claim.id);
        s.gemPoolStorage._claimIndex++;
    }

    /// @notice submit claim for collection
    /// @param claimHash the id of the claim
    /// @param requireMature the require mature flag
    function collectClaim(uint256 claimHash, bool requireMature) external {
        // collect the claim and maybe mint a gem to the user
        bool gemMinted = _collectClaim(claimHash, requireMature);
        if (gemMinted) {
            IClaim.Claim storage claim = s.gemPoolStorage._claims[claimHash];
            emit GemCreated(
                msg.sender,
                s.gemPoolStorage._claims[claimHash].poolId,
                claimHash,
                s.gemPoolStorage._gemPools[claimHash]._gemPoolSettings.tokenDefinition,
                claim.mintQuantity
            );
        }
    }

    /// @notice create a claim to mint a given gem
    /// @param claim the claim to mint
    function _createClaims(
        IClaim.Claim memory claim,
        uint256 msgValue
    ) internal {

        // validate the incoming claim to mint
        require(_validateCreateClaim(claim), "Invalid claim");
        // assign system values - always override user values in case shit happens
        claim.id = _nextTokenHash();
        claim.creator = msg.sender;
        claim.createdTime = block.timestamp;
        claim.createdBlock = block.number;
        if(claim.depositToken != address(0)) {
            // if this is an ERC20 claim then transfer the erc20 into the bank
            IBank(address(this)).deposit(
                uint256(uint160(claim.depositToken)), // need to cast address to uint to pass it in
                claim.depositAmount);
        } else {
            // make sure we got enough ether to cover the deposit
            require(msgValue >= claim.depositAmount, "Insufficient deposit");
            // else this is ether so transfer the ether into the bank
             IBank(address(this)).depositFrom{value:claim.depositAmount}(
                msg.sender,
                0,
                claim.depositAmount);
        }

        // add the claim to the pool
        _addClaim(claim);
        // increase the staked eth balance
        s.gemPoolStorage._stakedTotal[claim.depositToken] += claim.depositAmount;
        // return the extra tokens to sender
        if (msg.value > claim.depositAmount && claim.depositToken == address(0)) {
            (bool success, ) = payable(msg.sender).call{
                value: msg.value - claim.depositAmount
            }("");
            require(success, "Failed to refund extra payment");
        }

        s.gemPoolStorage._claimIndex++;
    }

    /// @notice add a claim to the claims list
    /// @param claim the claim to add
    function _addClaim(
        IClaim.Claim memory claim
    ) internal {

        // mint the new claim to the caller's address
        IERC1155Mint(address(this)).setMintAllowance(msg.sender, claim.id, 1);
        IERC1155Mint(address(this)).mint(msg.sender, claim.id, 1, "");
        // add the claims to claim list
        s.gemPoolStorage._claims[claim.id] = claim;
        // emit a event announceing claim
        emit ClaimCreated(claim.creator, address(this), claim);

    }

    /// @notice add a claim to the claims list
    /// @param claim the claim to add
    function _addGem(
        IClaim.Claim memory claim
    ) internal {

        // get the next gem hash, increase the staking sifficulty
        // for the pool, and mint a gem token back to account
        claim.gemHash = _nextGemHash(claim.id);
        // mint the new claim to the caller's address
        IERC1155Mint(address(this)).setMintAllowance(msg.sender, claim.gemHash, claim.mintQuantity);
        IERC1155Mint(address(this)).mint(
            msg.sender,
            claim.gemHash,
            claim.mintQuantity,
            ""
        );
        // update the claim
        s.gemPoolStorage._claims[claim.id] = claim;
        // emit an event about a gem getting created
        emit ClaimRedeemed(claim.creator, address(this), claim);

    }


     /// @notice collect an open claim (take custody of the funds the claim is redeeemable for and maybe a gem too)
    /// @param _claimHash the claim to collect
    /// @param _requireMature if true, the claim must be mature
    function _collectClaim(
        uint256 _claimHash,
        bool _requireMature
    ) internal returns (bool) {

        // get the claim for this claim id
        IClaim.Claim memory claim = s.gemPoolStorage._claims[_claimHash];
        require(claim.id == _claimHash, "Claim not found");
        // check the maturity of the claim - only issue gem if mature
        bool isMature = claim.createdTime + claim.depositLength < block.timestamp;
        require(!_requireMature || (_requireMature && isMature), "Immature Claim");
        // validate the claim
        require(_validateCollectClaim(claim), "Invalid claim");
        // grab the erc20 token info if there is any
        uint256 unlockTokenPaid = claim.depositAmount;
        //  burn claim and transfer money back to user
        IERC1155Burn(address(this)).burn(msg.sender, claim.id, 1);
        // if they used erc20 tokens stake their claim, return their tokens
        if (claim.depositToken != address(0)) {
            // calculate fee portion using fee tracker
            uint256 feePortion = 0;
            if (isMature == true) {
                uint256 ccFee = IFeeManager(address(this)).fee("collect_claim");
                ccFee = ccFee == 0 ? 1 : ccFee;
                feePortion = unlockTokenPaid / ccFee;
            }
            if(feePortion != 0) {
                // transfer fee to ourselves
                ITransfer(address(this)).transfer(
                    address(this),
                    uint256(uint160(claim.depositToken)),
                    feePortion
                );
                // return deposit to originator
                ITransfer(address(this)).transfer(
                    msg.sender,
                    uint256(uint160(claim.depositToken)),
                    unlockTokenPaid - feePortion
                );
                // record the fee paid by the user
                claim.feePaid = feePortion;
            }
        } else {
            // calculate fee portion using fee tracker
            uint256 feePortion = 0;
            if (isMature == true) {
                uint256 ccFee = IFeeManager(address(this)).fee("collect_claim");
                ccFee = ccFee == 0 ? 1 : ccFee;
                feePortion = claim.depositAmount / ccFee;
            }
            // transfer the ETH fee to fee tracker
            (bool sent,) = payable(address(this)).call{value: feePortion}("");
            require(sent, "Failed to send Ether");
            // transfer the ETH back to user
            IBank(address(this)).withdrawTo(
                msg.sender,
                0,
                claim.depositAmount - feePortion
            );
            // update the claim with the fee paid
            claim.feePaid = feePortion;
        }
        // update the claim with the claim block
        claim.claimedBlock = block.number;
        // increase the staked eth balance
        s.gemPoolStorage._stakedTotal[claim.depositToken] += claim.depositAmount;
        // emit an event that the claim was redeemed for ETH
        emit ClaimRedeemed(
            msg.sender,
            address(address(this)),
            claim
        );
        // We have already verified whether claim is matured or not above so mint the gem
        // create a new token from the claim
        _addGem(claim);

        return true;
    }
}
