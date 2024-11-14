import { PoolModule } from './modules/poolModule';
import { PositionModule } from './modules/positionModule';
import { RewarderModule } from './modules/rewarderModule';
import { RouterModule } from './modules/routerModule';
import { SwapModule } from './modules/swapModule';
import { TokenModule } from './modules/tokenModule';
import { RouterModuleV2 } from './modules/routerModuleV2';
import { CachedContent, cacheTime24h, extractStructTagFromType, getFutureTime, patchFixSuiObjectId } from './utils';
import { ConfigModule } from './modules';
import { RpcModule } from './modules/rpcModule';
/**
 * The entry class of CetusClmmSDK, which is almost responsible for all interactions with CLMM.
 */
export class CetusClmmSDK {
    constructor(options) {
        this._cache = {};
        /**
         * After connecting the wallet, set the current wallet address to senderAddress.
         */
        this._senderAddress = '';
        this._sdkOptions = options;
        this._rpcModule = new RpcModule({
            url: options.fullRpcUrl,
        });
        this._swap = new SwapModule(this);
        this._pool = new PoolModule(this);
        this._position = new PositionModule(this);
        this._rewarder = new RewarderModule(this);
        this._router = new RouterModule(this);
        this._router_v2 = new RouterModuleV2(this);
        this._token = new TokenModule(this);
        this._config = new ConfigModule(this);
        patchFixSuiObjectId(this._sdkOptions);
    }
    /**
     * Getter for the sender address property.
     * @returns {SuiAddressType} The sender address.
     */
    get senderAddress() {
        return this._senderAddress;
    }
    /**
     * Setter for the sender address property.
     * @param {string} value - The new sender address value.
     */
    set senderAddress(value) {
        this._senderAddress = value;
    }
    /**
     * Getter for the Swap property.
     * @returns {SwapModule} The Swap property value.
     */
    get Swap() {
        return this._swap;
    }
    /**
     * Getter for the fullClient property.
     * @returns {RpcModule} The fullClient property value.
     */
    get fullClient() {
        return this._rpcModule;
    }
    /**
     * Getter for the sdkOptions property.
     * @returns {SdkOptions} The sdkOptions property value.
     */
    get sdkOptions() {
        return this._sdkOptions;
    }
    /**
     * Getter for the Pool property.
     * @returns {PoolModule} The Pool property value.
     */
    get Pool() {
        return this._pool;
    }
    /**
     * Getter for the Position property.
     * @returns {PositionModule} The Position property value.
     */
    get Position() {
        return this._position;
    }
    /**
     * Getter for the Rewarder property.
     * @returns {RewarderModule} The Rewarder property value.
     */
    get Rewarder() {
        return this._rewarder;
    }
    /**
     * Getter for the Router property.
     * @returns {RouterModule} The Router property value.
     */
    get Router() {
        return this._router;
    }
    /**
     * Getter for the RouterV2 property.
     * @returns {RouterModuleV2} The RouterV2 property value.
     */
    get RouterV2() {
        return this._router_v2;
    }
    /**
     * Getter for the CetusConfig property.
     * @returns {ConfigModule} The CetusConfig property value.
     */
    get CetusConfig() {
        return this._config;
    }
    /**
     * @deprecated Token is no longer maintained. Please use CetusConfig instead
     */
    get Token() {
        return this._token;
    }
    /**
     * Gets all coin assets for the given owner and coin type.
     *
     * @param suiAddress The address of the owner.
     * @param coinType The type of the coin.
     * @returns an array of coin assets.
     */
    async getOwnerCoinAssets(suiAddress, coinType, forceRefresh = true) {
        const allCoinAsset = [];
        let nextCursor = null;
        const cacheKey = `${this.sdkOptions.fullRpcUrl}_${suiAddress}_${coinType}_getOwnerCoinAssets`;
        const cacheData = this.getCache(cacheKey, forceRefresh);
        if (cacheData) {
            return cacheData;
        }
        while (true) {
            const allCoinObject = await (coinType
                ? this.fullClient.getCoins({
                    owner: suiAddress,
                    coinType,
                    cursor: nextCursor,
                })
                : this.fullClient.getAllCoins({
                    owner: suiAddress,
                    cursor: nextCursor,
                }));
            allCoinObject.data.forEach((coin) => {
                if (BigInt(coin.balance) > 0) {
                    allCoinAsset.push({
                        coinAddress: extractStructTagFromType(coin.coinType).source_address,
                        coinObjectId: coin.coinObjectId,
                        balance: BigInt(coin.balance),
                    });
                }
            });
            nextCursor = allCoinObject.nextCursor;
            if (!allCoinObject.hasNextPage) {
                break;
            }
        }
        this.updateCache(cacheKey, allCoinAsset, 30 * 1000);
        return allCoinAsset;
    }
    /**
     * Gets all coin balances for the given owner and coin type.
     *
     * @param suiAddress The address of the owner.
     * @param coinType The type of the coin.
     * @returns an array of coin balances.
     */
    async getOwnerCoinBalances(suiAddress, coinType) {
        let allCoinBalance = [];
        if (coinType) {
            const res = await this.fullClient.getBalance({
                owner: suiAddress,
                coinType,
            });
            allCoinBalance = [res];
        }
        else {
            const res = await this.fullClient.getAllBalances({
                owner: suiAddress,
            });
            allCoinBalance = [...res];
        }
        return allCoinBalance;
    }
    /**
     * Updates the cache for the given key.
     *
     * @param key The key of the cache entry to update.
     * @param data The data to store in the cache.
     * @param time The time in minutes after which the cache entry should expire.
     */
    updateCache(key, data, time = cacheTime24h) {
        let cacheData = this._cache[key];
        if (cacheData) {
            cacheData.overdueTime = getFutureTime(time);
            cacheData.value = data;
        }
        else {
            cacheData = new CachedContent(data, getFutureTime(time));
        }
        this._cache[key] = cacheData;
    }
    /**
     * Gets the cache entry for the given key.
     *
     * @param key The key of the cache entry to get.
     * @param forceRefresh Whether to force a refresh of the cache entry.
     * @returns The cache entry for the given key, or undefined if the cache entry does not exist or is expired.
     */
    getCache(key, forceRefresh = false) {
        const cacheData = this._cache[key];
        const isValid = cacheData?.isValid();
        if (!forceRefresh && isValid) {
            return cacheData.value;
        }
        if (!isValid) {
            delete this._cache[key];
        }
        return undefined;
    }
}
