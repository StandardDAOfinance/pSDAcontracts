import "dotenv/config";
import "@nomiclabs/hardhat-waffle";
import { task, subtask } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BigNumber, Contract } from "ethers";
import { keccak256, sha256, solidityPack } from "ethers/lib/utils";
import fs from "fs";
import { connectToMoralis } from "../src/lib/moralis";
import { getDiamondFacet, getContractDeployment } from "../src/lib/deploy";
import { utils } from 'ethers';
import AirDrop from "../src/lib/airdrop";
import Moralis from "moralis/node";

// pause for the specified ms
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const sortAlphaNum = (a: any, b: any) => a.hash.localeCompare(b.hash, 'en', { numeric: true })

export const dataModel = {
  Airdrops: {
    collection: "Airdrops",
    keyField: "objectId", // ?
  },
  MerkleProofs: {
    collection: "MerkleProofs",
    keyField: "key", // ?
  },
  Metadata: {
    collection: "Metadata",
    keyField: "objectId", // ?
  },
  Purchases: {
    collection: "Purchases",
    keyField: "objectId", // ?
  },
  Redemptions: {
    collection: "Redemptions",
    keyField: "objectId", // ?
  },
  TokenSales: {
    collection: "TokenSales",
    keyField: "objectId", // ?
  },
  Whitelists: {
    collection: "Whitelists",
    keyField: "hash", // ?
  },
  Reveals: {
    collection: "Reveals",
    keyField: "hash", // ?
  },
};

/**
 *
 * @param hre publish the tokensale contract to the network
 * @param name  name of the token sale
 * @param airdrop the airdrop data json file
 * @param whitelist the whitelist data json file
 */
async function publishWhitelist(
  hre: any,
  tokenSaleId: any,
  airdropData: any,
  whitelistData: any
) {
  const ethers = hre.ethers;

  const airdropValues = [
    airdropData.whitelistOnly,
    airdropData.whitelistId,
    airdropData.whitelistHash,
    airdropData.maxQuantity,
    airdropData.maxQuantityPerSale,
    airdropData.minQuantityPerSale,
    airdropData.maxQuantityPerAccount,
    airdropData.quantitySold,
    airdropData.startTime,
    airdropData.endTime,
    [
      ethers.utils.parseEther("0.01").toString(),
      airdropData.initialPrice.priceModifier,
      airdropData.initialPrice.priceModifierFactor,
      airdropData.initialPrice.maxPrice,
    ],
    airdropData.tokenHash,
  ];

  // create the merkle root for the whitelist
  const airdropObj = new AirDrop(whitelistData);

  console.log("airdrop root hash", airdropObj.rootHash);

  const airdropId = (airdropValues[1] = airdropValues[2] = airdropObj.rootHash);

  // save the whitelist - destroy any existing data
  const MerkleProof = Moralis.Object.extend(dataModel.MerkleProofs.collection);
  const deleteQuery = new Moralis.Query(MerkleProof);
  deleteQuery.equalTo("airdropId", airdropId);
  // delete the existing whitelist
  const results = await deleteQuery.find();
  if (results && results.length > 0) {
    await Promise.all(results.map(async (r) => r.destroy()));
  }

  // update the whitelist tp the database
  for (let index = 0; index < whitelistData.length; index++) {
    const data = whitelistData[index];
    const idx = airdropObj.getIndex(data.key);
    const merkleProof = new MerkleProof();
    await merkleProof.save({
      airdropId,
      tokenSaleId,
      key: data.key,
      value: data.value,
      index: idx,
    });
  }

  // get the merkle proof for the whitelist
  const Whitelists = Moralis.Object.extend(dataModel.Whitelists.collection);

  // get a count of existing whitelists
  const countQuery = new Moralis.Query(Whitelists);
  countQuery.limit(1000);
  const countResults = (await countQuery.find()).length + 1;

  // create a new whitelist
  const wl = new Whitelists({
    hash: airdropId,
    name: "Airdrop " + countResults,
  });
  await wl.save(null, { useMasterKey: true });

  // return the airdrop values
  return airdropValues;
}

