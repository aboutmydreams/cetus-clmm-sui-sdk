import BN from 'bn.js';
import Decimal from 'decimal.js';
import { CetusClmmSDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
import { PreSwapLpChangeParams, PreSwapWithMultiPoolParams } from '../types';
import { AxiosRequestConfig } from 'axios';
export type BasePath = {
    direction: boolean;
    label: string;
    poolAddress: string;
    fromCoin: string;
    toCoin: string;
    feeRate: number;
    outputAmount: number;
    inputAmount: number;
    currentSqrtPrice: BN;
    fromDecimal: number;
    toDecimal: number;
    currentPrice: Decimal;
};
export type SplitPath = {
    percent: number;
    inputAmount: number;
    outputAmount: number;
    pathIndex: number;
    lastQuoteOutput: number;
    basePaths: BasePath[];
};
export type AggregatorResult = {
    isExceed: boolean;
    isTimeout: boolean;
    inputAmount: number;
    outputAmount: number;
    fromCoin: string;
    toCoin: string;
    byAmountIn: boolean;
    splitPaths: SplitPath[];
};
export declare class RouterModuleV2 implements IModule {
    protected _sdk: CetusClmmSDK;
    constructor(sdk: CetusClmmSDK);
    get sdk(): CetusClmmSDK;
    private calculatePrice;
    private parseJsonResult;
    fetchDataWithAxios(apiUrl: string, _options: AxiosRequestConfig, timeoutDuration: number): Promise<AggregatorResult | null>;
    /**
     * Optimal routing method with fallback functionality.
     * This method first attempts to find the optimal route using the routing backend. If the optimal route is available, it will return this route.
     * If the optimal route is not available (for example, due to network issues or API errors), this method will activate a fallback mechanism,
     * and try to find a suboptimal route using the routing algorithm built into the SDK, which only includes clmm pool. This way, even if the optimal route is not available, this method can still provide a usable route.
     * This method uses a fallback strategy to ensure that it can provide the best available route when facing problems, rather than failing completely.
     *
     * @param {string} from Sold `from` coin
     * @param {string} from: get `to` coin
     * @param {number} from: the amount of sold coin
     * @param {boolena} byAmountIn:
     */
    getBestRouter(from: string, to: string, amount: number, byAmountIn: boolean, priceSplitPoint: number, partner: string, 
    /**
     * @deprecated don't need to pass, just use empty string.
     */
    _senderAddress?: string, swapWithMultiPoolParams?: PreSwapWithMultiPoolParams, orderSplit?: boolean, externalRouter?: boolean, lpChanges?: PreSwapLpChangeParams[]): Promise<{
        result: AggregatorResult;
        version: string;
    }>;
    getBestRouterByServer(from: string, to: string, amount: number, byAmountIn: boolean, 
    /**
     * @deprecated don't need to pass, just use empty string.
     */
    _senderAddress?: string, orderSplit?: boolean, externalRouter?: boolean, lpChanges?: PreSwapLpChangeParams[]): Promise<AggregatorResult>;
    getBestRouterByRpc(from: string, to: string, amount: number, byAmountIn: boolean, priceSplitPoint: number, partner: string, swapWithMultiPoolParams?: PreSwapWithMultiPoolParams): Promise<AggregatorResult>;
}
