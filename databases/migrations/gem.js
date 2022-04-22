/**
 *
 * @param {Parse} Parse
 */
exports.up = async (Parse) => {
  // TODO: set className here
  const className = 'Gems';
  const schema = new Parse.Schema(className);

  // TODO: Set the schema here
  // Example:
  schema
    .addPointer('claim', 'Claim')
    .addPointer('pool', 'Pool')
    .addPointer('token', 'Token')
    .addPointer('creator', 'EthNFTTransfers')
    .addRelation('owners', 'EthNFTTransfers')
    .addString('genHash')
    .addNumber('quantity')

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
  const className = 'Gems';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
