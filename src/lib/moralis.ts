import "dotenv/config";

import axios from "axios";
import fs from "fs";

import Moralis from "moralis/node";

const BASE_URI = "https://admin.moralis.io";

export function getProviders(network = "all") {
  const networks = [
    {
      chain: "Eth",
      name: "Mainnet",
      network: "mainnet",
      chainId: "0x1",
    },
    {
      chain: "Eth",
      name: "Ropsten",
      network: "testnet",
      chainId: "0x3",
    },
    {
      chain: "Eth",
      name: "Rinkeby",
      network: "testnet",
      chainId: "0x4",
    },
    {
      chain: "Eth",
      name: "Goerli",
      network: "testnet",
      chainId: "0x5",
    },
    {
      chain: "Eth",
      name: "Kovan",
      network: "testnet",
      chainId: "0x2a",
    },
    {
      chain: "Eth",
      name: "LocalDevChain",
      network: "localdevchain",
      chainId: "0x539",
    },
    {
      chain: "Polygon",
      name: "Mainnet",
      network: "mainnet",
      chainId: "0x89",
    },
    {
      chain: "Polygon",
      name: "Mumbai",
      network: "testnet",
      chainId: "0x13881",
    },
    {
      chain: "Bsc",
      name: "Mainnet",
      network: "mainnet",
      chainId: "0x38",
    },
    {
      chain: "Bsc",
      name: "Testnet",
      network: "testnet",
      chainId: "0x61",
    },
    {
      chain: "Avalanche",
      name: "Mainnet",
      network: "mainnet",
      chainId: "0xa86a",
    },
    {
      chain: "Avalanche",
      name: "Testnet",
      network: "testnet",
      chainId: "0xa869",
    },
    {
      chain: "Fantom",
      name: "Mainnet",
      network: "mainnet",
      chainId: "0xfa",
    },
  ];
  if (network === "all") return networks;
  const networkSplit = network.split(",");
  return networks.filter((item) => networkSplit.includes(item.chainId));
}

function getSelectedServerProviders(network: string, chosenProviders: string) {
  if (network === "ganache") return ["0x539"];
  // Define list of supported chains
  let possibleProviders = getProviders().filter(
    (o) => o.chainId === `0x${network}`
  );
  // If so
  if (!chosenProviders) {
    return;
  }
  const chosen = chosenProviders.toLowerCase().split(",");
  // Filter out all networks that does not match the choice
  const possibleChosenProviders = possibleProviders.filter((item) =>
    chosen.includes(parseInt(item.chainId).toString(10))
  );
  // Return chains if a match was found
  if (possibleChosenProviders.length > 0)
    return possibleChosenProviders.reduce(
      (a: any, o: any) => (a.push(o.chainId), a),
      []
    );
  // If we get here, the user provided chains that aret supported or was provided in a wrong format
  console.log("Chain not found!");
}

export const SERVER_REGIONS = [
  {
    id: 1,
    region: "San Francisco",
  },
  {
    id: 2,
    region: "New York",
  },
];

export const NETWORK_TYPES = [
  {
    id: 1,
    name: "Mainnet",
    value: "mainnet",
  },
  {
    id: 2,
    name: "Testnet",
    value: "testnet",
  },
  {
    id: 3,
    name: "Local devchain",
    value: "ganache",
  },
];

const apiKey = process.env.CLI_API_KEY;
const apiSecret = process.env.CLI_API_SECRET;
const serverUrl = process.env.SERVER_URL;

if (!serverUrl) {
  throw new Error("SERVER_URL is not set in .env file");
}
if (!apiKey) {
  throw new Error("CLI_API_KEY is not set in .env file");
}
if (!apiSecret) {
  throw new Error("CLI_API_SECRET is not set in .env file");
}

// get the subdomain
let serverSubdomain = serverUrl.split(".")[0]; // e.g. 'https://localhost
serverSubdomain = serverSubdomain.replace(/^https?:\/\//, "");

export async function getUserServers(k: any = apiKey, s: any = apiSecret) {
  // Retrieve list of servers
  const response = await axios.post(`${BASE_URI}/api/cli/userServers`, {
    apiKey,
    apiSecret,
  });

  // Return servers
  return response.data.servers;
}

/**
 * Creates a server
 */
export async function createServer(
  serverName: string,
  region: number,
  network: number
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const _providers = JSON.stringify(
      getSelectedServerProviders(`${network}`, `${network}`)
    );

    // Trigger creation of the server
    console.log(`Creating server: ${serverName} in ${region} on ${network}`);
    const params = {
      name: serverName,
      region: `${region}`,
      network: network,
      chains: _providers,
    };

    await axios.post(`${BASE_URI}/api/cli/createServer`, {
      apiKey,
      apiSecret,
      parameters: params,
    });
    console.log("Triggered Server creation successfully");

    let prevStatus = "";
    let first = true;
    let serverId = 0;

    // Poll creation status
    const serverCheck = setInterval(async () => {
      // Get list of servers
      let servers = await getUserServers(apiKey, apiSecret);

      // Define server variable
      let server: { id: number; status: number; progressCreation: string };

      // If this is the first call
      if (first) {
        // Set first call to false for the next poll
        first = false;

        // filter out all server who are not being created
        servers = servers.filter((item: { status: number }) => item.status < 6);

        // Pick the most recently added (if more than one is being created)
        server = servers[servers.length - 1];

        // Assign the id of the server
        serverId = server.id;
      } else {
        // If we get here then we have polled the status before so we already know the server id

        // Get the server
        server = servers.filter(
          (item: { id: number }) => item.id === serverId
        )[0];
      }

      // Check if server is compleatly configured
      if (server.status === 6) {
        // If so, display this to the user and stop polling
        console.log("Server created successfully!");
        clearInterval(serverCheck);
        resolve(null);
      } else {
        // If we get here then the server is still being configured

        //Check if we have a new status in the progress
        if (prevStatus != server.progressCreation) {
          // Display the progress
          console.log(server.progressCreation);

          // Set the new progress to the current progress
          prevStatus = server.progressCreation;
        }
      }
    }, 5000);
  });
}

export async function uploadCloudFile(moralisCloudFile: string) {
  // Get path to the javascript file
  const filePath = moralisCloudFile;
  // If no server was provided or it was provided in a invalid promat
  if (serverSubdomain == undefined || serverSubdomain.length !== 23) {
    throw new Error(
      "No server was provided or it was provided in a invalid promat"
    );
  }

  const fileData = fs.readFileSync(filePath, "utf8");
  if (!fileData) {
    throw new Error("File not found");
  }
  // Post changes to endpoint
  await axios.post(`${BASE_URI}/api/cli/savecloud`, {
    apiKey,
    apiSecret,
    parameters: {
      subdomain: serverSubdomain,
      cloud: fileData,
    },
  });
}

export async function connectToMoralis() {
  // connect to the moralis server
  console.log("Starting connectionto Moralis server: \n", process.env._);
  await Moralis.start({
    serverUrl: process.env.SERVER_URL,
    appId: process.env.APPLICATION_ID,
    masterKey: process.env.MASTER_KEY,
  });
  console.log("connected to moralis");
}
