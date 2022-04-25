/**
 * get records from the database
 * @param {*} collectionName
 * @returns
 */
async function getRecords(collectionName) {
  const Collection = Parse.Object.extend(collectionName);
  const query = new Parse.Query(Collection);
  return await query.find({ useMasterKey: true });
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
  return await query.find({ useMasterKey: true });
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
  return await query.first({ useMasterKey: true });
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
    await collection.save(null, { useMasterKey: true });
  } else {
    collection.set(objectKeyField, objectKeyValue);
    Object.keys(objectDefinition).forEach((key) =>
      collection.set(key, objectDefinition[key])
    );
    await collection.save(null, { useMasterKey: true });
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
    await collection.save(null, { useMasterKey: true });
  } else {
    collection.set(objectKeyField, objectKeyValue);
    Object.keys(objectDefinition).forEach((key) =>
      collection.set(key, objectDefinition[key])
    );
    await collection.save(null, { useMasterKey: true });
  }
  return collection;
}

function deleteObject(objectType, objectKeyField, objectKeyValue) {

  const Collection = Parse.Object.extend(objectType);
  const query = new Parse.Query(Collection);
  query.equalTo(objectKeyField, objectKeyValue);
  const delObj = query.find({ useMasterKey: true });
  Moralis.Object.destroyAll(delObj, { useMasterKey: true });

}