/**
 *
 * @param {Parse} Parse
 */
 exports.up = async (Parse) => {
  // TODO: set className here
  const className = 'Tokens';
  const schema = new Parse.Schema(className);

  // TODO: Set the schema here
  // Example:
  schema
    .addPointer('pool', 'Pools')
    .addString('tokenAddress')
    .addString('tokenId')
    .addString('collectionId')
    .addString('name')
    .addString('symbol')
    .addString('description')
    .addNumber('decimals')
    .addNumber('totalSupply')
    .addBoolean('generateId')

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
  const className = 'Tokens';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
