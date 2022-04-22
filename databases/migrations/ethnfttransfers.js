/**
 *
 * @param {Parse} Parse
 */
 exports.up = async (Parse) => {
  const className = 'EthNFTTransfers';
  const schema = new Parse.Schema(className);

  schema
    .addPointer('token', 'GemToken')

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
  const className = 'EthNFTTransfers';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
