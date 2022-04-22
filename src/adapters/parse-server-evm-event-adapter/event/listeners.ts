import { insertRecord } from '../../../lib/parse/parsequery';
import hre from 'hardhat';
import web3 from 'web3';
import { keccak256 } from '@ethersproject/solidity';

/**
 * the event listener
 */
export class EventListener {
  name: string = 'Event';
  abi: any = null;
  addresses: string[] = [];
  topic: string = '';
  startBlock: number = 0;
  web3Instance: any;
  web3InstanceUrl: any;
  contract: any;

  constructor(
    name: string,
    abi: any,
    address: string,
    topic: string,
    startBlock: number
  ) {
    this.name = name;
    this.abi = abi;
    this.addresses = [address];
    this.topic = topic;
    this.startBlock = startBlock || 3000000;
  }

  async listenToEvents(listener: any) {
    this.contract.events[this.name]({
      fromBlock: this.startBlock
    }).on('data', listener)
  }

  async getEvents(providerUrl: string): Promise<any> {
    const address = (await hre.deployments.get('Diamond')).address;
    const events: any = await Promise.all(
      this.addresses.map(async (a: string) => {
        if(!this.web3InstanceUrl || this.web3InstanceUrl !== providerUrl) {
          const provider = new web3.providers.HttpProvider(providerUrl);
          this.web3Instance = new web3(provider);
          this.web3InstanceUrl = providerUrl;
          this.contract = new this.web3Instance.eth.Contract(this.abi, address);
        }
        return this.contract.getPastEvents(this.name, {
          fromBlock: `0x${this.startBlock.toString(16)}`,
          toBlock: 'latest'
        });
      })
    );
    return [].concat.apply([], events);
  }

}


/**
 * install a standard event listener
 * @param blockchain
 * @param eListener
 */
export async function installEventListener(serverUrl: any, eListener: any) {

  // get the event listener
  const eventListener = eListener;

  const dmnd = await hre.deployments.get('Diamond');
  const depl = await hre.deployments.get(eventListener.contract);

  // create a new event listener object
  const listener = new EventListener(
    eventListener.name,
    depl.abi,
    dmnd.address,
    eventListener.topic,
    eventListener.startBlock
  );

  // get the events
  const events = await listener.getEvents(serverUrl);
  const eventListenerFunc = (event: any) => {
    const eventHash = event.transactionHash + '.' + event.logIndex;
    const eventData = event.returnValues;
    const eventName = event.event;
    const eventBlock = event.blockNumber;
    const eventTransactionHash = event.transactionHash;
    const eventTransactionIndex = event.transactionIndex;
    const eventBlockHash = event.blockHash;
    const eventAddress = event.address;
    const eventTimestamp = event.timestamp;
    const eventLogIndex = event.logIndex;
    const eventId = event.id;
    const eventObj = {
      eventName,
      eventHash,
      eventBlock,
      eventTransactionHash,
      eventTransactionIndex,
      eventBlockHash,
      eventAddress,
      eventTimestamp,
      eventLogIndex,
      eventId,
      eventData
    };
    return eventObj;
  }
  const eventObjects = events.map(eventListenerFunc);

  await Promise.all(eventObjects.map(async (record:any) =>
    insertRecord(record.eventName, 'eventHash', record.eventHash, record)
  ));
  console.log('inserted ' + eventObjects.length + ' events');

  await listener.listenToEvents(async (record: any) => {
    const rec = eventListenerFunc(record);
    insertRecord(rec.eventName, 'eventHash', rec.eventHash, rec);
    console.log('inserted event: ' + rec.eventName);
  })
  console.log('listening to ' + eventListener.name + ' events');

  return eventListener;
}

