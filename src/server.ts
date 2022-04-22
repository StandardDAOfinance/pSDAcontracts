require('dotenv').config();

export const express = require('express');
export const ParseServer = require('parse-server').ParseServer;
export const logger = require('parse-server').logger;
export const app = express();
export const start = async () => {
  var {config} = require('./config');
  var api = new ParseServer(config);

  // start the Parse server instance
  app.use('/parse', api);
  const serverPort = process.env.SERVER_PORT || 1337;
  app.listen(serverPort, () => {
    logger.info(`parse server running on port ${serverPort}`);
  //  ParseServer.createLiveQueryServer(app);
    config.evmEventsAdapter.listenForEvents(config.listeners);
  });
};
