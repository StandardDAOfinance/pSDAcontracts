/**
 *
 * @param {Parse} Parse
 */
 exports.up = async (Parse) => {
  const className = 'Listings';
  const schema = new Parse.Schema(className);

  schema
    .addPointer('token', 'GemToken')
    .addPointer('collection', 'Collection')
    .addPointer('type', 'GemTypes')
    .addPointer('sale', 'Sales')
    .addPointer('close', 'Closes')
    .addString('title')
    .addString('description')
    .addBoolean('closed')

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
  const className = 'Listings';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
