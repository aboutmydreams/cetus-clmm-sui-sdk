import { Transaction, TransactionObjectArgument } from '@mysten/sui/transactions';
import { CalculateRatesParams, CalculateRatesResult, Pool, PreSwapParams, PreSwapWithMultiPoolParams, SwapParams } from '../types';
import { Percentage } from '../math';
import { TickData } from '../types/clmmpool';
import { CetusClmmSDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
import { SplitPath } from './routerModuleV2';
export declare const AMM_SWAP_MODULE = "amm_swap";
export declare const POOL_STRUCT = "Pool";
/**
 * Helper class to help interact with clmm pool swap with a swap router interface.
 */
export declare class SwapModule implements IModule {
    protected _sdk: CetusClmmSDK;
    constructor(sdk: CetusClmmSDK);
    get sdk(): CetusClmmSDK;
    calculateSwapFee(paths: SplitPath[]): string;
    calculateSwapPriceImpact(paths: SplitPath[]): string;
    private calculateSingleImpact;
    /**
     * Performs a pre-swap with multiple pools.
     *
     * @param {PreSwapWithMultiPoolParams} params The parameters for the pre-swap.
     * @returns {Promise<SwapWithMultiPoolData>} A promise that resolves to the swap data.
     */
    preSwapWithMultiPool(params: PreSwapWithMultiPoolParams): Promise<{
        poolAddress: string;
        estimatedAmountIn: string;
        estimatedAmountOut: any;
        estimatedEndSqrtPrice: any;
        estimatedStartSqrtPrice: any;
        estimatedFeeAmount: any;
        isExceed: any;
        amount: string;
        aToB: boolean;
        byAmountIn: boolean;
    } | null>;
    /**
     * Performs a pre-swap.
     *
     * @param {PreSwapParams} params The parameters for the pre-swap.
     * @returns {Promise<PreSwapParams>} A promise that resolves to the swap data.
     */
    preswap(params: PreSwapParams): Promise<{
        poolAddress: string;
        currentSqrtPrice: number;
        estimatedAmountIn: string;
        estimatedAmountOut: any;
        estimatedEndSqrtPrice: any;
        estimatedFeeAmount: any;
        isExceed: any;
        amount: string;
        aToB: boolean;
        byAmountIn: boolean;
    } | null>;
    private transformSwapData;
    private transformSwapWithMultiPoolData;
    /**
     * Calculates the rates for a swap.
     * @param {CalculateRatesParams} params The parameters for the calculation.
     * @returns {CalculateRatesResult} The results of the calculation.
     */
    calculateRates(params: CalculateRatesParams): CalculateRatesResult;
    /**
     * create swap transaction payload
     * @param params
     * @param gasEstimateArg When the fix input amount is SUI, gasEstimateArg can control whether to recalculate the number of SUI to prevent insufficient gas.
     * If this parameter is not passed, gas estimation is not performed
     * @returns
     */
    createSwapTransactionPayload(params: SwapParams, gasEstimateArg?: {
        byAmountIn: boolean;
        slippage: Percentage;
        decimalsA: number;
        decimalsB: number;
        swapTicks: Array<TickData>;
        currentPool: Pool;
    }): Promise<Transaction>;
    /**
     * create swap transaction without transfer coins payload
     * @param params
     * @param gasEstimateArg When the fix input amount is SUI, gasEstimateArg can control whether to recalculate the number of SUI to prevent insufficient gas.
     * If this parameter is not passed, gas estimation is not performed
     * @returns tx and coin ABs
     */
    createSwapTransactionWithoutTransferCoinsPayload(params: SwapParams, gasEstimateArg?: {
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
}
