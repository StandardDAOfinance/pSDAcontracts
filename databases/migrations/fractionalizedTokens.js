/**
 *
 * @param {Parse} Parse
 */
 exports.up = async (Parse) => {
  const className = 'FractionalizedToken';
  const schema = new Parse.Schema(className);

  schema
    .addString('tokenAddress')
    .addString('tokenId')
    .addString('fractionalizedToken')
    .addString('fractionalizedQuantity')

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
  const className = 'FractionalizedToken';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
