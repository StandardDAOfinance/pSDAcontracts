/**
 *
 * @param {Parse} Parse
 */
exports.up = async Parse => {
  const className = 'GIAData';
  const schema = new Parse.Schema(className);
  const inData = [
    {
      giaNumber: '2195021387',
      shape: 'Cushion',
      cuttingstylecrown: 'Brilliant',
      cuttingstylepavillion: 'Modified Brilliant Cut',
      transparency: 'Translucent',
      color: 'Purplish Red',
      species: 'Natural Corundum',
      variety: 'Ruby',
      carat: 29.2,
      measurements: {width: '24.31', height: '18.86', depth: '5.47 '},
      price: 222,
      usdValuation: 1000000000.00
    },
    {
      giaNumber: '6183775938',
      shape: 'Princess',
      cuttingstylecrown: 'Step',
      cuttingstylepavillion: '',
      transparency: 'Translucent',
      color: 'Red',
      species: 'Natural Corundum',
      variety: 'Ruby',
      carat: 33.92,
      measurements: {width: '31.51', height: '15.98', depth: '7.61 '},
      price: 222,
      usdValuation: 1000000000.00
    },
    {
      giaNumber: '2183775988',
      shape: 'Pear',
      cuttingstylecrown: 'Brilliant',
      cuttingstylepavillion: 'Step',
      transparency: 'Translucent',
      color: 'Red',
      species: 'Natural Corundum',
      variety: 'Ruby',
      carat: 32.16,
      measurements: {width: '26.99', height: '17.89', depth: '7.32 '},
      price: 222,
      usdValuation: 1000000000.00
    },
    {
      giaNumber: '6197017063',
      shape: 'Oval',
      cuttingstylecrown: 'Brilliant',
      cuttingstylepavillion: 'Step',
      transparency: 'Translucent',
      color: 'Purplish Red',
      species: 'Natural Corundum',
      variety: 'Ruby',
      carat: 22.41,
      measurements: {width: '19.70', height: '13.25', depth: '8.61 '},
      price: 222,
      usdValuation: 1000000000.00
    },
    {
      giaNumber: '5192021390',
      shape: 'Pear',
      cuttingstylecrown: 'Brilliant',
      cuttingstylepavillion: 'Step',
      transparency: 'Translucent',
      color: 'Purplish Red',
      species: 'Natural Corundum',
      variety: 'Ruby',
      carat: 28.1,
      measurements: {width: '30.55', height: '16.43', depth: '6.01 '},
      price: 222,
      usdValuation: 1000000000.00
    },
    {
      giaNumber: '5191021375',
      shape: 'Octagonal',
      cuttingstylecrown: 'Step',
      cuttingstylepavillion: 'N/A',
      transparency: 'Translucent',
      color: 'Purplish Red',
      species: 'Natural Corundum',
      variety: 'Ruby',
      carat: 27.08,
      measurements: {width: '29.16', height: '11.50', depth: '6.75 '},
      price: 222,
      usdValuation: 1000000000.00
    },
    {
      giaNumber: '5191016946',
      shape: 'Round',
      cuttingstylecrown: 'Brilliant',
      cuttingstylepavillion: 'Step',
      transparency: 'Translucent',
      color: 'Purplish Red',
      species: 'Natural Corundum',
      variety: 'Ruby',
      carat: 28.01,
      measurements: {width: '18.78', height: '19.09', depth: '8.29 '},
      price: 222,
      usdValuation: 1000000000.00
    },
    {
      giaNumber: '5192020373',
      shape: 'Pear',
      cuttingstylecrown: 'Brilliant',
      cuttingstylepavillion: 'Step',
      transparency: 'Translucent',
      color: 'Purplish Red',
      species: 'Natural Corundum',
      variety: 'Ruby',
      carat: 28.72,
      measurements: {width: '23.29', height: '15.7', depth: '8.88 '},
      price: 222,
      usdValuation: 1000000000.00
    },
    {
      giaNumber: '2195017692',
      shape: 'Oval',
      cuttingstylecrown: 'Brilliant',
      cuttingstylepavillion: 'Pear',
      transparency: 'Translucent',
      color: 'Purplish Red',
      species: 'Natural Corundum',
      variety: 'Ruby',
      carat: 27.51,
      measurements: {width: '21.16', height: '15.17', depth: '9.16 '},
      price: 222,
      usdValuation: 1000000000.00
    },
    {
      giaNumber: '2195017062',
      shape: 'Oval',
      cuttingstylecrown: 'Brilliant',
      cuttingstylepavillion: 'Step',
      transparency: 'Translucent',
      color: 'Red',
      species: 'Natural Corundum',
      variety: 'Ruby',
      carat: 21.23,
      measurements: {width: '21.63', height: '14.32', depth: '6.93'},
      price: 222,
      usdValuation: 1000000000.00
    },
    {
      giaNumber: '2191020306',
      shape: 'Cushion',
      cuttingstylecrown: 'Brilliant',
      cuttingstylepavillion: 'Step',
      transparency: 'Translucent',
      color: 'Purplish Red',
      species: 'Natural Corundum',
      variety: 'Ruby',
      carat: 37.35,
      measurements: {width: '23.95', height: '20.89', depth: '7.84'},
      price: 222,
      usdValuation: 1000000000.00
    }
  ];

  schema
    .addPointer('token', 'GemToken')
    .addString('title')
    .addString('type')
    .addString('giaNumber')
    .addString('description')
    .addString('collection')
    .addString('category')
    .addString('giareport');

  const dataKeys = Object.keys(inData[0]);
  dataKeys.forEach(key => {
    if(key === 'measurements') schema.addObject(key);
    else schema.addString(key);
  });
  const pluralize = function(word) {
    // add an s to the end of a word/ for words that end with y, ie. "story", change to "stories"
    if (word.endsWith('y')) {
      return word.slice(0, -1) + 'ies';
    }
    return word + 's';
  };
  try {
    await schema.update();
  } catch (e) {}

  const Collection = Parse.Object.extend(className);

  const getMeasurementsText = (mObj) => {
    return mObj ? `${mObj.width}mm wide x ${mObj.height}mm high x ${mObj.depth}mm depth` : "";
  }

  const updater = async toUpdate => {
    // toUpdate is a json object
    const title = `${toUpdate.carat} ${toUpdate.shape} ${toUpdate.variety}`;
    let description =`This is a ${toUpdate.carat} carat ${toUpdate.shape} ${toUpdate.variety} gem with a ${toUpdate.cuttingstylepavillion} cut pavillion & ${toUpdate.cuttingstylecrown} cut crown. Its dimensions are ${getMeasurementsText(toUpdate.measurements)} with a ${toUpdate.color} color`
    const collection = `The ${toUpdate.variety} Collection`;
    const category = pluralize(toUpdate.variety);
    const type = category;
    delete toUpdate.priceineth;
    toUpdate.price = '0.01';
    const toSave = Object.assign({}, toUpdate, {
      title,
      description,
      collection,
      category,
      type
    });
    return (await new Collection(toSave)).save({}, {useMasterKey: true});
  };
  return await Promise.all(inData.map(updater));
};

/**
 *
 * @param {Parse} Parse
 */
exports.down = async Parse => {
  const className = 'GIAData';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
