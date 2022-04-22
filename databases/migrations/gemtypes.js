/**
 *
 * @param {Parse} Parse
 */
 exports.up = async (Parse) => {
  const className = 'GemTypes';
  const schema = new Parse.Schema(className);

  schema
    .addString('name')
    .addString('description')
    .addRelation('tokens', 'GemToken');

    try {
      await schema.update();
    } catch (e) {}

    const Collection = Parse.Object.extend(className);

    const updater = async() => {
      (await new Collection({
        name: 'Diamonds',
        description: 'Diamonds'
      })).save({},{useMasterKey:true});
      (await new Collection({
        name: 'Rubies',
        description: 'Rubies'
      })).save({},{useMasterKey:true});
      (await new Collection({
        name: 'Emeralds',
        description: 'Emeralds'
      })).save({},{useMasterKey:true});
      (await new Collection({
        name: 'Sapphires',
        description: 'Sapphires'
      })).save({},{useMasterKey:true});
    }

    return updater();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async (Parse) => {
  const className = 'GemTypes';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
