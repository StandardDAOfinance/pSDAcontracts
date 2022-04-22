//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


import "./IToken.sol";
import "./ITokenPrice.sol";

/// @notice check the balance of earnings and collect earnings
interface IGemPool {

    /// @dev Event generated when a gem is created
    event GemPoolCreated(

        // the gem pool account
        address creator,

        // the gem pool account
        address contractAddress,

        // the gem pool id
        uint256 pool,

        // the gem token definition
        GemPoolSettings gemPoolDefinition

    );

    /// @dev Event generated when a gem is created
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

    // mutable pool values
    struct GemPoolData {

        // the gem pool id
        uint256 pool;

        // nnext available gem hash
        uint256 nextGemHash;

        // numbering for the next gem
        uint256 nextGemNumber;

        // total number of gems minted
        uint256 gemsMintedCount;

        // total amount of staked eth
        uint256 totalStakedEth;

    }


    /// @notice staking pool settings - used to confignure a staking pool
    struct GemPoolSettings {

        // the token address we mint on
        address token;

        IToken.TokenSource tokenSource;

        IToken.TokenDefinition tokenDefinition;

        ITokenPrice.TokenPriceData initialPrice;

        // is pool enabled
        bool enabled;

        // is the pool visible
        bool visible;

        // min and max token amounts to stake
        uint256 minTime;

        // max time that the claim can be made
        uint256 maxTime;

        // the difficulty step adjustment (or increase amount if PriceModifier is Static)
        uint256 diffstep;

        // max total number of claims that can be made
        uint256 maxClaims;

        // max quantity per claim
        uint256 maxQuantityPerClaim;

        // max claims per account
        uint256 maxClaimsPerAccount;

        // earn rate for this staking pool
        uint256 earnRatePerPeriod;

        // the number of blocks per earning period
        uint256 earnPeriodBlocks;

        // payout partial blocks
        bool payPartialBlocks;

        // mint the earned token
        bool mintEarnedToken;

        // max total earned amount per stake
        uint256 maxTotalEarnedAmount;

        // allow outright purchases of gems
        bool allowPurchase;

    }

    struct GemPoolStruct {

        GemPoolSettings _gemPoolSettings;
        GemPoolData _gemPoolData;

    }

    /// @notice get the hash of a gem pool
    function gemPoolHash(string memory symbol) external view returns (uint256 _gemPoolHash);
    /// @notice is token a member of the gem pool
    function isMemberOfPool(uint256 gemPoolId, uint256 token) external view returns (bool _isMember);
    /// @notice get the member gems of this pool
    function poolMembers(uint256 gemPoolId) external view returns (uint256[] memory _poolMembers);
    /// get the gem pool symbols in the contract
    function symbols() external view returns (string[] memory _symbols);

}
