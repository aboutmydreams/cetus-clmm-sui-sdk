import { Transaction } from '@mysten/sui/transactions';
import { DevInspectResults, SuiClient, SuiEventFilter, SuiObjectDataOptions, SuiObjectResponse, SuiObjectResponseQuery, SuiTransactionBlockResponse } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Secp256k1Keypair } from '@mysten/sui/keypairs/secp256k1';
import { DataPage, PaginationArgs, SuiObjectIdType } from '../types';
/**
 * Represents a module for making RPC (Remote Procedure Call) requests.
 */
export declare class RpcModule extends SuiClient {
    /**
     * Get events for a given query criteria
     * @param query
     * @param paginationArgs
     * @returns
     */
    queryEventsByPage(query: SuiEventFilter, paginationArgs?: PaginationArgs): Promise<DataPage<any>>;
    /**
     * Get all objects owned by an address
     * @param owner
     * @param query
     * @param paginationArgs
     * @returns
     */
    getOwnedObjectsByPage(owner: string, query: SuiObjectResponseQuery, paginationArgs?: PaginationArgs): Promise<DataPage<any>>;
    /**
     * Return the list of dynamic field objects owned by an object
     * @param parentId
     * @param paginationArgs
     * @returns
     */
    getDynamicFieldsByPage(parentId: SuiObjectIdType, paginationArgs?: PaginationArgs): Promise<DataPage<any>>;
    /**
     * Batch get details about a list of objects. If any of the object ids are duplicates the call will fail
     * @param ids
     * @param options
     * @param limit
     * @returns
     */
    batchGetObjects(ids: SuiObjectIdType[], options?: SuiObjectDataOptions, limit?: number): Promise<SuiObjectResponse[]>;
    /**
     * Calculates the gas cost of a transaction block.
     * @param {Transaction} tx - The transaction block to calculate gas for.
     * @returns {Promise<number>} - The estimated gas cost of the transaction block.
     * @throws {Error} - Throws an error if the sender is empty.
     */
    calculationTxGas(tx: Transaction): Promise<number>;
    /**
     * Sends a transaction block after signing it with the provided keypair.
     *
     * @param {Ed25519Keypair | Secp256k1Keypair} keypair - The keypair used for signing the transaction.
     * @param {Transaction} tx - The transaction block to send.
     * @returns {Promise<SuiTransactionBlockResponse | undefined>} - The response of the sent transaction block.
     */
    sendTransaction(keypair: Ed25519Keypair | Secp256k1Keypair, tx: Transaction): Promise<SuiTransactionBlockResponse | undefined>;
    /**
     * Send a simulation transaction.
     * @param tx - The transaction block.
     * @param simulationAccount - The simulation account.
     * @param useDevInspect - A flag indicating whether to use DevInspect. Defaults to true.
     * @returns A promise that resolves to DevInspectResults or undefined.
     */
    sendSimulationTransaction(tx: Transaction, simulationAccount: string, useDevInspect?: boolean): Promise<DevInspectResults | undefined>;
}