async function makeHash(stringToHash: string) {
  return keccak256(solidityPack(["string"], [stringToHash]));
}

/**
 * Publish a tokensale contract
 */
task(
  "publish-tokensale",
  "publish tokensale contract using given tokensale json file and given airdrop json file"
)
  .addParam("tokensale", "The tokensale json file")
  .addParam("airdrop", "The airdrop json file")
  .addParam("whitelist", "The airdrop whitelist")
  .setAction(
    async (
      { airdrop, tokensale, whitelist },
      hre: HardhatRuntimeEnvironment
    ) => {
      // load the tokensale JSON file
      const tokensaleData = JSON.parse(fs.readFileSync(tokensale, "utf8"));

      // keccak256 hash of the string 'Token Sale'
      const tokenSaleCollectionHash = await makeHash(tokensaleData.name);

      await connectToMoralis();

      // load the token sale methods
      const multiToken = await getContractDeployment(hre, "ERC1155");
      const airdropTokenSale = await getDiamondFacet(
        hre,
        "AirdropTokenSaleFacet"
      );
      const ownerAddress = (await hre.ethers.getSigners())[0].address;

      //  get unit time for now, and a day from now
      const unixTime = Math.floor(Date.now() / 1000);
      const unixTimeFuture = [unixTime + 24 * 60 * 60];

      // create the token sale data to pass into the contract
      const tokenSaleSettingsArray = [
        tokensaleData.contractAddress,
        multiToken.address, // updated --Kartik
        0,
        tokenSaleCollectionHash,
        ownerAddress,
        ownerAddress,
        tokensaleData.symbol,
        tokensaleData.name,
        tokensaleData.description,
        tokensaleData.openState,
        unixTime,
        unixTimeFuture[0],
        tokensaleData.maxQuantity,
        tokensaleData.maxQuantityPerSale,
        tokensaleData.minQuantityPerSale,
        tokensaleData.maxQuantityPerAccount,
        [
          (hre as any).ethers.utils.parseEther("1").toString(),
          tokensaleData.initialPrice.priceModifier,
          tokensaleData.initialPrice.priceModifierFactor,
          tokensaleData.initialPrice.maxPrice,
        ],
      ];
      console.log(`publish tokensale ${tokensaleData.name}`);

      async function createTokenSaleAndWait(): Promise<void> {
        return new Promise((resolve: any, reject): any => {
          airdropTokenSale.on(
            "TokensaleCreated",
            async (tokensaleId: any, tokensaleData: any) => {
              console.log(`Tokensale Created ${tokensaleId}`);
              return resolve(null);
            }
          );
          // create the token sale contract, passing in token sale settings and airdrop setting
          airdropTokenSale
            .createTokenSale(tokenSaleSettingsArray, [])
            .then((tx: any) => tx.wait())
            .then(() => resolve())
            .catch(reject);
        });
      }

      await createTokenSaleAndWait();
      await sleep(5000);

      // report on it
      console.log(
        `\n\nNextgem - token sale contract deployed at ${airdropTokenSale.address}\n`
      );
    }
  );

/**
 * publish the airdrop using the airdrop json file and the whitelist json file
 */
