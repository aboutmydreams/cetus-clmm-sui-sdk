import BN from 'bn.js';
import { Transaction, TransactionObjectArgument } from '@mysten/sui/transactions';
import { SwapWithRouterParams } from '../modules/routerModule';
import { TickData } from '../types/clmmpool';
import SDK, { AddLiquidityFixTokenParams, CoinAsset, CoinPairType, CollectRewarderParams, Percentage, Pool, SdkOptions, SwapParams } from '../index';
import { AggregatorResult, BasePath } from '../modules/routerModuleV2';
export type AdjustResult = {
    isAdjustCoinA: boolean;
    isAdjustCoinB: boolean;
};
/**
 * Adjust coinpair is sui
 * @param {CoinPairType} coinPair
 * @returns
 */
export declare function findAdjustCoin(coinPair: CoinPairType): AdjustResult;
export type BuildCoinResult = {
    targetCoin: TransactionObjectArgument;
    remainCoins: CoinAsset[];
    isMintZeroCoin: boolean;
    tragetCoinAmount: string;
    originalSplitedCoin?: TransactionObjectArgument;
};
type CoinInputInterval = {
    amountSecond: bigint;
    amountFirst: bigint;
};
export declare function printTransaction(tx: Transaction, isPrint?: boolean): Promise<void>;
export declare class TransactionUtil {
    static createCollectRewarderAndFeeParams(sdk: SDK, tx: Transaction, params: CollectRewarderParams, allCoinAsset: CoinAsset[], allCoinAssetA?: CoinAsset[], allCoinAssetB?: CoinAsset[]): Transaction;
    /**
     * adjust transaction for gas
     * @param sdk
     * @param amount
     * @param tx
     * @returns
     */
    static adjustTransactionForGas(sdk: SDK, allCoins: CoinAsset[], amount: bigint, tx: Transaction): Promise<{
        fixAmount: bigint;
        newTx?: Transaction;
    }>;
    /**
     * build add liquidity transaction
     * @param params
     * @param slippage
     * @param curSqrtPrice
     * @returns
     */
    static buildAddLiquidityFixTokenForGas(sdk: SDK, allCoins: CoinAsset[], params: AddLiquidityFixTokenParams, gasEstimateArg: {
        slippage: number;
        curSqrtPrice: BN;
    }, tx?: Transaction, inputCoinA?: TransactionObjectArgument, inputCoinB?: TransactionObjectArgument): Promise<Transaction>;
    /**
     * build add liquidity transaction
     * @param params
     * @param packageId
     * @returns
     */
    static buildAddLiquidityFixToken(sdk: SDK, allCoinAsset: CoinAsset[], params: AddLiquidityFixTokenParams, tx?: Transaction, inputCoinA?: TransactionObjectArgument, inputCoinB?: TransactionObjectArgument): Promise<Transaction>;
    static buildAddLiquidityFixTokenCoinInput(tx: Transaction, need_interval_amount: boolean, amount: number | string, slippage: number, coinType: string, allCoinAsset: CoinAsset[], buildVector?: boolean): BuildCoinResult;
    /**
     * fix add liquidity fix token for coin amount
     * @param params
     * @param slippage
     * @param curSqrtPrice
     * @returns
     */
    static fixAddLiquidityFixTokenParams(params: AddLiquidityFixTokenParams, slippage: number, curSqrtPrice: BN): AddLiquidityFixTokenParams;
    private static buildAddLiquidityFixTokenArgs;
    /**
     * build add liquidity transaction
     * @param params
     * @param slippage
     * @param curSqrtPrice
     * @returns
     */
    static buildSwapTransactionForGas(sdk: SDK, params: SwapParams, allCoinAsset: CoinAsset[], gasEstimateArg: {
        byAmountIn: boolean;
        slippage: Percentage;
        decimalsA: number;
        decimalsB: number;
        swapTicks: Array<TickData>;
        currentPool: Pool;
    }): Promise<Transaction>;
    /**
     * build swap transaction
     * @param params
     * @param packageId
     * @returns
     */
    static buildSwapTransaction(sdk: SDK, params: SwapParams, allCoinAsset: CoinAsset[]): Transaction;
    /**
     * build swap transaction
     * @param params
     * @param packageId
     * @returns
     */
    static buildSwapTransactionArgs(tx: Transaction, params: SwapParams, sdkOptions: SdkOptions, primaryCoinInputA: BuildCoinResult, primaryCoinInputB: BuildCoinResult): Transaction;
    /**
     * build add liquidity transaction with out transfer coins
     * @param params
     * @param slippage
     * @param curSqrtPrice
     * @returns
     */
    static buildSwapTransactionWithoutTransferCoinsForGas(sdk: SDK, params: SwapParams, allCoinAsset: CoinAsset[], gasEstimateArg: {
        byAmountIn: boolean;
        slippage: Percentage;
        decimalsA: number;
        decimalsB: number;
        swapTicks: Array<TickData>;
        currentPool: Pool;
    }): Promise<{
        tx: Transaction;
        coinABs: TransactionObjectArgument[];
    }>;
    /**
     * build swap transaction and return swaped coin
     * @param params
     * @param packageId
     * @returns
     */
    static buildSwapTransactionWithoutTransferCoins(sdk: SDK, params: SwapParams, allCoinAsset: CoinAsset[]): {
        tx: Transaction;
        coinABs: TransactionObjectArgument[];
    };
    /**
     * build swap transaction
     * @param params
     * @param packageId
     * @returns
     */
    static buildSwapTransactionWithoutTransferCoinArgs(sdk: SDK, tx: Transaction, params: SwapParams, sdkOptions: SdkOptions, primaryCoinInputA: BuildCoinResult, primaryCoinInputB: BuildCoinResult): {
        tx: Transaction;
        txRes: TransactionObjectArgument[];
    };
    static fixSwapParams(sdk: SDK, params: SwapParams, gasEstimateArg: {
        byAmountIn: boolean;
        slippage: Percentage;
        decimalsA: number;
        decimalsB: number;
        swapTicks: Array<TickData>;
        currentPool: Pool;
    }): Promise<SwapParams>;
    static syncBuildCoinInputForAmount(sdk: SDK, tx: Transaction, amount: bigint, coinType: string, buildVector?: boolean): Promise<TransactionObjectArgument | undefined>;
    static buildCoinForAmount(tx: Transaction, allCoins: CoinAsset[], amount: bigint, coinType: string, buildVector?: boolean, fixAmount?: boolean): BuildCoinResult;
    private static buildCoin;
    private static buildZeroValueCoin;
    static buildCoinForAmountInterval(tx: Transaction, allCoins: CoinAsset[], amounts: CoinInputInterval, coinType: string, buildVector?: boolean): BuildCoinResult;
    static callMintZeroValueCoin: (txb: Transaction, coinType: string) => import("@mysten/sui/dist/cjs/transactions").TransactionResult;
    static buildRouterSwapTransaction(sdk: SDK, params: SwapWithRouterParams, byAmountIn: boolean, allCoinAsset: CoinAsset[], recipient?: string): Promise<Transaction>;
    static buildRouterBasePathTx(sdk: SDK, params: SwapWithRouterParams, byAmountIn: boolean, allCoinAsset: CoinAsset[], tx: Transaction, recipient?: string): Promise<Transaction>;
    static buildRouterBasePathReturnCoins(sdk: SDK, params: SwapWithRouterParams, byAmountIn: boolean, fromCoinBuildRes: BuildCoinResult, toCoinBuildRes: BuildCoinResult, tx: Transaction): Promise<{
        fromCoin: TransactionObjectArgument;
        toCoin: TransactionObjectArgument;
        tx: Transaction;
    }>;
    static buildAggregatorSwapReturnCoins(sdk: SDK, param: AggregatorResult, fromCoinBuildRes: BuildCoinResult, toCoinBuildRes: BuildCoinResult, partner: string, priceSplitPoint: number, tx: Transaction, recipient?: string): Promise<{
        fromCoin: TransactionObjectArgument;
        toCoin: TransactionObjectArgument;
        tx: Transaction;
    }>;
    static buildAggregatorSwapTransaction(sdk: SDK, param: AggregatorResult, allCoinAsset: CoinAsset[], partner: string, priceSlippagePoint: number, recipient?: string): Promise<Transaction>;
    static checkCoinThreshold(sdk: SDK, byAmountIn: boolean, tx: Transaction, coin: TransactionObjectArgument, amountLimit: number, coinType: string): void;
    static buildDeepbookBasePathTx(sdk: SDK, basePath: BasePath, tx: Transaction, accountCap: any, from: TransactionObjectArgument, to: TransactionObjectArgument, middleStep: boolean): {
        from: TransactionObjectArgument;
        to: TransactionObjectArgument;
        tx: Transaction;
    };
    private static buildClmmBasePathTx;
    static buildCoinTypePair(coinTypes: string[], partitionQuantities: number[]): string[][];
    static buildTransferCoinToSender(sdk: SDK, tx: Transaction, coin: TransactionObjectArgument, coinType: string): void;
    static buildTransferCoin(sdk: SDK, tx: Transaction, coin: TransactionObjectArgument, coinType: string, recipient?: string): void;
}
export {};
