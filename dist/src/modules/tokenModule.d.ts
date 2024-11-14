import { PoolInfo, TokenConfigEvent, TokenInfo } from '../types';
import { SuiResource, SuiAddressType } from '../types/sui';
import { CetusClmmSDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
/**
 * Helper class to help interact with pool and token config
 * @deprecated TokenModule is no longer maintained. Please use ConfigModule instead
 */
export declare class TokenModule implements IModule {
    protected _sdk: CetusClmmSDK;
    private readonly _cache;
    constructor(sdk: CetusClmmSDK);
    get sdk(): CetusClmmSDK;
    /**
     * Get all registered token list.
     * @param forceRefresh
     * @returns
     */
    getAllRegisteredTokenList(forceRefresh?: boolean): Promise<TokenInfo[]>;
    /**
     * Get token list by owner address.
     * @param listOwnerAddr
     * @param forceRefresh
     * @returns
     */
    getOwnerTokenList(listOwnerAddr?: string, forceRefresh?: boolean): Promise<TokenInfo[]>;
    /**
     * Get all registered pool list
     * @param forceRefresh
     * @returns
     */
    getAllRegisteredPoolList(forceRefresh?: boolean): Promise<PoolInfo[]>;
    /**
     * Get pool list by owner address.
     * @param listOwnerAddr
     * @param forceRefresh
     * @returns
     */
    getOwnerPoolList(listOwnerAddr?: string, forceRefresh?: boolean): Promise<PoolInfo[]>;
    /**
     * Get warp pool list.
     * @param forceRefresh
     * @returns
     */
    getWarpPoolList(forceRefresh?: boolean): Promise<PoolInfo[]>;
    /**
     * Get warp pool list by pool owner address and coin owner address.
     * @param poolOwnerAddr
     * @param coinOwnerAddr
     * @param forceRefresh
     * @returns
     */
    getOwnerWarpPoolList(poolOwnerAddr?: string, coinOwnerAddr?: string, forceRefresh?: boolean): Promise<PoolInfo[]>;
    /**
     * Get token list by coin types.
     * @param coinTypes
     * @returns
     */
    getTokenListByCoinTypes(coinTypes: SuiAddressType[]): Promise<Record<string, TokenInfo>>;
    private factchTokenList;
    private factchPoolList;
    private factchWarpPoolList;
    /**
     * Get the token config event.
     *
     * @param forceRefresh Whether to force a refresh of the event.
     * @returns The token config event.
     */
    getTokenConfigEvent(forceRefresh?: boolean): Promise<TokenConfigEvent>;
    private transformData;
    /**
     * Updates the cache for the given key.
     *
     * @param key The key of the cache entry to update.
     * @param data The data to store in the cache.
     * @param time The time in minutes after which the cache entry should expire.
     */
    updateCache(key: string, data: SuiResource, time?: number): void;
    /**
     * Gets the cache entry for the given key.
     *
     * @param key The key of the cache entry to get.
     * @param forceRefresh Whether to force a refresh of the cache entry.
     * @returns The cache entry for the given key, or undefined if the cache entry does not exist or is expired.
     */
    getCache<T>(key: string, forceRefresh?: boolean): T | undefined;
}
