9/**
 *
 * @param {Parse} Parse
 */
exports.up = async (Parse) => {
  // TODO: set className here
  const className = 'Users';
  const schema = new Parse.Schema(className);

  // TODO: Set the schema here
  // Example:
  schema
    .addRelation('claims', 'Claims')
    .addRelation('gems', 'Gems')
    .addString('address')

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
  const className = 'Users';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
