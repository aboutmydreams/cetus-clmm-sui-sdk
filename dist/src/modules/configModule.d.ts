import { IModule } from '../interfaces/IModule';
import { CetusClmmSDK } from '../sdk';
import { CetusConfigs, ClmmPoolConfig, CoinConfig, LaunchpadPoolConfig } from '../types';
import { SuiAddressType, SuiResource } from '../types/sui';
/**
 * Helper class to help interact with clmm pool and coin and launchpad pool config.
 */
export declare class ConfigModule implements IModule {
    protected _sdk: CetusClmmSDK;
    private readonly _cache;
    constructor(sdk: CetusClmmSDK);
    get sdk(): CetusClmmSDK;
    /**
     * Set default token list cache.
     * @param {CoinConfig[]}coinList
     */
    setTokenListCache(coinList: CoinConfig[]): void;
    /**
     * Get token config list by coin type list.
     * @param {SuiAddressType[]} coinTypes Coin type list.
     * @returns {Promise<Record<string, CoinConfig>>} Token config map.
     */
    getTokenListByCoinTypes(coinTypes: SuiAddressType[]): Promise<Record<string, CoinConfig>>;
    /**
     * Get coin config list.
     * @param {boolean} forceRefresh Whether to force a refresh of the cache entry.
     * @param {boolean} transformExtensions Whether to transform extensions.
     * @returns {Promise<CoinConfig[]>} Coin config list.
     */
    getCoinConfigs(forceRefresh?: boolean, transformExtensions?: boolean): Promise<CoinConfig[]>;
    /**
     * Get coin config by coin type.
     * @param {string} coinType Coin type.
     * @param {boolean} forceRefresh Whether to force a refresh of the cache entry.
     * @param {boolean} transformExtensions Whether to transform extensions.
     * @returns {Promise<CoinConfig>} Coin config.
     */
    getCoinConfig(coinType: string, forceRefresh?: boolean, transformExtensions?: boolean): Promise<CoinConfig>;
    /**
     * Build coin config.
     * @param {SuiObjectResponse} object Coin object.
     * @param {boolean} transformExtensions Whether to transform extensions.
     * @returns {CoinConfig} Coin config.
     */
    private buildCoinConfig;
    /**
     * Get clmm pool config list.
     * @param forceRefresh
     * @returns
     */
    getClmmPoolConfigs(forceRefresh?: boolean, transformExtensions?: boolean): Promise<ClmmPoolConfig[]>;
    getClmmPoolConfig(poolAddress: string, forceRefresh?: boolean, transformExtensions?: boolean): Promise<ClmmPoolConfig>;
    private buildClmmPoolConfig;
    /**
     * Get launchpad pool config list.
     * @param forceRefresh
     * @returns
     */
    getLaunchpadPoolConfigs(forceRefresh?: boolean, transformExtensions?: boolean): Promise<LaunchpadPoolConfig[]>;
    getLaunchpadPoolConfig(poolAddress: string, forceRefresh?: boolean, transformExtensions?: boolean): Promise<LaunchpadPoolConfig>;
    private buildLaunchpadPoolConfig;
    private transformExtensions;
    /**
     * Get the token config event.
     *
     * @param forceRefresh Whether to force a refresh of the event.
     * @returns The token config event.
     */
    getCetusConfig(forceRefresh?: boolean): Promise<CetusConfigs>;
    private getCetusConfigHandle;
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
