import { JsonFragment } from "@ethersproject/abi";
import { Contract, ethers } from "ethers";

import { getSyncTag, setSyncTag } from "./eventmodel";


/**
 * sync an event to Parse
 * @param provider
 * @param contract
 * @param contractAbi
 * @param eventKind
 * @param eventParams
 * @param eventHandler
 * @param eventResponder
 * @returns
 */
export default async function syncEvent(
  provider: any,
  contract: any,
  contractAbi: any,
  eventKind: any,
  eventParams: any,
  eventHandler: any,
  eventResponder: any,
  scanStartBLock = 0,
  scanEndBlock = 0
) {
  console.log(`installing listener for ${eventKind} ${contract.address}`);

  // set up the event listener
  if(contract) contract.on(eventKind, eventResponder);
  else return;

  /**
   * get the start block for the sync. Saves its sync position in the cache
   * and can be cleared by setting the RESET_SYNC environment variable to true
   * and passing in the start block as an environment variable called FILTER_FROM
   * @returns {Promise<{syncBlock, curBlock}>}
   */
  async function getStartBlock(
    provider: any,
    contract: any,
    eventKind: any
  ): Promise<any> {
    // get the last sync block or the system default
    const syncBlockTag = `${eventKind}_${contract.address}`;
    let syncBlock = await getSyncTag(syncBlockTag);
    if (syncBlock) {
      syncBlock = scanStartBLock;
    }
    // get the start block
    const curBlock = await provider.getBlockNumber();
    return { syncBlock, curBlock, syncBlockTag };
  }

  /**
   * remove underscopres from the event name
   * @param {*} event
   * @returns cleaned up object
   */
  function processEvent(event: { [x: string]: any; }) {
    const processedEvent: any = {};
    Object.keys(event).forEach((k) => {
      const value = event[k];
      if (k.startsWith("_")) {
        k = k.substring(1);
      }
      processedEvent[k] = value;
    });
    return processedEvent;
  }

  /**
   * setup the event filter
   * @param {*} contract
   * @param {*} syncBlock
   * @param {*} eventKind
   * @param {*} eventParams
   * @returns the event filter
   */
  function setupEventFilter(
    contract: any,
    syncBlock: any,
    eventKind: any,
    eventParams: any
  ) {
    // set up the event filter we are gonna query - this takes
    // params for the filter expression - null returns all
    const filterFunc = contract.filters[eventKind];
    let filter: any;
    if(eventParams.length === 0) filter = filterFunc(null);
    else if(eventParams.length === 1) filter = filterFunc(eventParams[0]);
    else if(eventParams.length === 2) filter = filterFunc(eventParams[1], eventParams[1]);
    else if(eventParams.length === 3) filter = filterFunc(eventParams[2], eventParams[1], eventParams[2]);
    else if(eventParams.length === 4) filter = filterFunc(eventParams[3], eventParams[1], eventParams[2], eventParams[3]);
    else if(eventParams.length === 5) filter = filterFunc(eventParams[4], eventParams[1], eventParams[2], eventParams[3], eventParams[4]);
    else if(eventParams.length === 6) filter = filterFunc(eventParams[5], eventParams[1], eventParams[2], eventParams[3], eventParams[4], eventParams[5]);
    else if(eventParams.length === 7) filter = filterFunc(eventParams[6], eventParams[1], eventParams[2], eventParams[3], eventParams[4], eventParams[5], eventParams[6]);
    else if(eventParams.length === 8) filter = filterFunc(eventParams[7], eventParams[1], eventParams[2], eventParams[3], eventParams[4], eventParams[5], eventParams[6], eventParams[7]);
    else if(eventParams.length === 9) filter = filterFunc(eventParams[8], eventParams[1], eventParams[2], eventParams[3], eventParams[4], eventParams[5], eventParams[6], eventParams[7], eventParams[8]);
    else if(eventParams.length === 10) filter = filterFunc(eventParams[9], eventParams[1], eventParams[2], eventParams[3], eventParams[4], eventParams[5], eventParams[6], eventParams[7], eventParams[8], eventParams[9]);
    const syncVal: any = syncBlock;
    if (!syncVal) {
      filter.fromBlock = parseInt(process.env.FILTER_FROM || "0");
      filter.toBlock = getLaterBlock(filter.fromBlock);
    } else {
      filter.fromBlock = parseInt(syncVal);
      filter.toBlock = getLaterBlock(filter.fromBlock);
    }
    return { filter };
  }

  let chunkSize = 10000, zeroResultCount = 0, largeResultCount = 0;
  let { syncBlock, curBlock, syncBlockTag }: any = await getStartBlock(
    provider,
    contract,
    eventKind
  );

  /**
   * get later block
   * @param {*} bin
   * @returns
   */
  const getLaterBlock = (bin: number) => {
    return bin + chunkSize > curBlock ? curBlock : bin + chunkSize;
  };

  /**
   * add to cache
   * @param {*} type
   * @param {*} event
   * @param {*} handler
   * @returns added to cache
   */
  const addToCache = async (type: any, event: { event: any; log: any; }, handler: (arg0: {}, arg1: any, arg2: any, arg3: any) => any) => {
    return await handler(
      processEvent(event.event),
      event.log,
      contract,
      contractAbi
    );
  };

  // exit if the filter is not found
  if (!contract.filters[eventKind]) {
    console.log(eventKind, `filter not found`);
    return [];
  }

  let filter: any = undefined;
  try {
    let ef = setupEventFilter(contract, syncBlock, eventKind, eventParams);
    filter = ef.filter;
  } catch (e) {
    console.log(`error setting up filter for ${eventKind}`);
    return [];
  }

  let eventsOut: any[] = [];

  /**
   * process
   * @returns
   */
  const processLoop: any = async () => {

    async function getLogs() {
      const _getLogs = async () => {
        return ((await provider.getLogs(filter)) || [])
        .map((log: { data: ethers.utils.BytesLike; }) => ({
          event: new ethers.utils.Interface(contractAbi).decodeEventLog(
            eventKind,
            log.data
          ),
          log,
        }))
        .filter((e: { event: { [x: string]: any; }; }) => e.event["values"]);
      }
      let tries = 0;
      try {
        return await _getLogs();
      } catch (e) {
        if (tries < 3) {
          tries++;
          return setTimeout(async () => await _getLogs(), 1000);
        }
        throw e;
      }
    }

    // get the logs
    let events = await getLogs();

  //  if (events.length)
      console.log(eventKind, filter.fromBlock, filter.toBlock, events.length);

    let promises = [];

    // add each of the items to the cache
    for (let j = 0; j < events.length; j++) {
      promises.push( addToCache(eventKind, events[j], eventHandler));
      if(promises.length > 100) {
        await Promise.all(promises);
        promises = [];
      }
    }
    await Promise.all(promises);
    promises = [];

    filter.fromBlock = filter.toBlock; // the block to start indexing from. This should be the block the contract was deployed at.
    filter.toBlock = getLaterBlock(filter.fromBlock);

    eventsOut = eventsOut.concat(events);

    // store the block height we scanned to
    try {
      await setSyncTag(syncBlockTag, filter.fromBlock);
      if(events.length === 0) zeroResultCount++;
      if(events.length > 1000) largeResultCount++;

      // if we have had ten zero results in a row
      // increase the chunk size by a factor of 10
      if(zeroResultCount > 10) {
        if(chunkSize < 100000)
          chunkSize = chunkSize * 10;
        zeroResultCount = 0;
        largeResultCount = 0;
      }
      // else if we have had two large results in a row
      // decrease the chunk size by a factor of 10
      else if(largeResultCount > 2 || events.length > 10000) {
        if(chunkSize > 100)
          chunkSize = chunkSize / 10;
        zeroResultCount = 0;
        largeResultCount = 0;
      }
      // else if the result is somewhere between 0 and 1000
      // reset zero and large result counts to keep chunksize where it is
      else if(events.length>0 && events.length<1000) {
        zeroResultCount = 0;
        largeResultCount = 0;
      }
    } catch (e) {
      console.log('error storing sync tag', syncBlockTag);
    }

    if (filter.fromBlock < curBlock) {
      // we have more to do
      return await processLoop();
    }
  };

  await processLoop();

  return eventsOut;
}

module.exports = syncEvent;
