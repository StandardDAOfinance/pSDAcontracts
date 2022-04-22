import { installEventListener }   from "./event/listeners";

import { configureBlockchains, getBlockchain } from "../../lib/blockchain";

/**
 *  listen for events on the EVM and write them to the database
 */
export default class EVMEventsAdapter {
  serverUrl: any;
  networkId: any;
  listeners: any = [];
  constructor(options: any) {
    this.serverUrl = options.serverUrl;
    this.networkId = options.networkId;
  }

  /**
   * listen to a single event
   * @param eventDef
   * @returns
   */
  async listenForEvent(eventDef: any) {
    if (!eventDef) {
      return;
    }
    if (!this.serverUrl) {
      throw new Error("no server URL");
    }
    const listener = await installEventListener(this.serverUrl, eventDef);
    this.listeners.push(listener);
  }

  /**
   * listen to events
   */
  async listenForEvents(eventListeners:any) {
    if (eventListeners && eventListeners.length > 0)
      await Promise.all(eventListeners.map((e : any) => this.listenForEvent(e)));
  }
}

module.exports = EVMEventsAdapter;
