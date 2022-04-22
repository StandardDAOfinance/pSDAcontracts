/**
 *
 * @param {Parse} Parse
 */
 exports.up = async (Parse) => {
  const className = 'GemToken';
  const schema = new Parse.Schema(className);

  schema
    .addPointer('collection', 'Collection')
    .addPointer('category', 'Category')
    .addPointer('type', 'GemTypes')
    .addPointer('data', 'GIAData')
    .addPointer('transfer', 'EthNFTTransfers')
    .addString('imageUrl')

    const updater = async() => {}

    try {
      await schema.update();
    } catch (e) {}

    return updater();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async (Parse) => {
  const className = 'GemToken';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
