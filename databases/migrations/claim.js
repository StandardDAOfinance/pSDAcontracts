/**
 *
 * @param {Parse} Parse
 */
 exports.up = async (Parse) => {
  // TODO: set className here
  const className = 'Claims';
  const schema = new Parse.Schema(className);

  // TODO: Set the schema here
  // Example:
  schema
    .addPointer('gem','Gem')
    .addPointer('pool','Pool')
    .addPointer('owner','EthNFTTransfers')
    .addString('claimId')
    .addString('poolId')
    .addString('creatorAddress')
    .addString('minterAddress')
    .addString('depositAmount')
    .addString('depositToken')
    .addNumber('mintQuantity')
    .addString('depositLength')
    .addNumber('createdTime')
    .addNumber('createdBlock')
    .addNumber('claimedBlock')
    .addString('gemHash')
    .addString('feePaid')
  try {
    await schema.update();
  } catch (e) {}

  const updater = async() => {
  }

  return updater();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async (Parse) => {
  // TODO: set className here
  const className = 'Claims';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
