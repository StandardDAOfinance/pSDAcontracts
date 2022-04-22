import 'dotenv/config';

import hre from 'hardhat';

import fs from 'fs';
import express from 'express';

// evn events adapter for parse server
var EVMEventsAdapter = require("../src/adapters/parse-server-evm-event-adapter");

var networkId = process.env.NETWORK_ID;
var serverUrl =  process.env.ETH_NODE_URI;
var mnemonic =  process.env.MNEMONIC;
const listeners = [
  {
    "name": "GemPoolCreated",
    "contract": "GemPoolFacet",
    "startBlock": 0,
    "topic": "GemPoolCreated(address indexed,address indexed,uint256 indexed,tuple(address,tuple(uint8,uint256,address),tuple(address,uint256,uint256,string,string,string,uint8,uint256,bool,uint256,uint256,uint256),tuple(uint256,uint8,uint256,uint256),bool,bool,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,bool,uint256,bool))",
  },{
    "name": "ClaimCreated",
    "contract": "GemPoolFacet",
    "startBlock": 0,
    "topic": "ClaimCreated(address indexed,address indexed,tuple(uint256,uint256,address,address,uint256,address,uint256,uint256,uint256,uint256,uint256,uint256))",
  },{
    "name": "ClaimRedeemed",
    "contract": "GemPoolFacet",
    "startBlock": 0,
    "topic": "ClaimRedeemed(address indexed,address indexed,tuple(uint256,uint256,address,address,uint256,address,uint256,uint256,uint256,uint256,uint256,uint256))",
  },{
    "name": "GemCreated",
    "contract": "GemPoolFacet",
    "startBlock": 0,
    "topic": "GemCreated(address,uint256,uint256,tuple(address,uint256,uint256,string,string,string,uint8,uint256,bool,uint256,uint256,uint256),uint256)",
  }
];
// evm events adapter
var evmEventsAdapter = new EVMEventsAdapter({ networkId, serverUrl, mnemonic, listeners });

export const ParseServer = require('parse-server').ParseServer;
export const logger = require('parse-server').logger;
export const app = express();


var privateKey  = fs.readFileSync('./server.key', 'utf8');
var certificate = fs.readFileSync('./server.crt', 'utf8');
var credentials = { key: privateKey, cert: certificate };

async function main() {

  // this is the Parse server
  const api = new ParseServer({
    databaseURI: process.env.DBURI,
    cloud: process.env.CLOUD,
    appId: process.env.APPLICATION_ID,
    masterKey: process.env.MASTER_KEY,
    serverURL: process.env.SERVER_URL,
    liveQuery: {
      classNames: ['Posts', 'Comments'] // List of classes to support for query subscriptions
    }
  });

  // Serve the Parse API on the /parse URL prefix
  app.use('/parse', api);

  // this is the Parse server
  const port = process.env.PORT || 1337;
  const sport = process.env.HTTPS_PORT || 1337;

  // this is the Parse server
  const httpServer = require('http').createServer(app);
  //const httpsServer = require('https').createServer(credentials, app);

  // this is the Parse server
  httpServer.listen(port, function() {
    logger.info('parse running on port ' + port + '.');
    evmEventsAdapter.listenForEvents(listeners);
  });


  // httpsServer.listen(sport, function() {
  //   logger.info('parse running on port ' + sport + '.');
  // });

  // this is the Parse server
  ParseServer.createLiveQueryServer(httpServer);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => {})
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
