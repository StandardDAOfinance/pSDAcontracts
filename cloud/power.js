 

/**
* attribute set saved
*/
Parse.Cloud.afterSave("PowerUpdated", function (request) {
    // exit if not confirmed
    if(request.object.get('confirmed') === false) return;
    const { tokenId, address, power } = request.object.attributes;
    // save the staked tokens record
    saveObjectFromDefinition("Token", "tokenId", tokenId, {
        power,
        address,
        tokenId
    });
});
