/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-unsupported-features/es-syntax */
import "dotenv/config";
import "@nomiclabs/hardhat-waffle";
import { task, subtask } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getUserServers, connectToMoralis } from "../src/lib/moralis";
import axios from "axios";

const BASE_URI = "https://admin.moralis.io";

const _process = (s: any) => {
  let obj = JSON.parse(
    JSON.stringify(s, (key, value) => {
      if (key !== "_isParamType" && key !== "_isFragment" && value)
        return value;
      if (key === "baseType") {
        s[key].internalType = s.baseType;
        return null;
      }
    })
  );
  // recursively replace all keys named 'baseType' with 'internalType'
  const processObj = (obj: any) => {
    if (obj.baseType) {
      obj.internalType = obj.baseType;
      obj.baseType = undefined;
      return obj;
    } else if (obj.inputs && Array.isArray(obj.inputs)) {
      obj.inputs = obj.inputs.map(processObj);
    }
    if (obj.type === "tuple") {
      obj.components = obj.components.map(processObj);
    }
    return obj;
  };
  obj = processObj(obj);
  obj = JSON.parse(
    JSON.stringify(
      obj,
      (key, value) => {
        if (key !== "baseType" && value) return value;
      },
      4
    )
  );
  return obj;
};

task(
  "install-diamond-listeners",
  "Install event listeners for a specific contract"
)
  .addParam("contracts", "The name of the contract that the events are on")
  .addParam("events", 'The name of the events, comma-separated, or "all"')
  .setAction(
    async (taskArgs, hre: HardhatRuntimeEnvironment): Promise<void> => {
      await hre.run("update-diamond-listeners", {
        ...taskArgs,
        action: "add",
      });
    }
  );

task(
  "remove-diamond-listeners",
  "Remove event listeners for a specific contract"
)
  .addParam("contracts", "The name of the contract that the events are on")
  .addParam("events", 'The name of the events, comma-separated, or "all"')
  .setAction(
    async (taskArgs, hre: HardhatRuntimeEnvironment): Promise<void> => {
      await hre.run("update-diamond-listeners", {
        ...taskArgs,
        action: "remove",
      });
    }
  );

export async function installDiamondListeners(
  { action, contracts, events }: any,
  hre: HardhatRuntimeEnvironment
): Promise<void> {
  if (!action.match(/^(add|remove)$/)) {
    throw new Error(`action must be "add" or "remove"`);
  }

  const isAdding = action === "add";

  // connect to moralis
  await connectToMoralis();

  // get contract events
  const diamondDeployment = await hre.deployments.get("Diamond");
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;
  const pause = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));
  const BASE_URI = "https://admin.moralis.io";

  const servers = await getUserServers(
    process.env.CLI_API_KEY,
    process.env.CLI_API_SECRET
  );
  if (servers.length === 0) {
    console.log("No servers found!");
    return;
  }
  const server = servers[servers.length - 1];
  // const plugins2 = JSON.parse(server.plugins);
  const plugins: any = JSON.parse(server.plugins);
  // for(let i = 0; i < plugins2.length; i++) {
  //   plugins.push(plugins2[i]);
  // }

  const contractsToUpdate = contracts.split(",");
  for (const contract of contractsToUpdate) {
    const contractDeployment = await hre.deployments.get(contract);
    const contractObj = await hre.ethers.getContractAt(
      contractDeployment.abi,
      diamondDeployment.address
    );
    const contractEvents = contractObj.filters;
    const eventsToUpdate = events.split(",");

    const eventKeys = Object.keys(contractEvents).filter((eventName) =>
      eventName.match(/\)/)
    ); // Only get the topics
    for (let i = 0; i < eventKeys.length; i++) {
      const tableName = eventKeys[i].split("(")[0];
      const topicHash = hre.ethers.utils.solidityKeccak256(
        ["string"],
        [eventKeys[i]]
      );

      if (
        !eventsToUpdate.includes(tableName) &&
        !eventsToUpdate.includes("all")
      ) {
        continue;
      }

      console.log(
        `${isAdding ? "Installing" : "Removing"} listener ${tableName}`
      );

      // Define the new plugin
      const plugin = {
        id: 1,
        path: "./evm/events",
        order: 5,
        options: {
          description: `listen for ${tableName} events`,
          abi: _process(contractObj.interface.events[eventKeys[i]]),
          topic: topicHash,
          address: diamondDeployment.address,
          sync_historical: true,
          tableName: tableName,
          chainId: chainId,
        },
      };

      // Push the plugin to the list
      plugins.push(plugin);
    }
  }

  const apiKey = process.env.CLI_API_KEY;
  const apiSecret = process.env.CLI_API_SECRET;

  // Post updated plugins to the api
  console.log("\nPushing contract events to moralis server...");
  await axios.post(`${BASE_URI}/api/cli/updateServerPlugins`, {
    apiKey,
    apiSecret,
    parameters: {
      serverId: server.id,
      plugins: JSON.stringify(plugins),
    },
  });
  console.log("Successfully saved the contract events!");

  // Restart server to apply sync
  await restartServer(
    process.env.CLI_API_KEY,
    process.env.CLI_API_SECRET,
    server
  );
  await pause(90000);
  console.log("Events are now subscribed to!");
  console.log(`Completed ${isAdding ? "adding" : "removing"} event listeners!`);
}

subtask(
  "update-diamond-listeners",
  "Add or remove event listeners for a specific contract"
)
  .addParam("action", `"add" or "remove"`)
  .addParam("contracts", "The name of the contract that the events are on")
  .addParam("events", 'The name of the events, comma-separated, or "all"')
  .setAction(installDiamondListeners);

export const restartServer = async (
  apiKey: any,
  apiSecret: any,
  server: any
) => {
  try {
    // Trigger the restart
    console.log(`Updating / Restarting server: ${server.name}`);
    await axios.post(`${BASE_URI}/api/cli/updateServer`, {
      apiKey,
      apiSecret,
      parameters: {
        serverId: server.id,
      },
    });
    console.log("Triggered Server update / restart successfully");

    // Poll restart progress
    const serverCheck = setInterval(async () => {
      const apiKey = process.env.CLI_API_KEY;
      const apiSecret = process.env.CLI_API_SECRET;

      // Get all servers
      const servers = await getUserServers(apiKey, apiSecret);

      // Check if the server has completed the restart / update
      if (
        servers.filter((item: any) => item.id === server.id)[0].update === 0
      ) {
        // If so cancel the polling and return
        console.log("Server updated / restarted successfully");
        clearInterval(serverCheck);
      } else {
        // Display progress
        console.log("Updating...");
      }
    }, 2500);
  } catch (e) {
    console.log("Server update/restart failed");
  }
};
