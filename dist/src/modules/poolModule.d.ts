import { SuiTransactionBlockResponse } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { CreatePoolAddLiquidityParams, CreatePoolParams, FetchParams, ClmmConfig, Pool, PoolImmutables, Position, PositionReward, CoinAsset } from '../types';
import { TickData } from '../types/clmmpool';
import { DataPage, PaginationArgs, SuiResource } from '../types/sui';
import { CetusClmmSDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
/**
 * Helper class to help interact with clmm pools with a pool router interface.
 */
export declare class PoolModule implements IModule {
    protected _sdk: CetusClmmSDK;
    private readonly _cache;
    constructor(sdk: CetusClmmSDK);
    get sdk(): CetusClmmSDK;
    /**
     * Gets a list of positions for the given positionHandle.
     * @param {string} positionHandle The handle for the position.
     * @returns {DataPage<Position>} A promise that resolves to an array of Position objects.
     */
    getPositionList(positionHandle: string, paginationArgs?: PaginationArgs): Promise<DataPage<Position>>;
    /**
     * Gets a list of pool immutables.
     * @param {string[]} assignPoolIDs An array of pool IDs to get.
     * @param {number} offset The offset to start at.
     * @param {number} limit The number of pools to get.
     * @param {boolean} forceRefresh Whether to force a refresh of the cache.
     * @returns {Promise<PoolImmutables[]>} array of PoolImmutable objects.
     */
    getPoolImmutables(assignPoolIDs?: string[], offset?: number, limit?: number, forceRefresh?: boolean): Promise<PoolImmutables[]>;
    /**
     * Gets a list of pools.
     * @param {string[]} assignPools An array of pool IDs to get.
     * @param {number} offset The offset to start at.
     * @param {number} limit The number of pools to get.
     * @returns {Promise<Pool[]>} array of Pool objects.
     */
    getPools(assignPools?: string[], offset?: number, limit?: number): Promise<Pool[]>;
    /**
     * Gets a list of pool immutables.
     * @param {PaginationArgs} paginationArgs The cursor and limit to start at.
     * @returns {Promise<DataPage<PoolImmutables>>} Array of PoolImmutable objects.
     */
    getPoolImmutablesWithPage(paginationArgs?: PaginationArgs, forceRefresh?: boolean): Promise<DataPage<PoolImmutables>>;
    /**
     * Gets a list of pools.
     * @param {string[]} assignPools An array of pool IDs to get.
     * @param {PaginationArgs} paginationArgs The cursor and limit to start at.
     * @param {boolean} forceRefresh Whether to force a refresh of the cache.
     * @returns {Promise<Pool[]>} An array of Pool objects.
     */
    getPoolsWithPage(assignPools?: string[], paginationArgs?: PaginationArgs, forceRefresh?: boolean): Promise<Pool[]>;
    /**
     * Gets a pool by its object ID.
     * @param {string} poolID The object ID of the pool to get.
     * @param {true} forceRefresh Whether to force a refresh of the cache.
     * @returns {Promise<Pool>} A promise that resolves to a Pool object.
     */
    getPool(poolID: string, forceRefresh?: boolean): Promise<Pool>;
    getPoolByCoins(coins: string[], feeRate?: number): Promise<Pool[]>;
    /**
     * Creates a transaction payload for creating multiple pools.
     * @param {CreatePoolParams[]} paramss The parameters for the pools.
     * @returns {Promise<Transaction>} A promise that resolves to the transaction payload.
     */
    creatPoolsTransactionPayload(paramss: CreatePoolParams[]): Promise<Transaction>;
    /**
     * Create a pool of clmmpool protocol. The pool is identified by (CoinTypeA, CoinTypeB, tick_spacing).
     * @param {CreatePoolParams | CreatePoolAddLiquidityParams} params
     * @returns {Promise<Transaction>}
     */
    creatPoolTransactionPayload(params: CreatePoolAddLiquidityParams): Promise<Transaction>;
    /**
     * Gets the ClmmConfig object for the given package object ID.
     * @param {boolean} forceRefresh Whether to force a refresh of the cache.
     * @returns the ClmmConfig object.
     */
    getClmmConfigs(forceRefresh?: boolean): Promise<ClmmConfig>;
    /**
     * Gets the SUI transaction response for a given transaction digest.
     * @param digest - The digest of the transaction for which the SUI transaction response is requested.
     * @param forceRefresh - A boolean flag indicating whether to force a refresh of the response.
     * @returns A Promise that resolves with the SUI transaction block response or null if the response is not available.
     */
    getSuiTransactionResponse(digest: string, forceRefresh?: boolean): Promise<SuiTransactionBlockResponse | null>;
    /**
     * Create pool internal.
     * @param {CreatePoolParams[]}params The parameters for the pools.
     * @returns {Promise<Transaction>} A promise that resolves to the transaction payload.
     */
    private creatPool;
    /**
     * Create pool and add liquidity internal. It will call create_pool_with_liquidity function.
     * @param {CreatePoolAddLiquidityParams}params The parameters for the create and liquidity.
     * @returns {Promise<Transaction>} A promise that resolves to the transaction payload.
     */
    private creatPoolAndAddLiquidity;
    /**
     * Fetches ticks from the exchange.
     * @param {FetchParams} params The parameters for the fetch.
     * @returns {Promise<TickData[]>} A promise that resolves to an array of tick data.
     */
    fetchTicks(params: FetchParams): Promise<TickData[]>;
    /**
     * Fetches ticks from the exchange using the simulation exec tx.
     * @param {GetTickParams} params The parameters for the fetch.
     * @returns {Promise<TickData[]>} A promise that resolves to an array of tick data.
     */
    private getTicks;
    /**
     * Fetches a list of position rewards from the exchange.
     * @param {FetchParams} params The parameters for the fetch.
     * @returns {Promise<PositionReward[]>} A promise that resolves to an array of position rewards.
     */
    fetchPositionRewardList(params: FetchParams): Promise<PositionReward[]>;
    /**
     * Fetches ticks from the fullnode using the RPC API.
     * @param {string} tickHandle The handle for the tick.
     * @returns {Promise<TickData[]>} A promise that resolves to an array of tick data.
     */
    fetchTicksByRpc(tickHandle: string): Promise<TickData[]>;
    /**
     * Get ticks by tick object ids.
     * @param {string} tickObjectId The object ids of the ticks.
     * @returns {Promise<TickData[]>} A promise that resolves to an array of tick data.
     */
    private getTicksByRpc;
    /**
     * Gets the tick data for the given tick index.
     * @param {string} tickHandle The handle for the tick.
     * @param {number} tickIndex The index of the tick.
     * @returns {Promise<TickData | null>} A promise that resolves to the tick data.
     */
    getTickDataByIndex(tickHandle: string, tickIndex: number): Promise<TickData>;
    /**
     * Gets the tick data for the given object ID.
     * @param {string} tickId The object ID of the tick.
     * @returns {Promise<TickData | null>} A promise that resolves to the tick data.
     */
    getTickDataByObjectId(tickId: string): Promise<TickData | null>;
    /**
     * Get partner ref fee amount
     * @param {string}partner Partner object id
     * @returns {Promise<CoinAsset[]>} A promise that resolves to an array of coin asset.
     */
    getPartnerRefFeeAmount(partner: string, showDisplay?: boolean): Promise<CoinAsset[]>;
    /**
     * Claim partner ref fee.
     * @param {string} partnerCap partner cap id.
     * @param {string} partner partner id.
     * @returns {Promise<Transaction>} A promise that resolves to the transaction payload.
     */
    claimPartnerRefFeePayload(partnerCap: string, partner: string, coinType: string): Promise<Transaction>;
    /**
     * Updates the cache for the given key.
     * @param key The key of the cache entry to update.
     * @param data The data to store in the cache.
     * @param time The time in minutes after which the cache entry should expire.
     */
    updateCache(key: string, data: SuiResource, time?: number): void;
    /**
     * Gets the cache entry for the given key.
     * @param key The key of the cache entry to get.
     * @param forceRefresh Whether to force a refresh of the cache entry.
     * @returns The cache entry for the given key, or undefined if the cache entry does not exist or is expired.
     */
    getCache<T>(key: string, forceRefresh?: boolean): T | undefined;
}
