import BN from 'bn.js';
import { Transaction, TransactionObjectArgument } from '@mysten/sui/transactions';
import { AddLiquidityFixTokenParams, AddLiquidityParams, ClosePositionParams, CollectFeeParams, OpenPositionParams, Position, PositionReward, RemoveLiquidityParams } from '../types';
import { SuiObjectIdType } from '../types/sui';
import { CetusClmmSDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
import { CollectFeesQuote } from '../math';
import { FetchPosFeeParams } from './rewarderModule';
/**
 * Helper class to help interact with clmm position with a position router interface.
 */
export declare class PositionModule implements IModule {
    protected _sdk: CetusClmmSDK;
    private readonly _cache;
    constructor(sdk: CetusClmmSDK);
    get sdk(): CetusClmmSDK;
    /**
     * Builds the full address of the Position type.
     * @returns The full address of the Position type.
     */
    buildPositionType(): string;
    /**
     * Gets a list of positions for the given account address.
     * @param accountAddress The account address to get positions for.
     * @param assignPoolIds An array of pool IDs to filter the positions by.
     * @returns array of Position objects.
     */
    getPositionList(accountAddress: string, assignPoolIds?: string[], showDisplay?: boolean): Promise<Position[]>;
    /**
     * Gets a position by its handle and ID. But it needs pool info, so it is not recommended to use this method.
     * if you want to get a position, you can use getPositionById method directly.
     * @param {string} positionHandle The handle of the position to get.
     * @param {string} positionID The ID of the position to get.
     * @param {boolean} calculateRewarder Whether to calculate the rewarder of the position.
     * @returns {Promise<Position>} Position object.
     */
    getPosition(positionHandle: string, positionID: string, calculateRewarder?: boolean, showDisplay?: boolean): Promise<Position>;
    /**
     * Gets a position by its ID.
     * @param {string} positionID The ID of the position to get.
     * @param {boolean} calculateRewarder Whether to calculate the rewarder of the position.
     * @returns {Promise<Position>} Position object.
     */
    getPositionById(positionID: string, calculateRewarder?: boolean, showDisplay?: boolean): Promise<Position>;
    /**
     * Gets a simple position for the given position ID.
     * @param {string} positionID The ID of the position to get.
     * @returns {Promise<Position>} Position object.
     */
    getSimplePosition(positionID: string, showDisplay?: boolean): Promise<Position>;
    /**
     * Gets a simple position for the given position ID.
     * @param {string} positionID Position object id
     * @returns {Position | undefined} Position object
     */
    private getSimplePositionByCache;
    /**
     * Gets a list of simple positions for the given position IDs.
     * @param {SuiObjectIdType[]} positionIDs The IDs of the positions to get.
     * @returns {Promise<Position[]>} A promise that resolves to an array of Position objects.
     */
    getSipmlePositionList(positionIDs: SuiObjectIdType[], showDisplay?: boolean): Promise<Position[]>;
    /**
     * Updates the rewarders of position
     * @param {string} positionHandle Position handle
     * @param {Position} position Position object
     * @returns {Promise<Position>} A promise that resolves to an array of Position objects.
     */
    private updatePositionRewarders;
    /**
     * Gets the position rewarders for the given position handle and position object ID.
     * @param {string} positionHandle The handle of the position.
     * @param {string} positionID The ID of the position object.
     * @returns {Promise<PositionReward | undefined>} PositionReward object.
     */
    getPositionRewarders(positionHandle: string, positionID: string): Promise<PositionReward | undefined>;
    /**
     * Fetches the Position fee amount for a given list of addresses.
     * @param {FetchPosFeeParams[]} params  An array of FetchPosFeeParams objects containing the target addresses and their corresponding amounts.
     * @returns {Promise<CollectFeesQuote[]>} A Promise that resolves with the fetched position fee amount for the specified addresses.
     */
    fetchPosFeeAmount(params: FetchPosFeeParams[]): Promise<CollectFeesQuote[]>;
    /**
     * Fetches the Position fee amount for a given list of addresses.
     * @param positionIDs An array of position object ids.
     * @returns {Promise<Record<string, CollectFeesQuote>>} A Promise that resolves with the fetched position fee amount for the specified position object ids.
     */
    batchFetchPositionFees(positionIDs: string[]): Promise<Record<string, CollectFeesQuote>>;
    /**
     * create add liquidity transaction payload with fix token
     * @param {AddLiquidityFixTokenParams} params
     * @param gasEstimateArg : When the fix input amount is SUI, gasEstimateArg can control whether to recalculate the number of SUI to prevent insufficient gas.
     * If this parameter is not passed, gas estimation is not performed
     * @returns {Promise<TransactionBlock>}
     */
    createAddLiquidityFixTokenPayload(params: AddLiquidityFixTokenParams, gasEstimateArg?: {
        slippage: number;
        curSqrtPrice: BN;
    }, tx?: Transaction, inputCoinA?: TransactionObjectArgument, inputCoinB?: TransactionObjectArgument): Promise<Transaction>;
    /**
     * create add liquidity transaction payload
     * @param {AddLiquidityParams} params
     * @returns {Promise<TransactionBlock>}
     */
    createAddLiquidityPayload(params: AddLiquidityParams, tx?: Transaction, inputCoinA?: TransactionObjectArgument, inputCoinB?: TransactionObjectArgument): Promise<Transaction>;
    /**
     * Remove liquidity from a position.
     * @param {RemoveLiquidityParams} params
     * @returns {TransactionBlock}
     */
    removeLiquidityTransactionPayload(params: RemoveLiquidityParams, tx?: Transaction): Promise<Transaction>;
    /**
     * Close position and remove all liquidity and collect_reward
     * @param {ClosePositionParams} params
     * @returns {TransactionBlock}
     */
    closePositionTransactionPayload(params: ClosePositionParams, tx?: Transaction): Promise<Transaction>;
    /**
     * Open position in clmmpool.
     * @param {OpenPositionParams} params
     * @returns {TransactionBlock}
     */
    openPositionTransactionPayload(params: OpenPositionParams, tx?: Transaction): Transaction;
    /**
     * Collect LP fee from Position.
     * @param {CollectFeeParams} params
     * @param {TransactionBlock} tx
     * @returns {TransactionBlock}
     */
    collectFeeTransactionPayload(params: CollectFeeParams, tx?: Transaction, inputCoinA?: TransactionObjectArgument, inputCoinB?: TransactionObjectArgument): Promise<Transaction>;
    createCollectFeePaylod(params: CollectFeeParams, tx: Transaction, primaryCoinAInput: TransactionObjectArgument, primaryCoinBInput: TransactionObjectArgument): Transaction;
    createCollectFeeNoSendPaylod(params: CollectFeeParams, tx: Transaction, primaryCoinAInput: TransactionObjectArgument, primaryCoinBInput: TransactionObjectArgument): Transaction;
    /**
     * calculate fee
     * @param {CollectFeeParams} params
     * @returns
     */
    calculateFee(params: CollectFeeParams): Promise<{
        feeOwedA: any;
        feeOwedB: any;
    }>;
    /**
     * Updates the cache for the given key.
     * @param {string} key The key of the cache entry to update.
     * @param {SuiResource} data The data to store in the cache.
     * @param {cacheTime5min} time The time in minutes after which the cache entry should expire.
     */
    private updateCache;
    /**
     * Gets the cache entry for the given key.
     * @param {string} key The key of the cache entry to get.
     * @param {boolean} forceRefresh Whether to force a refresh of the cache entry.
     * @returns The cache entry for the given key, or undefined if the cache entry does not exist or is expired.
     */
    private getCache;
}
