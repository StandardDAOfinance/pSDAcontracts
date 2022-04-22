/**
 * get records from the database
 * @param {*} collectionName
 * @returns
 */
async function getRecords(collectionName) {
  const Collection = Parse.Object.extend(collectionName);
  const query = new Parse.Query(Collection);
  return await query.find({useMasterKey: true});
}

/**
 * get records from the database - filter by one field
 * @param {*} collectionName
 * @param {*} collectionIdField
 * @param {*} collectionId
 * @returns
 */
async function getRecordsFiltered(
  collectionName,
  collectionIdField,
  collectionId
) {
  const Collection = Parse.Object.extend(collectionName);
  const query = new Parse.Query(Collection);
  query.equalTo(collectionIdField, collectionId);
  return await query.find({useMasterKey: true});
}

/**
 * get a single record from the database
 * @param {*} collectionName
 * @param {*} collectionIdField
 * @param {*} collectionId
 * @returns
 */
async function getRecord(collectionName, collectionIdField, collectionId) {
  const Collection = Parse.Object.extend(collectionName);
  const query = new Parse.Query(Collection);
  query.equalTo(collectionIdField, collectionId);
  return await query.first({useMasterKey: true});
}

/**
 * save a gem pool to the database given its definition
 * @param {*} pool
 * @param {*} tokenSaleDefinition
 * @returns the gem pool object
 */
async function saveObjectFromDefinition(
  objectType,
  objectKeyField,
  objectKeyValue,
  objectDefinition
) {
  // get the gempool collection
  let collection = await getRecord(objectType, objectKeyField, objectKeyValue);

  if (!collection || collection.length == 0) {
    const Collection = Parse.Object.extend(objectType);
    collection = new Collection(objectDefinition);
    await collection.save(null, {useMasterKey: true});
  } else {
    collection.set(objectKeyField, objectKeyValue);
    Object.keys(objectDefinition).forEach(key =>
      collection.set(key, objectDefinition[key])
    );
    await collection.save(null, {useMasterKey: true});
  }
  return collection;
}

/**
 * save a gem pool to the database given its definition
 * @param {*} pool
 * @param {*} tokenSaleDefinition
 * @returns the gem pool object
 */
async function createCollection(
  objectType,
  objectKeyField,
  objectKeyValue,
  objectDefinition
) {
  // get the gempool collection
  let collection = await getCollection(
    objectType,
    objectKeyField,
    objectKeyValue
  );

  if (!collection || collection.length == 0) {
    const Collection = Parse.Object.extend(objectType);
    collection = new Collection(objectDefinition);
    await collection.save(null, {useMasterKey: true});
  } else {
    collection.set(objectKeyField, objectKeyValue);
    Object.keys(objectDefinition).forEach(key =>
      collection.set(key, objectDefinition[key])
    );
    await collection.save(null, {useMasterKey: true});
  }
  return collection;
}

/**
 * export a moralis schema
 * @returns
 */
async function exportParseSchema() {
  const eData = {
    schema: (await Parse.Schema.all())
      .map(schema => JSON.parse(JSON.stringify(schema)))
      .filter(schema => schema.startsWith('_'))
  };

  const Collection = Parse.Object.extend('EventSync');
  const query = new Parse.Query(Collection);
  const results = await query.fetchAll();
  eData.eventSync = JSON.parse(JSON.stringify(results));
  return eData;
}

/**
 * import a moralis schema
 * @param {*} schemas
 */
async function importParseSchema(schemas) {
  // get the existing schema and oragnize it by name
  const existingSchemas = await Parse.Schema.all();
  const schemasByClassname = schemas.reduce((acc, schema) => {
    const classname = schema.classname;
    acc[classname] = schema;
    return acc;
  }, {});

  const newSchemas = [],
    updatedSchemas = [];
  for (var schemaIndex = 0; schemaIndex < schemas.length; schemaIndex++) {
    // the schema object - might not be null if schema exists
    let schemaObj = schemas[schemaIndex];
    const existingSchemaObj = schemasByClassname[schemaObj.classname].find(
      existingSchema => existingSchema.name === schemaObj.name
    );

    // create new schema if one is needed to create
    if (!existingSchemaObj) {
      schemaObj = new Parse.Schema(schemaObj.classname);
      newSchemas.push(schemaObj);
    } else {
      schemaObj = existingSchemaObj;
      existingSchemas.push(existingSchemaObj);
    }

    // add fields to the new/existing schema
    for (
      var fieldIndex = 0;
      fieldIndex < schemaObj.fields.length;
      fieldIndex++
    ) {
      const field = schemaObj.fields[fieldIndex];
      const existingField = existingSchemaObj.fields.find(
        existingField => existingField.name === field.name
      );
      if (!existingField) {
        // create new field
        schemaObj.addField(field.name, field.type, field.defaultValue);
      }
    }

    // set CLP for this object
    schemaObj.setCLP(schemaObj.classname, schemaObj.classLevelPermissions);
  }

  // save all the new schemas and update the existing ones
  await Promise.all(newSchemas.map(s => s.save()));
  await Promise.all(updatedSchemas.map(s => s.update()));
}

/**
 * export event listeners
 * @returns
 */
async function exportEventListeners() {
  const Collection = Parse.Object.extend('EventSync');
  const query = new Parse.Query(Collection);
  const results = await query.find();
  return results.map(e => e.attributes);
}