task(
  "publish-airdrop",
  "publish airdrop using given airdrop json file and given whitelist json file"
)
  .addParam("id", "The tokensale id")
  .addParam("airdrop", "The airdrop json file")
  .addParam("whitelist", "The whitelist json file")
  .setAction(
    async ({ id, airdrop, whitelist }, hre: HardhatRuntimeEnvironment) => {
      // load the airdrop JSON file
      const airdropData = JSON.parse(fs.readFileSync(airdrop, "utf8"));
      // load the whitelist JSON file
      const whitelistData = JSON.parse(fs.readFileSync(whitelist, "utf8"));
      // turn the airdrop data into an array of values, ordered the same as the struct

      // // connect to the moralis server
      await connectToMoralis();

      const tokenSaleContract = await getDiamondFacet(
        hre,
        "MerkleAirdropFacet"
      );

      // publishj whitelist to the moralis server
      const wlData = await publishWhitelist(
        hre,
        id,
        airdropData,
        whitelistData
      );
      console.log(`publish airdrop ${wlData}`);

      // add the airdrop to the contract
      const tx = await tokenSaleContract.addAirdrop(wlData);
      await tx.wait();
    }
  );

/**
 * publish the airdrop using the airdrop json file and the whitelist json file
 */
task("get-airdrop-redeemers", "Get a list of airdrop redeemers")
  .addParam("address", "The airdrop id")
  .setAction(async ({ airdrop }, hre: HardhatRuntimeEnvironment) => {
    // connect to the moralis server
    await connectToMoralis();

    // get the merkle proof for the whitelist
    const Redemptions = Moralis.Object.extend(dataModel.Redemptions.collection);
    const query = new Moralis.Query(Redemptions);
    query.equalTo("address", airdrop);
    const data: any = await query.find();

    if (data && data.length > 0) {
      const out = [];
      // gather a list of redeemers
      for (let i = 0; i < data.length; i++) {
        out.push(data[i].get("redeemer"));
      }
      // output the redeemers to the console
      console.log(JSON.stringify(out));
    }
  });

/**
 * publish the airdrop using the airdrop json file and the whitelist json file
 */
task('redeem-airdrop', 'Redeem airdrop')
  .addParam('tokensale', 'The tokensale id')
  .addParam('airdrop', 'The airdrop id')
  .addParam('address', 'The redeem address')
  .addParam('txval', 'The value to attach')
  .addParam('quantity', 'The quantity to purchase')
  .setAction(
    async (
      { tokensale, airdrop, address, txval, quantity },
      hre: HardhatRuntimeEnvironment
    ) => {

      // connect to the moralis server
      await connectToMoralis();

      // get the merkle proof for the whitelist
      const MerkleProof = Moralis.Object.extend(dataModel['MerkleProofs'].collection);
      const query = new Moralis.Query(MerkleProof);
      query.equalTo('airdropId', airdrop);
      const data: any = (await query.find()).map(e => e.attributes).reverse();

      if (data) {
        console.log(`retrieved merkle proof for airdrop ${airdrop}`);
        const airdropO = new AirDrop(data);
        const index = airdropO.getIndex(address);
        const value = airdropO.getAmount(index);
        const proof = airdropO.getMerkleProof(index);
        const root = airdropO.rootHash;
        const leafHash = airdropO.leaves[index];
        const airdropId = airdrop;
        const key = address;
        const airdropData = {
          airdropId,
          key,
          quantity,
          value,
          leafHash,
          proof,
          root
        };
        // get the airdrop data
        console.log('airdrop data', airdropData);

        const tokenSaleContract = await getDiamondFacet(
          hre,
          "AirdropTokenSaleFacet"
        );
        const merkleAirdropFacet = await getDiamondFacet(
          hre,
          "MerkleAirdropFacet"
        );

        const redeemAndWait = async (
          tokenSaleContract: any,
          airdropData: any
        ) => {
          return new Promise(
            async (resolve: any, reject): Promise<void> => {
              const {
                airdropId,
                key,
                quantity,
                value,
                leafHash,
                proof
              } = airdropData;

              merkleAirdropFacet.on(
                'AirdropRedeemed',
                async (
                  airdropId: any,
                  beneficiary: any,
                  tokenHash: any,
                  proof: any,
                  amount: any
                ) => {
                  console.log(
                    `AirdropRedeemed: ${airdropId} ${beneficiary} ${tokenHash} ${proof} ${amount} ${value}`
                  );
                  resolve();
                }
              );
              console.log(tokenSaleContract.address);
              // //  call redeem to redeem the airdrop
              // const valid = await merkleproof.verify(
              //   root,
              //   leafHash,
              //   proof
              // );
              const txValue = BigNumber.from(
                (hre as any).ethers.utils.parseEther(txval + '')
              ).toHexString()
              console.log(`redeeming ${quantity} of ${txValue}`);
              console.log(hre.ethers.utils.parseEther('1'));

              const tx = await tokenSaleContract.redeemToken(
                tokensale,
                airdropId,
                leafHash,
                key,
                quantity,
                txValue,
                proof,
                {
                  gasLimit: 1800000,
                  value: txValue
                }
              );
              await tx.wait();
              console.log('redeemed');
            }
          );
        };
        await redeemAndWait(tokenSaleContract, airdropData);
      }
    }
  );


