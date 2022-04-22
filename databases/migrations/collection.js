/**
 *
 * @param {Parse} Parse
 */
exports.up = async (Parse) => {
  const className = 'Collection';
  const schema = new Parse.Schema(className);

  schema
    .addString('name')
    .addString('description')
    .addString('imageUrl')
    .addRelation('tokens', 'GemToken')
    .addPointer('parent', 'Collection')
    .addRelation('children', 'Collection');

    try {
      await schema.update();
    } catch (e) {}

    const Collection = Parse.Object.extend(className);

    const updater = async() => {
      (await new Collection ({
        name: 'The Diamond Collection',
        description: 'The Diamond Collection',
      })).save({},{useMasterKey:true});
      (await new Collection ({
        name: 'The Ruby Collection',
        description: 'The Ruby Collection'
      })).save({},{useMasterKey:true});
      (await new Collection ({
        name: 'The Emerald Collection',
        description: 'The Emerald Collection'
      })).save({},{useMasterKey:true});
      (await new Collection ({
        name: 'The Sapphire Collection',
        description: 'The Sapphire Collection'
      })).save({},{useMasterKey:true});
    }

    return updater();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async (Parse) => {
  const className = 'Collection';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
