import { SuiClient, } from '@mysten/sui/client';
/**
 * Represents a module for making RPC (Remote Procedure Call) requests.
 */
export class RpcModule extends SuiClient {
    /**
     * Get events for a given query criteria
     * @param query
     * @param paginationArgs
     * @returns
     */
    async queryEventsByPage(query, paginationArgs = 'all') {
        let result = [];
        let hasNextPage = true;
        const queryAll = paginationArgs === 'all';
        let nextCursor = queryAll ? null : paginationArgs.cursor;
        do {
            const res = await this.queryEvents({
                query,
                cursor: nextCursor,
                limit: queryAll ? null : paginationArgs.limit,
            });
            if (res.data) {
                result = [...result, ...res.data];
                hasNextPage = res.hasNextPage;
                nextCursor = res.nextCursor;
            }
            else {
                hasNextPage = false;
            }
        } while (queryAll && hasNextPage);
        return { data: result, nextCursor, hasNextPage };
    }
    /**
     * Get all objects owned by an address
     * @param owner
     * @param query
     * @param paginationArgs
     * @returns
     */
    async getOwnedObjectsByPage(owner, query, paginationArgs = 'all') {
        let result = [];
        let hasNextPage = true;
        const queryAll = paginationArgs === 'all';
        let nextCursor = queryAll ? null : paginationArgs.cursor;
        do {
            const res = await this.getOwnedObjects({
                owner,
                ...query,
                cursor: nextCursor,
                limit: queryAll ? null : paginationArgs.limit,
            });
            if (res.data) {
                result = [...result, ...res.data];
                hasNextPage = res.hasNextPage;
                nextCursor = res.nextCursor;
            }
            else {
                hasNextPage = false;
            }
        } while (queryAll && hasNextPage);
        return { data: result, nextCursor, hasNextPage };
    }
    /**
     * Return the list of dynamic field objects owned by an object
     * @param parentId
     * @param paginationArgs
     * @returns
     */
    async getDynamicFieldsByPage(parentId, paginationArgs = 'all') {
        let result = [];
        let hasNextPage = true;
        const queryAll = paginationArgs === 'all';
        let nextCursor = queryAll ? null : paginationArgs.cursor;
        do {
            const res = await this.getDynamicFields({
                parentId,
                cursor: nextCursor,
                limit: queryAll ? null : paginationArgs.limit,
            });
            if (res.data) {
                result = [...result, ...res.data];
                hasNextPage = res.hasNextPage;
                nextCursor = res.nextCursor;
            }
            else {
                hasNextPage = false;
            }
        } while (queryAll && hasNextPage);
        return { data: result, nextCursor, hasNextPage };
    }
    /**
     * Batch get details about a list of objects. If any of the object ids are duplicates the call will fail
     * @param ids
     * @param options
     * @param limit
     * @returns
     */
    async batchGetObjects(ids, options, limit = 50) {
        let objectDataResponses = [];
        try {
            for (let i = 0; i < Math.ceil(ids.length / limit); i++) {
                const res = await this.multiGetObjects({
                    ids: ids.slice(i * limit, limit * (i + 1)),
                    options,
                });
                objectDataResponses = [...objectDataResponses, ...res];
            }
        }
        catch (error) {
            console.log(error);
        }
        return objectDataResponses;
    }
    /**
     * Calculates the gas cost of a transaction block.
     * @param {Transaction} tx - The transaction block to calculate gas for.
     * @returns {Promise<number>} - The estimated gas cost of the transaction block.
     * @throws {Error} - Throws an error if the sender is empty.
     */
    async calculationTxGas(tx) {
        const { sender } = tx.blockData;
        if (sender === undefined) {
            throw Error('sdk sender is empty');
        }
        const devResult = await this.devInspectTransactionBlock({
            transactionBlock: tx,
            sender,
        });
        const { gasUsed } = devResult.effects;
        const estimateGas = Number(gasUsed.computationCost) + Number(gasUsed.storageCost) - Number(gasUsed.storageRebate);
        return estimateGas;
    }
    /**
     * Sends a transaction block after signing it with the provided keypair.
     *
     * @param {Ed25519Keypair | Secp256k1Keypair} keypair - The keypair used for signing the transaction.
     * @param {Transaction} tx - The transaction block to send.
     * @returns {Promise<SuiTransactionBlockResponse | undefined>} - The response of the sent transaction block.
     */
    async sendTransaction(keypair, tx) {
        try {
            const resultTxn = await this.signAndExecuteTransaction({
                transaction: tx,
                signer: keypair,
                options: {
                    showEffects: true,
                    showEvents: true,
                },
            });
            return resultTxn;
        }
        catch (error) {
            console.log('error: ', error);
        }
        return undefined;
    }
    /**
     * Send a simulation transaction.
     * @param tx - The transaction block.
     * @param simulationAccount - The simulation account.
     * @param useDevInspect - A flag indicating whether to use DevInspect. Defaults to true.
     * @returns A promise that resolves to DevInspectResults or undefined.
     */
    async sendSimulationTransaction(tx, simulationAccount, useDevInspect = true) {
        try {
            if (useDevInspect) {
                const simulateRes = await this.devInspectTransactionBlock({
                    transactionBlock: tx,
                    sender: simulationAccount,
                });
                return simulateRes;
            }
            // If useDevInspect is false, manually construct the transaction for simulation.
            // const inputs = tx.inputs.map((input) => {
            //   const { type, value } = input
            //   if (type === 'object') {
            //     return Inputs.SharedObjectRef({
            //       objectId: value,
            //       initialSharedVersion: 0,
            //       mutable: true,
            //     })
            //   }
            //   return value
            // })
            // const kind = {
            //   ProgrammableTransaction: {
            //     inputs,
            //     transactions: tx,
            //   },
            // }
            // // Serialize the transaction using BCS.
            // const serialize = bcs.TransactionKind.serialize(kind, {
            //   maxSize: 131072,
            // }).toBytes()
            // const devInspectTxBytes = toB64(serialize)
            // // Send the request to DevInspect.
            // const res = await this.transport.request<DevInspectResults>({
            //   method: 'sui_devInspectTransactionBlock',
            //   params: [simulationAccount, devInspectTxBytes, null, null],
            // })
            // return res
        }
        catch (error) {
            console.log('devInspectTransactionBlock error', error);
        }
        return undefined;
    }
}
