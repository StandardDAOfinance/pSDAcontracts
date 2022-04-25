

/**
* trigger called when a token is deplosited into the staking pool
*/
Parse.Cloud.afterSave("TokenDeposited", function (request) {
    // exit if not confirmed
    if(request.object.get('confirmed') === false) return;
    const { tokenId, staker } = request.object.attributes;
    // save the staked tokens record
    saveObjectFromDefinition("StakedToken", "tokenId", tokenId, {
        tokenId,
        staker
    });
});

/**
 * trigger called when a token is withdrawn from the staking pool
 */
Parse.Cloud.afterSave("TokenWithdrawn", async function (request) {
    if(request.object.get('confirmed') === false) return;
    const { tokenId, totalAccrued } = request.object.attributes;

    saveObjectFromDefinition("Token", "tokenId", tokenId, {
        tokenId,
        staker,
        power: totalAccrued
    });
    
    deleteObject("StakedToken", "tokenId", tokenId);
});

/**
 * get the staked tokens for a given staker
 */
async function getStakedTokens(staker) {
    const query = new Parse.Query("StakedTokens");
    query.equalTo("staker", staker);
    query.find();
}

/**
 * implementation for get latest attribute value
 */
 Parse.Cloud.define("getStakedTokens", (request) => {
    const staker = request.params.staker;
   return getStakedTokens(staker);
 });

 /**
 * implementation for get latest attribute value
 */
  Parse.Cloud.define("numTokensMinted", () => {
    const recs = getRecords("Token");
      return { count: recs.length };
 });
