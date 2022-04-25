/**
 * implementation for the tokenURI metadata endpoint
 */
Parse.Cloud.define("exportEventListeners", async () => {
  return JSON.parse(JSON.stringify(await exportEventListeners()));
});

/**
 * implementation for the tokenURI metadata endpoint
 */
Parse.Cloud.define("exportSchema", async () => {
  return exportParseSchema();
});

/**
* export event listeners
* @returns
*/
async function exportEventListeners() {
  const Collection = Parse.Object.extend("EventSync");
  const query = new Parse.Query(Collection);
  const results = await query.find();
  return results.map((e) => e.attributes);
}

/**
 * export a moralis schema
 * @returns
 */
async function exportParseSchema() {
  const eData = {
    schema: (await Parse.Schema.all())
      .map((schema) => JSON.parse(JSON.stringify(schema)))
      .filter((schema) => schema.startsWith("_")),
  };

  const Collection = Parse.Object.extend("EventSync");
  const query = new Parse.Query(Collection);
  const results = await query.fetchAll();
  eData.eventSync = JSON.parse(JSON.stringify(results));
  return eData;
}