task(
  'reveal-tokensale',
  'Reveal the airdrop, hashsorting the assignable with a given salt to randomize the order or assignments.'
)
  .addParam('name', 'The tokensale name')
  .addParam('random', 'A random hex value for the hashsort')
  .setAction(async ({ name, random }, hre: HardhatRuntimeEnvironment) => {

    // get the token sale contract using tokensale name
    const tokenSaleContract = await getDiamondFacet(
      hre,
      "AirdropTokenSaleFacet"
    );
    console.log(`\n\nContract address using tokensale name : ${tokenSaleContract.address} \n`)

    // connect to the moralis server
    await connectToMoralis();
    console.log('Connected to moralis \n');

    // get the Purcahses records with no assigned metadata
    const Reveals = Moralis.Object.extend(dataModel['Reveals'].collection);
    let reveal = new Reveals();
    reveal.set('salt', random);
    reveal = await reveal.save();

    // get the Purcahses records with no assigned metadata
    const Purchases = Moralis.Object.extend(dataModel['Purchases'].collection);
    const query = new Moralis.Query(Purchases);
    query.limit(100000);
    query.equalTo('confirmed', true);
    query.equalTo('metadata', null);
    query.equalTo('address', tokenSaleContract.address.toLowerCase());

    let data: any = (await query.find());
    data = data.map((e: any) => { return { "id": e.id, "attributes": e.attributes }; })
    console.log(`Purchased/Minted records -  ${data.length}`);

    // get the Metadata records with a limit of purchases with no assigned tokenId
    const Metadata = Moralis.Object.extend(dataModel['Metadata'].collection);
    const queryMetadata = new Moralis.Query(Metadata);
    queryMetadata.equalTo('tokenId', null);
    queryMetadata.equalTo('system', false);
    queryMetadata.limit(100000);

    const dataMetadata: any = (await queryMetadata.find()).map(e => {
      return {
        "id": e.id, "hash": sha256(utils.id(
          JSON.stringify(e.attributes.metadata) + BigNumber.from(random).toString()
        ))
      };
    });
    console.log(`Metadata records -  ${dataMetadata.length} \n`);

    if (dataMetadata.length) {

      const sortedData = dataMetadata.sort(sortAlphaNum);
      // console.log(sortedData);

      for (let i = 0; i < sortedData.length; i++) {

        if (!data[i] || !data[i].id) continue;

        console.log(`\nMapped one to another ( Purchases - ${data[i]} / Metadata - ${sortedData[i]} )`);

        // fetch Purchase data using object id so we can update it
        const queryPurchasesUpdate = new Moralis.Query(Purchases);
        queryPurchasesUpdate.equalTo('objectId', data[i].id);

        // fetch Metdata data using object id after sorting the hash(Metadata attributes value) so we can update it
        const queryMetadataUpdate = new Moralis.Query(Metadata);
        queryMetadataUpdate.equalTo('objectId', sortedData[i].id);

        const purchaseToBeUpdated: any = (await queryPurchasesUpdate.first());
        const metadataToBeUpdated: any = (await queryMetadataUpdate.first());

        // update the Purchase record with metadata pointer
        metadataToBeUpdated && purchaseToBeUpdated.set("metadata", metadataToBeUpdated);
        const resPurchases = await purchaseToBeUpdated.save();
        // console.log(resPurchases);

        // update the Metadata record with token(Purchase) pointer
        purchaseToBeUpdated && metadataToBeUpdated.set("token", purchaseToBeUpdated);
        purchaseToBeUpdated && metadataToBeUpdated.set("reveal", reveal);
        purchaseToBeUpdated && metadataToBeUpdated.set("tokenId", purchaseToBeUpdated.attributes.tokenIndex + '');
        purchaseToBeUpdated && metadataToBeUpdated.set("sortedIndex", i);
        const resMetadata = await metadataToBeUpdated.save();
        // console.log(resMetadata);
      }

    } else {
      console.log(`No Metadata found to be mapped`);
    }

  });


