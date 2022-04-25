
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
            (existingSchema) => existingSchema.name === schemaObj.name
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
                (existingField) => existingField.name === field.name
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
    await Promise.all(newSchemas.map((s) => s.save()));
    await Promise.all(updatedSchemas.map((s) => s.update()));
}