/**
 * save a gem pool to the database given its definition
 * @param {*} pool
 * @param {*} gemPoolDefinition
 * @returns the gem pool object
 */
async function saveTokenFromDefinition(poolHash, poolDefinition) {
  // save the token to the database
  return saveObjectFromDefinition('Tokens', 'symbol', poolDefinition[2][4], {
    token: poolDefinition[2][0],
    id: poolDefinition[2][1],
    collectionId: poolDefinition[2][2],
    name: poolDefinition[2][3],
    symbol: poolDefinition[2][4],
    description: poolDefinition[2][5],
    decimals: poolDefinition[2][6],
    totalSupply: poolDefinition[2][7],
    generateId: poolDefinition[2][8],
    probability: poolDefinition[2][9],
    probabilityIndex: poolDefinition[2][10],
    probabilityRoll: poolDefinition[2][11]
  });
}

/**
 * save a gem pool to the database given its definition
 * @param {*} pool
 * @param {*} gemPoolDefinition
 * @returns the gem pool object
 */
async function saveMetadata(tokenHash, metadata) {
  return await saveObjectFromDefinition('Metadata', 'tokenHash', tokenHash, {
    metadata
  });
}

/**
 * implementation for the tokenURI metadata endpoint
 */
Parse.Cloud.define('exportEventListeners', async () => {
  return JSON.parse(JSON.stringify(await exportEventListeners()));
});

/**
 * implementation for the tokenURI metadata endpoint
 */
Parse.Cloud.define('exportSchema', async () => {
  return exportParseSchema();
});

/**
 * trigger called when the merkle pool token sale is created
 */
Parse.Cloud.afterSave('GemPoolCreated', async function(request) {
  async function savePoolFromDefinition(token, poolHash, poolDefinition) {
    if(!poolDefinition) {
      console.warn('poolDefinition is null');
      return;
    }
    // save the token to the database
    return saveObjectFromDefinition(
      'Pools',
      'symbol',
      poolDefinition[2][4],
      {
        token,
        poolHash,
        symbol: poolDefinition[2][4],
        name: poolDefinition[2][3],
        tokenSource: {
          type: poolDefinition[1][0],
          staticSourceId: poolDefinition[1][1],
          collectionSourceAddress: poolDefinition[1][2]
        },
        initialPrice: poolDefinition[3],
        enabled: poolDefinition[4],
        visible: poolDefinition[5],
        minTime: poolDefinition[6],
        maxTime: poolDefinition[7],
        diffstep: poolDefinition[8],
        maxClaims: poolDefinition[9],
        maxQuantityPerClaim: poolDefinition[10],
        maxClaimsPerAccount: poolDefinition[11]
      }
    );
  }
  const obj = request.object.attributes;
  await savePoolFromDefinition(obj.contractAddress, obj.pool, obj.gemPoolDefinition);
});

/**
 * trigger called when the merkle pool token sale is created
 */
Parse.Cloud.afterSave('ClaimCreated', async function(request) {
  async function saveClaimFromDefinition(claimHash, claimDefinition) {
    await saveObjectFromDefinition('Claims', 'claimHash', claimHash, {
      claimHash: claimDefinition[0],
      poolId: claimDefinition[1],
      creator: claimDefinition[2],
      minter: claimDefinition[3],
      depositAmount: claimDefinition[4],
      depositToken: claimDefinition[5],
      mintQuantity: claimDefinition[6],
      depositLength: claimDefinition[7],
      createdTime: claimDefinition[8],
      createdBlock: claimDefinition[9],
      claimedBlock: claimDefinition[10],
      gemHash: claimDefinition[11],
      feePaid: claimDefinition[12]
    });
  }
  const obj = request.object.attributes.eventData.claim;
  await saveClaimFromDefinition(obj[0], obj);
});

Parse.Cloud.afterSave('ClaimRedeemed', async function(request) {
  async function saveClaimFromDefinition(claimHash, claimDefinition) {
    await saveObjectFromDefinition('Claims', 'claimHash', claimHash, {
      claimHash: claimDefinition[0],
      poolId: claimDefinition[1],
      creator: claimDefinition[2],
      minter: claimDefinition[3],
      depositAmount: claimDefinition[4],
      depositToken: claimDefinition[5],
      mintQuantity: claimDefinition[6],
      depositLength: claimDefinition[7],
      createdTime: claimDefinition[8],
      createdBlock: claimDefinition[9],
      claimedBlock: claimDefinition[10],
      gemHash: claimDefinition[11],
      feePaid: claimDefinition[12]
    });
  }
  const obj = request.object.attributes.eventData.claim;
  await saveClaimFromDefinition(obj[0], obj);
});

/**
 * trigger called when the merkle pool token sale is created
 */
Parse.Cloud.afterSave('GemCreated', async function(request) {
  async function saveGemFromDefinition(
    account,
    poolId,
    gemHash,
    quantity,
    tokenDefinition
  ) {
    const pool = await getRecord('Pools', 'poolHash', poolId);
    const token = await getRecord('Tokens', 'symbol', pool.symbol);
    await saveObjectFromDefinition('Gems', 'gemHash', gemHash, {
      account,
      creator,
      gemHash,
      token,
      pool,
      poolId,
      quantity,
      tokenDefinition
    });
  }
  const {
    pool,
    gemHash,
    quantity,
    tokenDefinition
  } = request.object.attributes.eventData;



  await saveGemFromDefinition(
    pool,
    gemHash,
    quantity,
    tokenDefinition );
});
