import "dotenv/config";

import { node_url, accounts } from "./src/lib/hardhat";

import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-spdx-license-identifier";
import "hardhat-contract-sizer";
import "hardhat-abi-exporter";
import "hardhat-gas-reporter";
import "hardhat-watcher";

import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-solhint";
import "@nomiclabs/hardhat-ganache";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";

import "./tasks/airdropTokensale";
import "./tasks/configure";
import "./tasks/deploy";
import "./tasks/erc20";
import "./tasks/moralis";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config = {
  solidity: {
    compilers: [
      {
        version: "0.8.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 5,
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
      kovan: 0,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: accounts(),
    },
    localhost: {
      url: "http://localhost:8545",
      accounts: accounts(),
      gasPrice: "auto",
      gas: "auto",
    },
    mainnet: {
      url: node_url("mainnet"),
      accounts: accounts("mainnet"),
      gasPrice: "auto",
      gas: "auto",
      gasMultiplier: 0.8,
    },
    rinkeby: {
      url: node_url("rinkeby"),
      accounts: accounts("rinkeby"),
      gasPrice: "auto",
      gas: "auto",
      gasMultiplier: 1.5,
    },
    ropsten: {
      url: node_url("ropsten"),
      accounts: accounts("ropsten"),
      gasPrice: "auto",
      gas: "auto",
    },
    kovan: {
      url: node_url("kovan"),
      accounts: accounts("kovan"),
      gasPrice: "auto",
      gas: "auto",
      gasMultiplier: 4,
    },
    staging: {
      url: node_url("kovan"),
      accounts: accounts("kovan"),
      gasPrice: "auto",
      gas: "auto",
    },
    ftmtest: {
      url: node_url("ftmtest"),
      accounts: accounts("ftmtest"),
      gasPrice: "auto",
      gas: "auto",
    },
    opera: {
      url: node_url("opera"),
      accounts: accounts("opera"),
    },
    sokol: {
      url: node_url("sokol"),
      accounts: accounts("sokol"),
      gasPrice: "auto",
      gas: "auto",
    },
    fuji: {
      url: node_url("fuji"),
      accounts: accounts("fuji"),
      gasPrice: "auto",
      gas: "auto",
    },
    avax: {
      url: node_url("avax"),
      accounts: accounts("avax"),
      gasPrice: "auto",
      gas: "auto",
    },
    binance: {
      url: node_url("binance"),
      accounts: accounts("binance"),
      gasPrice: "auto",
      gas: "auto",
    },
    bsctest: {
      url: node_url("bsctest"),
      accounts: accounts("bsctest"),
      gasPrice: "auto",
      gas: "auto",
    },
  },
  etherscan: {
    apiKey: "4QX1GGDD4FPPHK4DNTR3US6XJDFBUXG7WQ",
  },
  paths: {
    sources: "contracts",
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 150,
    enabled: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    maxMethodDiff: 10,
  },
  mocha: {
    timeout: 0,
  },
  abiExporter: {
    path: "./abis",
    clear: false,
    pretty: true,
    runOnCompile: true,
  },
};

module.exports = config;
