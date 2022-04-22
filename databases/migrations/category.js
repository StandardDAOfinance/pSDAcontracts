/**
 *
 * @param {Parse} Parse
 */
exports.up = async (Parse) => {
  // TODO: set className here
  const className = 'Category';
  const schema = new Parse.Schema(className);

  // TODO: Set the schema here
  // Example:
  schema
    .addString('name')
    .addRelation('collections', 'Collection')
    .addRelation('tokens', 'GemToken');

  try {
    await schema.update();
  } catch (e) {}

  const Collection = Parse.Object.extend(className);

  const updater = async() => {
    (await new Collection({
      name: 'Diamonds'
    })).save({},{useMasterKey:true});
    (await new Collection({
      name: 'Rubies'
    })).save({},{useMasterKey:true});
    (await new Collection({
      name: 'Emeralds'
    })).save({},{useMasterKey:true});
    (await new Collection({
      name: 'Sapphires'
    })).save({},{useMasterKey:true});
  }

  return updater();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async (Parse) => {
  // TODO: set className here
  const className = 'Category';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
