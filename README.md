# Standard DAO Hardhat Project

This project is.

The project comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts. It also comes with a variety of other tools, preconfigured to work with the project code.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.ts
TS_NODE_FILES=true npx ts-node scripts/deploy.ts
npx eslint '**/*.{js,ts}'
npx eslint '**/*.{js,ts}' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

# Configuring the tokensale

Configure the `config/tokensale.json`,  `config/airdrop.json` , and  `config/whitelist.json` files with the appropriate config information for your tokensale. Make sure these are configured before you deploy.

# Deploying the project

Instructions apply to test and production. First, create a Moralis server. Then, create a `.env` file in the root of the project. Then enter the new Moralis server credentials to your `.env` file. Once you have set up your `config/tokensale.json` file, run:

`npx hardhat --network (rinkeby/kovan/ropsten/mainnet) deploy`. The deployer will:

1. Deploy all smart contracts
2. configure the Diamond contract
3. install event listeners in Moralis for the installed smart contracts
4. Publish the tokensale specified in the `config/tokensale.json file.

The airdrop is not published. You will need to do that yourself.

# Publish an tokensale

Configure the `config/tokensale.json`  then open up a terminal window and enter:

`npx hardhat --network rinkeby publish-tokensale --tokensale ./config/tokensale.json 

# Publish an airdrop

Configure the `config/airdrop.json` , and  `config/whitelist.json` files as you need them, then open up a terminal window and enter:

`npx hardhat --network rinkeby publish-airdrop --airdrop ./config/airdrops.json --whitelist ./config/whitelist.json --id [tokensaleid]`

# Redeem an airdrop

To redeem an airdrop:

`npx hardhat --network (rinkeby/kovan/ropsten/mainnet) redeem-airdrop --airdrop [airdropid] --address [address] --unitprice 0.0001 --tokensale [tokensaleid] --quantity 1`

# Purchase a token (no airdrop)

To purchase a token from the tokensale:

`npx hardhat --network (rinkeby/kovan/ropsten/mainnet) purchase-token --airdrop [airdropid] --address [address] --unitprice 0.0001 --tokensale [tokensaleid] --quantity 1`


# Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/sample-script.ts
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```

# Performance optimizations

For faster runs of your tests and scripts, consider skipping ts-node's type checking by setting the environment variable `TS_NODE_TRANSPILE_ONLY` to `1` in hardhat's environment. For more details see [the documentation](https://hardhat.org/guides/typescript.html#performance-optimizations).
