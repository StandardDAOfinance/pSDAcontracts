9/**
 *
 * @param {Parse} Parse
 */
exports.up = async (Parse) => {
  // TODO: set className here
  const className = 'UserPreferences';
  const schema = new Parse.Schema(className);

  // TODO: Set the schema here
  // Example:
  schema
    .addString('gem_hash')
    .addString('wallet_address')
    .addNumber('position')
    .addBoolean('mintable')

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
  const className = 'UserPreferences';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
