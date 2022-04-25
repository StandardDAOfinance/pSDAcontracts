async function getLatestAttributeValue(tokenId, attributeName) {
    const query = new Parse.Query("AttributeSet");
    query.equalTo("tokenId", tokenId);
    query.descending("createdAt");
    query.limit(1);
    const results = await query.find();
    if (results.length > 0) {
        const result = results[0];
        return result.get(attributeName);
    }
    return null;
}

// get the most recently updated value  for every key of the tokenId
async function getLatestAttributeValues(tokenId) {
    const query = new Parse.Query("AttributeSet");
    query.equalTo("tokenId", tokenId);
    query.descending("createdAt");
    const attributes = {};
    const results = await query.find();
    if (results.length > 0) {
        for (const result of results) {
            const key = result.attributes.key;
            if (key && !attributes[key]) {
                attributes[key] = result.attributes;
            }
        }

    }
    return attributes;
}

/**
 * implementation for get latest attribute value
 */
Parse.Cloud.define("getLatestAttributeValue", async (request) => {
    const tokenId = request.params.tokenId;
    const key = request.params.key;
    return await getLatestAttributeValue(tokenId, key);
});

/**
* implementation for get latest attribute values
*/
Parse.Cloud.define("getLatestAttributeValues", async (request) => {
    const tokenId = request.params.tokenId;
    return await getLatestAttributeValues(tokenId);
});
