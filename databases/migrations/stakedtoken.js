/**
/**
 *
 * @param {Parse} Parse
 */
exports.up = async (Parse) => {
  // TODO: set className here
  const className = 'StakedToken';
  const schema = new Parse.Schema(className);

  // TODO: Set the schema here
  // Example:
  schema
    .addString('tokenId')
    .addString('staker')

  try {
    await schema.update();
  } catch (e) {}

  const Collection = Parse.Object.extend(className);

  const updater = async() => {}
  return updater();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async (Parse) => {
  // TODO: set className here
  const className = 'StakedToken';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
