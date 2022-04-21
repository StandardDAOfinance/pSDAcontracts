
// /**
//  * deploy a moralis configuration. this: creates a server, deploys all the cloud code, deploys the event listeners, and runs 'npx parse-dbtool migrate'
//  */
//  task('deploy-new-server', 'create and configure a new server')
//  .addParam('contracts', 'The contracts to deploy')
//  .addParam('suppress', 'Dont publish these events')
//  .addParam('name', 'The server name')
//  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
//    // connect to moralis
//    await connectToMoralis();

//    // get the preferred region
//    const preferredRegion = SERVER_REGIONS[1];
//    const chainId = (await hre.ethers.provider.getNetwork()).chainId;
//    const pause = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));
//    const contractsToListenTo = taskArgs.contracts.split(',');
//    const eventsToIgnore = taskArgs.suppress.split(',');

//    // create a server for this chain
//    await createServer(taskArgs.name, preferredRegion.id, chainId);

//    // fetch all the servers from moralis
//    const userServers = await getUserServers();
//    const latestServer = userServers[userServers.length - 1];

//    // show the latest server
//    console.log(latestServer);

//    // reconnect to moralis using the new server info
//    await connectToMoralis(hre);

//    // upload the src/moralis/gemproject/main.js cloud file
//    await uploadCloudFile('src/moralis/gemproject/main.js');

//    // add the event listeners
//    for (let i = 0; i < contractsToListenTo.length; i++) {
//      const contractName = contractsToListenTo[i];
//      const contractObj = await getDiamondFacet(hre, contractName);
//      const contractEventFilters = contractObj.filters;
//      const contractEvents = Object.keys(contractEventFilters);

//      for (let j = 0; j < contractEvents.length; j++) {
//        const eventName = contractEvents[j];
//        const eventFilter: any = contractEventFilters[eventName];
//        const eventTopic = eventFilter.topic;
//        const eventKeys = Object.keys(eventFilter.params);
//        const tableName = eventName.toLowerCase();

//        // check if the event is in the list of events to ignore
//        if (eventsToIgnore.includes(eventName)) {
//          console.log(`Skipping ${eventName}`);
//          continue;
//        }

//        // create the event listener. Creating the event listener will create the table in the database
//        const eventListener = {
//          chainId: chainId,
//          address: contractObj.address,
//          topic: eventTopic,
//          tableName,
//          sync_historical: false,
//          description: `event listener for ${tableName}`,
//          abi: _process(contractObj.interface.events[eventKeys[i]])
//        };

//        await Moralis.Cloud.run('coreservices_addEventSync', eventListener, {
//          useMasterKey: true
//        });
//        console.log(`Added event listener for ${tableName}`);
//        await pause(20000);
//      }
//    }

//    // run the 'npx parse-dbtool migrate' process
//  });