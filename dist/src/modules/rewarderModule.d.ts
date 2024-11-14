import BN from 'bn.js';
import { Transaction, TransactionArgument, TransactionObjectArgument } from '@mysten/sui/transactions';
import { CetusClmmSDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
import { CollectRewarderParams, Pool, Rewarder, RewarderAmountOwed } from '../types';
import { CollectFeesQuote } from '../math';
export type FetchPosRewardParams = {
    poolAddress: string;
    positionId: string;
    coinTypeA: string;
    coinTypeB: string;
    rewarderInfo: Rewarder[];
};
export type FetchPosFeeParams = {
    poolAddress: string;
    positionId: string;
    coinTypeA: string;
    coinTypeB: string;
};
export type PosRewarderResult = {
    poolAddress: string;
    positionId: string;
    rewarderAmountOwed: RewarderAmountOwed[];
};
/**
 * Helper class to help interact with clmm position rewaeder with a rewaeder router interface.
 */
export declare class RewarderModule implements IModule {
    protected _sdk: CetusClmmSDK;
    private growthGlobal;
    constructor(sdk: CetusClmmSDK);
    get sdk(): CetusClmmSDK;
    /**
     * Gets the emissions for the given pool every day.
     *
     * @param {string} poolID The object ID of the pool.
     * @returns {Promise<Array<{emissions: number, coinAddress: string}>>} A promise that resolves to an array of objects with the emissions and coin address for each rewarder.
     */
    emissionsEveryDay(poolID: string): Promise<{
        emissions: number;
        coin_address: string;
    }[] | null>;
    /**
     * Updates the rewarder for the given pool.
     *
     * @param {string} poolID The object ID of the pool.
     * @param {BN} currentTime The current time in seconds since the Unix epoch.
     * @returns {Promise<Pool>} A promise that resolves to the updated pool.
     */
    private updatePoolRewarder;
    /**
     * Gets the amount owed to the rewarders for the given position.
     *
     * @param {string} poolID The object ID of the pool.
     * @param {string} positionHandle The handle of the position.
     * @param {string} positionID The ID of the position.
     * @returns {Promise<Array<{amountOwed: number}>>} A promise that resolves to an array of objects with the amount owed to each rewarder.
     * @deprecated This method is deprecated and may be removed in future versions. Use `sdk.Rewarder.fetchPosRewardersAmount()` instead.
     */
    posRewardersAmount(poolID: string, positionHandle: string, positionID: string): Promise<RewarderAmountOwed[]>;
    /**
     * Gets the amount owed to the rewarders for the given account and pool.
     *
     * @param {string} accountAddress The account address.
     * @param {string} poolID The object ID of the pool.
     * @returns {Promise<Array<{amountOwed: number}>>} A promise that resolves to an array of objects with the amount owed to each rewarder.
     * @deprecated This method is deprecated and may be removed in future versions. Use `sdk.Rewarder.fetchPosRewardersAmount()` instead.
     */
    poolRewardersAmount(accountAddress: string, poolID: string): Promise<BN[]>;
    /**
     * Gets the amount owed to the rewarders for the given account and pool.
     * @param {Pool} pool Pool object
     * @param {PositionReward} position Position object
     * @param {TickData} tickLower Lower tick data
     * @param {TickData} tickUpper Upper tick data
     * @returns {RewarderAmountOwed[]}
     */
    private posRewardersAmountInternal;
    /**
     * Fetches the Position reward amount for a given list of addresses.
     * @param {string[]}positionIDs An array of position object ids.
     * @returns {Promise<Record<string, RewarderAmountOwed[]>>} A Promise that resolves with the fetched position reward amount for the specified position object ids.
     */
    batchFetchPositionRewarders(positionIDs: string[]): Promise<Record<string, RewarderAmountOwed[]>>;
    /**
     * Fetch the position rewards for a given pool.
     * @param {Pool}pool Pool object
     * @param {string}positionId Position object id
     * @returns {Promise<RewarderAmountOwed[]>} A Promise that resolves with the fetched position reward amount for the specified position object id.
     */
    fetchPositionRewarders(pool: Pool, positionId: string): Promise<RewarderAmountOwed[]>;
    /**
     * Fetches the Position fee amount for a given list of addresses.
     * @param positionIDs An array of position object ids.
     * @returns {Promise<Record<string, CollectFeesQuote>>} A Promise that resolves with the fetched position fee amount for the specified position object ids.
     * @deprecated This method is deprecated and may be removed in future versions. Use alternative methods if available.
     */
    batchFetchPositionFees(positionIDs: string[]): Promise<Record<string, CollectFeesQuote>>;
    /**
     * Fetches the Position fee amount for a given list of addresses.
     * @param params  An array of FetchPosFeeParams objects containing the target addresses and their corresponding amounts.
     * @returns
     */
    fetchPosFeeAmount(params: FetchPosFeeParams[]): Promise<CollectFeesQuote[]>;
    /**
     * Fetches the Position reward amount for a given list of addresses.
     * @param params  An array of FetchPosRewardParams objects containing the target addresses and their corresponding amounts.
     * @returns
     */
    fetchPosRewardersAmount(params: FetchPosRewardParams[]): Promise<PosRewarderResult[]>;
    /**
     * Fetches the pool reward amount for a given account and pool object id.
     * @param {string} account - The target account.
     * @param {string} poolObjectId - The target pool object id.
     * @returns {Promise<number|null>} - A Promise that resolves with the fetched pool reward amount for the specified account and pool, or null if the fetch is unsuccessful.
     */
    fetchPoolRewardersAmount(account: string, poolObjectId: string): Promise<BN[]>;
    private getPoolLowerAndUpperTicks;
    /**
     * Collect rewards from Position.
     * @param params
     * @param gasBudget
     * @returns
     */
    collectRewarderTransactionPayload(params: CollectRewarderParams): Promise<Transaction>;
    /**
     * batech Collect rewards from Position.
     * @param params
     * @param published_at
     * @param tx
     * @returns
     */
    batchCollectRewardePayload(params: CollectRewarderParams[], tx?: Transaction, inputCoinA?: TransactionObjectArgument, inputCoinB?: TransactionObjectArgument): Promise<Transaction>;
    createCollectRewarderPaylod(params: CollectRewarderParams, tx: Transaction, primaryCoinInputs: TransactionArgument[]): Transaction;
    createCollectRewarderNoSendPaylod(params: CollectRewarderParams, tx: Transaction, primaryCoinInputs: TransactionArgument[]): Transaction;
}
