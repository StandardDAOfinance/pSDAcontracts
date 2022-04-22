import { Contract, ethers, EventFilter } from "ethers";
import {
  queryObject,
  queryAllObjects,
  insertObject,
  newObject,
} from "../../../lib/parse/parsequery";

/**
 * THIS CLASS IS NOT YET IN USE
 * This class defines an event processor that will process historical events
 * for a given contract / event kind / block range. The event processor will
 * then add the events to its cache. Each job consists of a contract, event kind,
 * event filter and block range. The event processor will then process the
 * events of each job in the queue until the queue is empty. New items added into
 * the queue will be saved in its jobs collection in order to be processed later.
 *
 * the processor consructor takes a blockchain object which contains a provider, signer
 * and a method called loadContract which can be used to load a contract from the
 * blockchain.
 *
 * the processor contructor also takes a config object which contains the following
 * properties:
 *
 * - chunkSize: the number of blocks to request at a time from the blockchain
 * - updateSize: the number of objects to update at a time
 *
 */

const EventListeners = Parse.Object.extend("EventListeners");
const eventListenersQuery = new Parse.Query(EventListeners);

type EventJob = {
  _id: string | undefined;
  contract: Contract;
  abi: any;
  eventKind: string;
  filter: EventFilter;
  blockRange: {
    start: number;
    end: number;
  };
};
type EventProcessorConfig = {
  chunkSize: number;
  updateSize: number;
  numActiveJobs: number;
  removeCompletedJobs: boolean;
};

class EventProcessor {
  blockchain: any;
  config: EventProcessorConfig;
  running: boolean = false;
  halt: boolean = false;
  currentJobIndex = 0;
  loaded: boolean = false;

  // contains job requests for the event processor
  jobQueue: EventJob[] = [];

  /**
   * constructor. takes a blockchain object which contains a provider, signer and a config block
   * @param _blockchain
   * @param _config
   */
  constructor(
    _blockchain: {
      provider: ethers.providers.Provider;
      signer: ethers.Signer;
      loadContracts: any;
    },
    _config?: EventProcessorConfig
  ) {
    // set the blockchain
    this.blockchain = _blockchain;
    this.config = {
      chunkSize: (_config && _config.chunkSize) || 10000,
      updateSize: (_config && _config.updateSize) || 100,
      numActiveJobs: (_config && _config.numActiveJobs) || 1,
      removeCompletedJobs: (_config && _config.removeCompletedJobs) || true,
    };

    this.loadDatabaseJobs();
  }

  /**
   * cteate an event filter for a given contract, event name, and event parameters
   * @param contract
   * @param eventName
   * @param eventArgs
   * @returns an eventfilter object
   */
  static createEventFilter(
    contract: Contract,
    eventName: string,
    eventArgs: any[],
    fromBlock: number = 0,
    toBlock: any = "latest"
  ): EventFilter {
    const filter = contract.filters[eventName](...eventArgs);
    (filter as any).name = eventName;
    (filter as any).startBlock = fromBlock;
    (filter as any).endBlock = toBlock;
    return filter;
  }

  /**
   * load jobs from the database into the job queue
   */
  async loadDatabaseJobs(): Promise<void> {
    const jobsRecords = await queryAllObjects("EventListeners");
    jobsRecords.forEach((jobRecord: any) => {
      const jobData = jobRecord.attributes;
      const bchain = this.blockchain[jobData.networkId];
      const job = {
        _id: jobData._id,
        abi: jobData.abi,
        contract: bchain.loadContract(
          jobData.abi,
          jobData.contractAddress,
          bchain.signer
        ),
        eventKind: jobData.eventKind,
        filter: jobData.filter,
        blockRange: jobData.blockRange,
      };
      this.jobQueue.push(job);
    });
    this.loaded = true;
  }

  /**
   * load jobs from the database into the job queue
   */
  async saveDatabaseJob(jobIndex: number): Promise<void> {
    const job = this.jobQueue[jobIndex];
    if (job._id) {
      const jobObject = await eventListenersQuery.get(job._id);
      if (jobObject) {
        jobObject.set("blockRange", job.blockRange);
        await jobObject.save();
      } else {
        await insertObject("EventListeners", null, job);
      }
    }
  }

  /**
   * add a job to the job queue. if the processor is running, the job will be processed
   * @param job
   */
  async addJob(job: EventJob): Promise<void> {
    const jobData = {
      abi: job.abi,
      contract: job.contract,
      eventKind: job.eventKind,
      filter: job.filter,
      blockRange: job.blockRange,
    };
    const jobObject = await newObject("EventListeners", jobData);
    await jobObject.save();
    this.jobQueue.push(job);
  }

  /**
   * start the event processor
   */
  async startProcessor(): Promise<void> {
    // set the running flag to true
    if (this.running) return;
    this.currentJobIndex = 0;
    this.running = true;
    this.runLoop();
  }

  /**
   * stop the event processor
   */
  async stopProcessor(): Promise<void> {
    if (!this.running) return;
    this.halt = true;
  }

  /**
   * the processor run loop
   */
  private async runLoop(): Promise<void> {
    // if halting or not running, return
    if (this.halt || !this.running) {
      this.running = false;
      return;
    }

    // process each of the jobs, round-robin, until each job is complete
    // after processing each job, update its state to the database
    // when the job is complete (i.e all events have been processed up to the end block),
    // remove it from the job queue if removeCompletedJobs is true
    const _processJob = async (jobIndex: number): Promise<void> => {
      // get the current job
      const job = this.jobQueue[this.currentJobIndex];
      if (!job) return;

      // get the events for the job
      const events = await this.retrieveJobEvents(job);

      // add the events to the cache
      await this.saveJobEvents(events);

      // update the job state
      this.jobQueue[this.currentJobIndex] = {
        ...job,
        blockRange: {
          start: job.blockRange.end + 1,
          end: job.blockRange.end + this.config.chunkSize,
        },
      };
    };


    // TODO call _processJob in a loop, until all jobs are complete
    // the loop should be able to process multiple jobs at once
    // using Promise.all
    let promises = [];
    for (let i = 0; i < this.config.numActiveJobs; i++) {

      promises.push(_processJob(this.currentJobIndex));

      this.currentJobIndex++;
      if (this.currentJobIndex === this.jobQueue.length) {
        this.currentJobIndex = 0;
      }

      if (promises.length === this.config.numActiveJobs) {
        await Promise.all(promises);
        promises = [];
      }

    }
    if (promises.length > 0) {
      await Promise.all(promises);
      promises = [];
    }
  }

  /**
   * save the events array to the database
   * @param jobs
   */
  async saveJobEvents(jobs: any): Promise<any> {}

  /**
   * retrieve the events for a job from the blockchain
   */
  async retrieveJobEvents(job: EventJob): Promise<any> {

    let logEvents: any = (
      (await job.contract.provider.getLogs(job.filter)) || []
    )
    logEvents = logEvents.map((log: any) => ({
      event: new ethers.utils.Interface(job.abi).decodeEventLog(
        job.eventKind,
        logEvents.data
      ),
      log,
    }))
    .filter((e: any) => e.event["values"]);

    return logEvents;

  }

  async processFilter(filter: any): Promise<any> {

  }

}
