import { CoinBalance } from '@mysten/sui/client';
import { PoolModule } from './modules/poolModule';
import { PositionModule } from './modules/positionModule';
import { RewarderModule } from './modules/rewarderModule';
import { RouterModule } from './modules/routerModule';
import { SwapModule } from './modules/swapModule';
import { TokenModule } from './modules/tokenModule';
import { RouterModuleV2 } from './modules/routerModuleV2';
import { CetusConfigs, ClmmConfig, CoinAsset, Package, SuiResource, SuiAddressType, TokenConfig } from './types';
import { ConfigModule } from './modules';
import { RpcModule } from './modules/rpcModule';
/**
 * Represents options and configurations for an SDK.
 */
export type SdkOptions = {
    /**
     * The full URL for interacting with the RPC (Remote Procedure Call) service.
     */
    fullRpcUrl: string;
    /**
     * Optional URL for the faucet service.
     */
    faucetURL?: string;
    /**
     * Configuration for the simulation account.
     */
    simulationAccount: {
        /**
         * The address of the simulation account.
         */
        address: string;
    };
    /**
     * Package containing faucet-related configurations.
     */
    faucet?: Package;
    /**
     * Package containing token-related configurations.
     */
    token?: Package<TokenConfig>;
    /**
     * Package containing Cetus protocol configurations.
     */
    cetus_config: Package<CetusConfigs>;
    /**
     * Package containing Cryptocurrency Liquidity Mining Module (CLMM) pool configurations.
     */
    clmm_pool: Package<ClmmConfig>;
    /**
     * Package containing integration-related configurations.
     */
    integrate: Package;
    /**
     * Package containing DeepBook-related configurations.
     */
    deepbook: Package;
    /**
     * Package containing DeepBook endpoint version 2 configurations.
     */
    deepbook_endpoint_v2: Package;
    /**
     * The URL for the aggregator service.
     */
    aggregatorUrl: string;
    /**
     * The URL for the swap count
     */
    swapCountUrl?: string;
};
/**
 * The entry class of CetusClmmSDK, which is almost responsible for all interactions with CLMM.
 */
export declare class CetusClmmSDK {
    private readonly _cache;
    /**
     * RPC provider on the SUI chain
     */
    protected _rpcModule: RpcModule;
    /**
     * Provide interact with clmm pools with a pool router interface.
     */
    protected _pool: PoolModule;
    /**
     * Provide interact with clmm position with a position router interface.
     */
    protected _position: PositionModule;
    /**
     * Provide interact with a pool swap router interface.
     */
    protected _swap: SwapModule;
    /**
     * Provide interact  with a position rewarder interface.
     */
    protected _rewarder: RewarderModule;
    /**
     * Provide interact with a pool router interface.
     */
    protected _router: RouterModule;
    /**
     * Provide interact with a pool routerV2 interface.
     */
    protected _router_v2: RouterModuleV2;
    /**
     * Provide interact with pool and token config (contain token base info for metadat).
     * @deprecated Please use CetusConfig instead
     */
    protected _token: TokenModule;
    /**
     * Provide  interact with clmm pool and coin and launchpad pool config
     */
    protected _config: ConfigModule;
    /**
     *  Provide sdk options
     */
    protected _sdkOptions: SdkOptions;
    /**
     * After connecting the wallet, set the current wallet address to senderAddress.
     */
    protected _senderAddress: string;
    constructor(options: SdkOptions);
    /**
     * Getter for the sender address property.
     * @returns {SuiAddressType} The sender address.
     */
    get senderAddress(): SuiAddressType;
    /**
     * Setter for the sender address property.
     * @param {string} value - The new sender address value.
     */
    set senderAddress(value: string);
    /**
     * Getter for the Swap property.
     * @returns {SwapModule} The Swap property value.
     */
    get Swap(): SwapModule;
    /**
     * Getter for the fullClient property.
     * @returns {RpcModule} The fullClient property value.
     */
    get fullClient(): RpcModule;
    /**
     * Getter for the sdkOptions property.
     * @returns {SdkOptions} The sdkOptions property value.
     */
    get sdkOptions(): SdkOptions;
    /**
     * Getter for the Pool property.
     * @returns {PoolModule} The Pool property value.
     */
    get Pool(): PoolModule;
    /**
     * Getter for the Position property.
     * @returns {PositionModule} The Position property value.
     */
    get Position(): PositionModule;
    /**
     * Getter for the Rewarder property.
     * @returns {RewarderModule} The Rewarder property value.
     */
    get Rewarder(): RewarderModule;
    /**
     * Getter for the Router property.
     * @returns {RouterModule} The Router property value.
     */
    get Router(): RouterModule;
    /**
     * Getter for the RouterV2 property.
     * @returns {RouterModuleV2} The RouterV2 property value.
     */
    get RouterV2(): RouterModuleV2;
    /**
     * Getter for the CetusConfig property.
     * @returns {ConfigModule} The CetusConfig property value.
     */
    get CetusConfig(): ConfigModule;
    /**
     * @deprecated Token is no longer maintained. Please use CetusConfig instead
     */
    get Token(): TokenModule;
    /**
     * Gets all coin assets for the given owner and coin type.
     *
     * @param suiAddress The address of the owner.
     * @param coinType The type of the coin.
     * @returns an array of coin assets.
     */
    getOwnerCoinAssets(suiAddress: string, coinType?: string | null, forceRefresh?: boolean): Promise<CoinAsset[]>;
    /**
     * Gets all coin balances for the given owner and coin type.
     *
     * @param suiAddress The address of the owner.
     * @param coinType The type of the coin.
     * @returns an array of coin balances.
     */
    getOwnerCoinBalances(suiAddress: string, coinType?: string | null): Promise<CoinBalance[]>;
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
