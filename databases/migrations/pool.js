/**
 *
 * @param {Parse} Parse
 */
exports.up = async (Parse) => {
  // TODO: set className here
  const className = 'Pools';
  const schema = new Parse.Schema(className);

  // TODO: Set the schema here
  // Example:
  schema
    .addRelation('claims', 'Claims')
    .addRelation('gems', 'Gems')
    .addPointer('token', 'Token')
    .addPointer('creator', 'EthNFTTransfers')

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
  const className = 'Pools';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
