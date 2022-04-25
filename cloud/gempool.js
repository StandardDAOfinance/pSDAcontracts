// /**
//  * trigger called when the merkle pool token sale is created
//  */
// Parse.Cloud.afterSave("GemPoolCreated", async function (request) {
//     async function savePoolFromDefinition(token, poolHash, poolDefinition) {
//         if (!poolDefinition) {
//             console.warn("poolDefinition is null");
//             return;
//         }
//         // save the token to the database
//         return saveObjectFromDefinition("Pools", "symbol", poolDefinition[2][4], {
//             token,
//             poolHash,
//             symbol: poolDefinition[2][4],
//             name: poolDefinition[2][3],
//             tokenSource: {
//                 type: poolDefinition[1][0],
//                 staticSourceId: poolDefinition[1][1],
//                 collectionSourceAddress: poolDefinition[1][2],
//             },
//             initialPrice: poolDefinition[3],
//             enabled: poolDefinition[4],
//             visible: poolDefinition[5],
//             minTime: poolDefinition[6],
//             maxTime: poolDefinition[7],
//             diffstep: poolDefinition[8],
//             maxClaims: poolDefinition[9],
//             maxQuantityPerClaim: poolDefinition[10],
//             maxClaimsPerAccount: poolDefinition[11],
//         });
//     }
//     const obj = request.object.attributes;
//     await savePoolFromDefinition(
//         obj.contractAddress,
//         obj.pool,
//         obj.gemPoolDefinition
//     );
// });


// /**
//  * trigger called when the merkle pool token sale is created
//  */
// Parse.Cloud.afterSave("ClaimCreated", async function (request) {
//     async function saveClaimFromDefinition(claimHash, claimDefinition) {
//         await saveObjectFromDefinition("Claims", "claimHash", claimHash, {
//             claimHash: claimDefinition[0],
//             poolId: claimDefinition[1],
//             creator: claimDefinition[2],
//             minter: claimDefinition[3],
//             depositAmount: claimDefinition[4],
//             depositToken: claimDefinition[5],
//             mintQuantity: claimDefinition[6],
//             depositLength: claimDefinition[7],
//             createdTime: claimDefinition[8],
//             createdBlock: claimDefinition[9],
//             claimedBlock: claimDefinition[10],
//             gemHash: claimDefinition[11],
//             feePaid: claimDefinition[12],
//         });
//     }
//     const obj = request.object.attributes.eventData.claim;
//     await saveClaimFromDefinition(obj[0], obj);
// });

// Parse.Cloud.afterSave("ClaimRedeemed", async function (request) {
//     async function saveClaimFromDefinition(claimHash, claimDefinition) {
//         await saveObjectFromDefinition("Claims", "claimHash", claimHash, {
//             claimHash: claimDefinition[0],
//             poolId: claimDefinition[1],
//             creator: claimDefinition[2],
//             minter: claimDefinition[3],
//             depositAmount: claimDefinition[4],
//             depositToken: claimDefinition[5],
//             mintQuantity: claimDefinition[6],
//             depositLength: claimDefinition[7],
//             createdTime: claimDefinition[8],
//             createdBlock: claimDefinition[9],
//             claimedBlock: claimDefinition[10],
//             gemHash: claimDefinition[11],
//             feePaid: claimDefinition[12],
//         });
//     }
//     const obj = request.object.attributes.eventData.claim;
//     await saveClaimFromDefinition(obj[0], obj);
// });

// /**
// * trigger called when the merkle pool token sale is created
// */
// Parse.Cloud.afterSave("GemCreated", async function (request) {
//     async function saveGemFromDefinition(
//         account,
//         poolId,
//         gemHash,
//         quantity,
//         tokenDefinition
//     ) {
//         const pool = await getRecord("Pools", "poolHash", poolId);
//         const token = await getRecord("Tokens", "symbol", pool.symbol);
//         await saveObjectFromDefinition("Gems", "gemHash", gemHash, {
//             account,
//             creator,
//             gemHash,
//             token,
//             pool,
//             poolId,
//             quantity,
//             tokenDefinition,
//         });
//     }
//     const { pool, gemHash, quantity, tokenDefinition } =
//         request.object.attributes.eventData;

//     await saveGemFromDefinition(pool, gemHash, quantity, tokenDefinition);
// });

// /**
//  * save a gem pool to the database given its definition
//  * @param {*} pool
//  * @param {*} gemPoolDefinition
//  * @returns the gem pool object
//  */
// async function saveTokenFromDefinition(poolHash, poolDefinition) {
//     // save the token to the database
//     return saveObjectFromDefinition("Tokens", "symbol", poolDefinition[2][4], {
//         token: poolDefinition[2][0],
//         id: poolDefinition[2][1],
//         collectionId: poolDefinition[2][2],
//         name: poolDefinition[2][3],
//         symbol: poolDefinition[2][4],
//         description: poolDefinition[2][5],
//         decimals: poolDefinition[2][6],
//         totalSupply: poolDefinition[2][7],
//         generateId: poolDefinition[2][8],
//         probability: poolDefinition[2][9],
//         probabilityIndex: poolDefinition[2][10],
//         probabilityRoll: poolDefinition[2][11],
//     });
// }
