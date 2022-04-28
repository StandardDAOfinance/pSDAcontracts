/**
 * save a gem pool to the database given its definition
 * @param {*} pool
 * @param {*} gemPoolDefinition
 * @returns the gem pool object
 */
async function saveMetadata(tokenHash, metadata) {

  return await saveObjectFromDefinition("Metadata", "tokenHash", tokenHash, {
    metadata,
  });
  
}

const orgJson = {
  
  "name": "DaoDon Access Card",
  "description": "The DaoDon Access Card serves as your pass into the DaoDon community. In addition to premium web3 perks, members will have priority access to upcoming future mints that are launching in partnership with DaoDon.",
  "image": "ipfs://bafybeieng6su3hiyrdhcmhghzsyarsrp4owlvqxwrj6o4zmmmaqjkhye5u",
  "animation_url": "ipfs://bafybeih2rfaxvqgutjq7tqcvnoxyvv25ljp3p3lbuqetmr6yebvojvmvxa",
  "external_url": "https://thepub.daodon.io/#/terminal/",

}

Moralis.Cloud.define("metadata", async (request) => {

  // get metadata for a token. Takes one argument: tokenId
  const logger = Moralis.Cloud.getLogger();
  logger.info(`metadata ${request.params.tokenId}`);

  const _token = await getRecord("Token", "tokenId", request.params.tokenId);
  if (!_token) return undefined;

  let latestPowerValue = await getLatestRecord('PowerUpdated', 'tokenId', request.params.tokenId);
  latestPowerValue = latestPowerValue ? latestPowerValue.get('power') : 1;

  const attributes = [
    {
      "display_type": "number",
      "trait_type": "Power",
      "value": latestPowerValue
    }
  ]

  return Object.assign(orgJson, { attributes });

});;

Moralis.Cloud.define("contractMetadata", async () => {

  // get metadata for a token. Takes one argument: tokenId
  const logger = Moralis.Cloud.getLogger();
  logger.info(`contractMetadata`);
  return orgJson;

});
