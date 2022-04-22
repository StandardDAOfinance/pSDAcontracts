import "dotenv/config";

// evn events adapter for parse server
var EVMEventsAdapter = require("./adapters/parse-server-evm-event-adapter");
var medataService = require("./adapters/parse-server-metadata-service");

var networkId = process.env.NETWORK_ID;
var serverUrl =  process.env.ETH_NODE_URI;
var mnemonic =  process.env.MNEMONIC;
const listeners = [
  {
    "name": "GemPoolCreated",
    "contract": "GemPoolFacet",
    "topic": "GemPoolCreated(address indexed,address indexed,uint256 indexed,tuple(address,tuple(uint8,uint256,address),tuple(address,uint256,uint256,string,string,string,uint8,uint256,bool,uint256,uint256,uint256),tuple(uint256,uint8,uint256,uint256),bool,bool,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,bool,uint256,bool))",
  },{
    "name": "ClaimCreated",
    "contract": "GemPoolFacet",
    "topic": "ClaimCreated(address indexed,address indexed,tuple(uint256,uint256,address,address,uint256,address,uint256,uint256,uint256,uint256,uint256,uint256))",
  },{
    "name": "ClaimRedeemed",
    "contract": "GemPoolFacet",
    "topic": "ClaimRedeemed(address indexed,address indexed,tuple(uint256,uint256,address,address,uint256,address,uint256,uint256,uint256,uint256,uint256,uint256))",
  },{
    "name": "GemCreated",
    "contract": "GemPoolFacet",
    "topic": "GemCreated(address,uint256,uint256,tuple(address,uint256,uint256,string,string,string,uint8,uint256,bool,uint256,uint256,uint256),uint256)",
  }
];
// evm events adapter
var evmEventsAdapter = new EVMEventsAdapter({ networkId, serverUrl, mnemonic, listeners });

// metadata service
var metadataService = new medataService({});

export const config = {
  appId: process.env.APPLICATION_ID,
  masterKey: process.env.MASTER_KEY,
  appName: process.env.APPNAME,
  cloud: process.env.CLOUD,
  databaseURI: process.env.DBURI,
  evmEventsAdapter,
  metadataService,
  listeners
};