task(
  'reveal-tokens-all',
  'Assign metadata to all tokens, hashsorting the assignable with a given salt to randomize the order or assignments.'
)
  .addParam('name', 'The tokensale name')
  .addParam('random', 'A random hex value for the hashsort')
  .setAction(async ({ name, random }, hre: HardhatRuntimeEnvironment) => {

    // get the token sale contract using tokensale name
    const tokenSaleContract = await getDiamondFacet(
      hre,
      "AirdropTokenSaleFacet"
    );
    console.log(`\n\nContract address using tokensale name : ${tokenSaleContract.address} \n`)

    // connect to the moralis server
    await connectToMoralis();
    console.log('Connected to moralis \n');

    // get the Purcahses records with no assigned metadata
    const Reveals = Moralis.Object.extend(dataModel['Reveals'].collection);
    let reveal = new Reveals();
    reveal.set('salt', random);
    reveal = await reveal.save({}, { useMasterKey: true });

    // get the Metadata records with a limit of purchases with no assigned tokenId
    const Metadata = Moralis.Object.extend(dataModel['Metadata'].collection);
    const queryMetadata1 = new Moralis.Query(Metadata);
    queryMetadata1.equalTo('tokenId', null);
    queryMetadata1.notEqualTo('system', true);
    queryMetadata1.limit(100000);

    const queryMetadata2 = new Moralis.Query(Metadata);
    queryMetadata2.equalTo('tokenId', undefined);
    queryMetadata1.notEqualTo('system', true);
    queryMetadata2.limit(100000);

    var queryMetadata = Moralis.Query.or(queryMetadata1, queryMetadata2);
    queryMetadata.limit(100000);

    const dataMetadata: any = (await queryMetadata.find({ useMasterKey: true })).map(e => {
      return {
        "id": e.id, "hash": sha256(utils.id(
          JSON.stringify(e.attributes.metadata) + BigNumber.from(random).toString()
        ))
      };
    });
    console.log(`Metadata records -  ${dataMetadata.length} \n`);

    if (dataMetadata.length) {

      const sortedData = dataMetadata.sort(sortAlphaNum);
      // console.log(sortedData);

      for (let i = 0; i < dataMetadata.length; i++) {

        // fetch Metdata data using object id after sorting the hash(Metadata attributes value) so we can update it
        const queryMetadataUpdate = new Moralis.Query(Metadata);
        queryMetadataUpdate.equalTo('objectId', sortedData[i].id);

        const metadataToBeUpdated: any = (await queryMetadataUpdate.first({ useMasterKey: true }));

        // update the Metadata record with tokenId
        metadataToBeUpdated.set("reveal", reveal);
        metadataToBeUpdated.set("tokenId", i + 1 + '');
        metadataToBeUpdated.set("sortedIndex", i);
        const resMetadata = await metadataToBeUpdated.save({}, { useMasterKey: true });
      }
    } else {
      console.log(`No Metadata found to be mapped`);
    }

  });

