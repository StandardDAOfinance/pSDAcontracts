require('dotenv').config();
const { readFileSync } = require('fs');
/**
 *
 * @param {Parse} Parse
 */
 exports.up = async (Parse) => {
  // TODO: set className here
  const className = 'EventListeners';
  const schema = new Parse.Schema(className);
  let deployment = readFileSync ('./deployments/' + process.env.NETWORK_NAME + '/Diamond.json');
  deployment = JSON.parse(deployment);

  // TODO: Set the schema here
  // Example:
  schema
    .addString('title')
    .addString('name')
    .addNumber('startBlock')
    .addObject('configuration')

  try {
    await schema.update();
  } catch (e) {}

  const Collection = Parse.Object.extend(className);
  const updater = async() => {
    (await new Collection ({
      title: "GemPoolCreated",
      name: "GemPoolCreated",
      startBlock: parseInt(process.env.START_BLOCK),
      configuration: {
        title: "GemPoolCreated",
        name: "GemPoolCreated",
        contract: "GemPoolFacet",
        networkId: process.env.NETWORK_ID,
        target: "GemPoolCreated",
        topic:
          "GemPoolCreated(address indexed,address indexed,uint256 indexed,tuple(address,tuple(uint8,uint256,address),tuple(address,uint256,uint256,string,string,string,uint8,uint256,bool,uint256,uint256,uint256),tuple(uint256,uint8,uint256,uint256),bool,bool,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,bool,uint256,bool))",
        arguments:
          "address indexed,address indexed,uint256 indexed,tuple(address,tuple(uint8,uint256,address),tuple(address,uint256,uint256,string,string,string,uint8,uint256,bool,uint256,uint256,uint256),tuple(uint256,uint8,uint256,uint256),bool,bool,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,bool,uint256,bool)",
        abi: [
          "event GemPoolCreated(address indexed,address indexed,uint256 indexed,tuple(address,tuple(uint8,uint256,address),tuple(address,uint256,uint256,string,string,string,uint8,uint256,bool,uint256,uint256,uint256),tuple(uint256,uint8,uint256,uint256),bool,bool,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,bool,uint256,bool))",
        ],
        addresses: [
          deployment.address,
        ],
      }
    })).save({}, { useMasterKey: true });
    (await new Collection ({
      title: "GemCreated",
      name: "GemCreated",
      startBlock: parseInt(process.env.START_BLOCK),
      configuration: {
        title: "GemCreated",
        name: "GemCreated",
        contract: "GemPoolFacet",
        networkId: process.env.NETWORK_ID,
        target: "GemCreated",
        topic:
          "GemCreated(address,uint256,uint256,tuple(address,uint256,uint256,string,string,string,uint8,uint256,bool,uint256,uint256,uint256),uint256)",
        arguments:
          "address,uint256,uint256,tuple(address,uint256,uint256,string,string,string,uint8,uint256,bool,uint256,uint256,uint256),uint256",
        abi: [
          "event GemCreated(address,uint256,uint256,tuple(address,uint256,uint256,string,string,string,uint8,uint256,bool,uint256,uint256,uint256),uint256)",
        ],
        addresses: [
          deployment.address,
        ],
      }
    })).save({}, { useMasterKey: true });

    (await new Collection ({
      title: "ClaimCreated",
      name: "ClaimCreated",
      startBlock: parseInt(process.env.START_BLOCK),
      configuration: {
        title: "ClaimCreated",
        name: "ClaimCreated",
        contract: "GemPoolFacet",
        networkId: process.env.NETWORK_ID,
        target: "ClaimCreated",
        topic:
          "ClaimCreated(address indexed,address indexed,tuple(uint256,uint256,address,address,uint256,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256))",
        arguments:
          "address indexed,address indexed,tuple(uint256,uint256,address,address,uint256,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256)",
        abi: [
          "event ClaimCreated(address,uint256,uint256,tuple(address,uint256,uint256,string,string,string,uint8,uint256,bool,uint256,uint256,uint256),uint256)",
        ],
        addresses: [
          deployment.address,
        ],
      }
    })).save({}, { useMasterKey: true });

    (await new Collection ({
      title: "ClaimRedeemed",
      name: "ClaimRedeemed",
      startBlock: parseInt(process.env.START_BLOCK),
      configuration: {
        title: "ClaimRedeemed",
        name: "ClaimRedeemed",
        contract: "GemPoolFacet",
        networkId: process.env.NETWORK_ID,
        target: "ClaimRedeemed",
        topic:
          "ClaimRedeemed(address indexed,address indexed,tuple(uint256,uint256,address,address,uint256,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256))",
        arguments:
          "address indexed,address indexed,tuple(uint256,uint256,address,address,uint256,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256)",
        abi: [
          "event ClaimRedeemed(address indexed,address indexed,tuple(uint256,uint256,address,address,uint256,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256))",
        ],
        addresses: [
          deployment.address,
        ],
      }
    })).save({},{useMasterKey:true});
  }

  return updater();
};


const listeners = [
  {
    name: "GemPoolCreated",
    contract: "GemPoolFacet",
    topic: "GemPoolCreated(address indexed,address indexed,uint256 indexed,tuple(address,tuple(uint8,uint256,address),tuple(address,uint256,uint256,string,string,string,uint8,uint256,bool,uint256,uint256,uint256),tuple(uint256,uint8,uint256,uint256),bool,bool,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,bool,uint256,bool))",
  },{
    name: "ClaimCreated",
    contract: "GemPoolFacet",
    topic: "ClaimCreated(address indexed,address indexed,tuple(uint256,uint256,address,address,uint256,address,uint256,uint256,uint256,uint256,uint256,uint256))",
  },{
    name: "ClaimRedeemed",
    contract: "GemPoolFacet",
    topic: "ClaimRedeemed(address indexed,address indexed,tuple(uint256,uint256,address,address,uint256,address,uint256,uint256,uint256,uint256,uint256,uint256))",
  },{
    name: "GemCreated",
    contract: "GemPoolFacet",
    topic: "GemCreated(address,uint256,uint256,tuple(address,uint256,uint256,string,string,string,uint8,uint256,bool,uint256,uint256,uint256),uint256)",
  },
];

/**
 *
 * @param {Parse} Parse
 */
exports.down = async (Parse) => {
  // TODO: set className here
  const className = 'EventListeners';
  const schema = new Parse.Schema(className);

  return schema.purge().then(() => schema.delete());
};
