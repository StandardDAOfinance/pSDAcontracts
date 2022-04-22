/**
 *
 * @param {Parse} Parse
 */
 exports.up = async (Parse) => {
  // TODO: set className here
  const className = 'Contracts';
  const schema = new Parse.Schema(className);

  // TODO: Set the schema here
  // Example:
  schema
    .addString('address')
    .addString('type')
    .addString('name')
    .addString('symbol')
    .addBoolean('enabled')
    .addNumber('startBlock')

  try {
    await schema.update();
  } catch (e) {}

  const Collection = Parse.Object.extend(className);
  const tokenEventListeners = [
    // {
    //   address: "0xdF99eb724ecaB8cE906EA637342aD9c3E7844F98",
    //   type: "ERC1155",
    //   name: "TestERC1155",
    //   symbol: "ERC1155",
    //   enabled: true,
    //   startBlock: 14000000,
    // }
  ];

  const updater = async() => {
    return Promise.all(tokenEventListeners.map(async el => (new Collection (el))));
  }

  return updater();
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async (Parse) => {
  // TODO: set className here
  const className = 'Contracts';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
