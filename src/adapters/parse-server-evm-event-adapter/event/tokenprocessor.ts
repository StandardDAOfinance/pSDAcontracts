import {keccak256, pack} from '@ethersproject/solidity';
import {BigNumber} from 'ethers';
import {
  getRecords,
  getRecordsFiltered,
  insertRecord,
  getRecord
} from '../../../lib/parse/parsequery';

/**
 * install the token balanec event listener
 * @param blockchain
 * @param eListener
 */
 export async function installTokenEventListener(
  blockchain: any,
  eListener: any
) {
  // get the confirguration data for the token
  const eventListener = eListener.attributes.configuration;

  // get the standard token abis
  const tokenAbis: any = {};
  tokenAbis['ERC20'] = await import('../abi/ERC20.json');
  tokenAbis['ERC721'] = await import('../abi/ERC721.json');
  tokenAbis['ERC1155'] = await import('../abi/ERC1155.json');

  // split the arguments string into component parts
  const argumentsArray = eventListener.arguments.split(',');
  const eventFilter: any = [];
  for (let i = 0; i < argumentsArray.length; i++) {
    eventFilter.push(null);
  }

  let objectCache: any = {};

  /**
   * the event handler. this function is called when an event is indexed
   * @param {*} args
   * @param {*} provider
   * @param {*} contract
   * @param {*} abi
   */
  async function handler(args: any, log: any, contract: any, abi: any) {
    args = Object.values(args);
    const target = eventListener.target;

    const toHex = (n: any) => {
      try {
        return BigNumber.from((n && n.toString()) || '0').toHexString();
      } catch (error) {
        console.log(`cannot convert to hex: ${n}`);
        return '0x00';
      }
    };

    // const params = await sanitizeParameters(args, { log, contract });
    // console.log(params);

    let tokenTransfers: any = [];
    let from, to, id, operator, amount;

    let {
      logIndex,
      blockHash,
      blockNumber,
      transactionHash,
      transactionIndex
    } = log;
    let uuid = keccak256(
      ['string', 'string', 'string', 'string', 'string'],
      [
        (logIndex || 0).toString(),
        blockHash,
        (blockNumber || 0).toString(),
        transactionHash,
        (transactionIndex || 0).toString()
      ]
    );

    const ImportHashes = Parse.Object.extend('ImportHashes');
    const query = new Parse.Query(ImportHashes);
    query.equalTo('uuid', uuid);
    const importHashes = await query.find();
    if (importHashes.length > 0) {
      console.log(`duplicate event: ${uuid}`);
      return;
    }

    logIndex = log.logIndex;
    blockHash = log.blockHash;
    blockNumber = log.blockNumber;
    transactionHash = log.transactionHash;
    transactionIndex = log.transactionIndex;

    if (contract && log) {
      const data = await contract.interface.parseLog(log);
      if (target === 'ERC721') {
        from = data.args[0];
        to = data.args[1];
        id = toHex(data.args[2]);
      }
      if (target === 'ERC1155') {
        operator = data.args[0];
        from = data.args[1];
        to = data.args[2];
        if (Array.isArray(data.args[3])) {
          id = data.args[3].map((_id: any) => toHex(_id || '0'));
          amount = data.args[4].map((_amt: any) => toHex(_amt || '0'));
        } else {
          id = toHex(data.args[3] || '0');
          amount = toHex(data.args[4] || '0');
        }
      }
    } else {
      if (target === 'ERC721') {
        from = args[0];
        to = args[1];
        id = toHex(args[2] || '0');
      }
      if (target === 'ERC1155') {
        operator = args[0];
        from = args[1];
        to = args[2];
        if (Array.isArray(args[3])) {
          id = args[3].map((_id: any) => toHex(_id || '0'));
          amount = args[4].map((_amt: any) => toHex(_amt || '0'));
        } else {
          id = toHex(args[3] || '0');
          amount = toHex(args[4] || '0');
        }
      }
    }
    try {
      if (BigNumber.from(id).isZero() || BigNumber.from(id).eq('1')) {
        return;
      }
    } catch (error) {
      return;
    }

    if (target === 'ERC721') {
      tokenTransfers.push({
        type: 'ERC721',
        address: contract.address,
        from,
        to,
        id
      });
    } else if (target === 'ERC1155') {
      if (Array.isArray(id)) {
        tokenTransfers.push({
          type: 'ERC1155',
          address: contract.address,
          operator,
          from,
          to,
          ids: id,
          amounts: amount
        });
      } else {
        tokenTransfers.push({
          type: 'ERC1155',
          address: contract.address,
          operator,
          from,
          to,
          id,
          amount
        });
      }
    }

    /**
     * update the balance of the token in the database, creating the token if it doesn't exist
     * @param _tokenTransfer
     */
    const updateTokenBalance = async (_tokenTransfer: any) => {
      const tokenAddress = _tokenTransfer.address;
      const fromAddress = _tokenTransfer.from;
      const toAddress = _tokenTransfer.to;
      const amount = _tokenTransfer.amount;
      let id: any = BigNumber.from(_tokenTransfer.id);

      if (!tokenAddress) {
        console.log(
          `no token address for ${fromAddress} ${toAddress} ${amount.toString()}`
        );
        return;
      }

      if (id.eq(0) || id.eq(1)) {
        //console.log('skipping', id.toHexString());
        return;
      }
      id = id.toHexString();

      // get the from and to accounts
      let accountFrom: any, accountTo: any, tokenHash: any;

      // look for an existing account in the object cache and if not
      // found then create a new account object and add it to the cache
      try {
        const foundAccount = objectCache.accounts.find((account: any) => {
          return account.get('address') === fromAddress;
        });
        if (!foundAccount) {
          accountFrom = await getRecord('Account', 'address', fromAddress);
          objectCache.accounts.push(accountFrom);
          await accountFrom.save();
        }
      } catch (e) {
        console.log(`cannot find account ${fromAddress}`);
      }

      // look for an existing account in the object cache and if not
      // found then create a new account object and add it to the cache
      try {
        const foundAccount = objectCache.accounts.find((account: any) => {
          return account.get('address') === toAddress;
        });
        if (!foundAccount) {
          accountTo = await getRecord('Account', 'address', fromAddress);
          objectCache.accounts.push(accountTo);
          await accountTo.save();
        }
      } catch (e) {
        console.log(`cannot find account ${toAddress}`);
      }

      // look for an existing token in the object cache and if not
      // found then create a new token object and add it to the cache
      try {
        const foundTokenId = objectCache.tokenIds.find((tokenId: any) => {
          return BigNumber.from(tokenId.get('token_id')).eq(id);
        });
        if (!foundTokenId) {
          accountTo = await insertRecord('TokenId', 'token_id', id, {
            token: tokenAddress
          });
          objectCache.tokenIds.push(accountTo);
          await accountTo.save();
        }
      } catch (e) {
        console.log(`cannot find account ${toAddress}`);
      }

      // update the balance for the from address
      // for this account token.
      if (fromAddress !== '0x0000000000000000000000000000000000000000') {
        try {
          // create a unique hash for this record - this is used to prevent duplicate records
          const objId = keccak256(
            ['address', 'address', 'uint256'],
            [tokenAddress, fromAddress, id]
          );

          // look for an existing token in the object cache and if not
          // found then create a new token object and add it to the cache
          let foundAccountTokenBalance: any = objectCache.accountTokenBalances.findIndex(
            (tokenBalance: any) => {
              return BigNumber.from(tokenBalance.get('recordId')).eq(objId);
            }
          );

          if (foundAccountTokenBalance > -1) {
            // get the account token balance object
            foundAccountTokenBalance =
              objectCache.accountTokenBalances[foundAccountTokenBalance];

            // compute the new balance
            const newBalance = BigNumber.from(
              foundAccountTokenBalance.get('balance') || '0'
            )
              .sub(amount)
              .toHexString();

            // update the fields on the record
            foundAccountTokenBalance.set('balance', newBalance);
            if (
              BigNumber.from(foundAccountTokenBalance.get('balance') || '0').lt(
                1
              )
            ) {
              await foundAccountTokenBalance.destroy({}, {useMASTER_KEY: true});
              // remove the account token balance object from the cache
              objectCache.accountTokenBalances.splice(
                foundAccountTokenBalance,
                1
              );
            }
          }
        } catch (e) {
          console.log(
            `cannot update account token balance ${fromAddress} ${tokenAddress} ${id}`
          );
        }
      }

      // update the balance for the from address
      // for this account token.
      if (toAddress !== '0x0000000000000000000000000000000000000000') {
        try {
          // create a unique hash for this record - this is used to prevent duplicate records
          const objId = keccak256(
            ['address', 'address', 'uint256'],
            [tokenAddress, toAddress, id]
          );

          // look for an existing token in the object cache and if not
          // found then create a new token object and add it to the cache
          const foundAccountTokenBalance = objectCache.accountTokenBalances.find(
            (tokenBalance: any) => {
              return BigNumber.from(tokenBalance.get('recordId')).eq(objId);
            }
          );

          let accountTokenBalance: any;
          if (!foundAccountTokenBalance) {
            accountTokenBalance = await insertRecord(
              'AccountTokenBalances',
              'recordId',
              objId,
              {
                recordId: objId,
                token: tokenAddress,
                account: toAddress,
                balance: amount,
                token_id: id
              }
            );
            objectCache.accountTokenBalances.push(accountTokenBalance);
            await accountTokenBalance.save();
          } else {
            accountTokenBalance = foundAccountTokenBalance;
            // compute the new balance
            const newBalance = BigNumber.from(
              accountTokenBalance.get('balance') || '0'
            )
              .add(amount)
              .toHexString();
            // update the fields on the record
            accountTokenBalance.set('balance', newBalance);
            await accountTokenBalance.save();
          }
        } catch (e) {
          console.log(
            `cannot update account token balance ${toAddress} ${tokenAddress} ${id}`
          );
        }
      }
    };

    // update all token balances affected by this transfer
    const tokenTransfer = tokenTransfers[0];

    // if 'ids' exists then this is a batch transfer
    if (tokenTransfer.ids) {
      for (let i = 0; i < tokenTransfer.ids.length; i++) {
        await updateTokenBalance({
          from: tokenTransfer.from,
          to: tokenTransfer.to,
          id: tokenTransfer.ids[i],
          amount: tokenTransfer.amounts[i]
        });
      }
      // otherwise this is a single transfer
    } else {
      await updateTokenBalance(tokenTransfer);
    }

    const importHash = new ImportHashes();
    importHash.set('uuid', uuid);
    importHash.set('blockHash', blockHash);
    importHash.set('blockNumber', blockNumber);
    importHash.set('transactionHash', transactionHash);
    importHash.set('transactionIndex', transactionIndex);
    await importHash.save();
  }

  const Collection = Parse.Object.extend('Tokens');
  const query = new Parse.Query(Collection);
  query.equalTo('type', eventListener.target);
  query.equalTo('enabled', true);

  const tokens = await query.find({useMasterKey: true});

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const address = token.get('address');
    const syncStartBlock = token.get('startBlock');
    const abi = tokenAbis[token.get('type')];

    if (!address || !abi) {
      return;
    }

    // load target contract
    const contract = blockchain.loadContract(
      abi.abi,
      address,
      blockchain.signer
    );
    // sync contract historical events and then listen for realtime events
    await syncEvent(
      blockchain.provider,
      contract,
      abi.abi,
      eventListener.name,
      eventFilter,
      handler,
      () => handler([...argumentsArray], undefined, contract, abi.abi),
      syncStartBlock
    );
  }
}
