import BN from 'bn.js';
import { Graph } from '@syntsugar/cc-graph';
import { PreSwapWithMultiPoolParams } from '../types';
import { SuiAddressType } from '../types/sui';
import { CetusClmmSDK } from '../sdk';
import { IModule } from '../interfaces/IModule';
export interface CoinNode {
    address: string;
    decimals: number;
}
export interface CoinProvider {
    coins: CoinNode[];
}
export interface PathLink {
    base: string;
    quote: string;
    addressMap: Map<number, string>;
}
export interface PathProvider {
    paths: PathLink[];
}
export type OnePath = {
    amountIn: BN;
    amountOut: BN;
    poolAddress: string[];
    a2b: boolean[];
    rawAmountLimit: BN[];
    isExceed: boolean;
    coinType: string[];
};
export type AddressAndDirection = {
    addressMap: Map<number, string>;
    direction: boolean;
};
export type SwapWithRouterParams = {
    paths: OnePath[];
    partner: string;
    priceSlippagePoint: number;
};
export type PreRouterSwapParams = {
    stepNums: number;
    poolAB: string;
    poolBC: string | undefined;
    a2b: boolean;
    b2c: boolean | undefined;
    byAmountIn: boolean;
    amount: BN;
    coinTypeA: SuiAddressType;
    coinTypeB: SuiAddressType;
    coinTypeC: SuiAddressType | undefined;
};
export type PreSwapResult = {
    index: number;
    amountIn: BN;
    amountMedium: BN;
    amountOut: BN;
    targetSqrtPrice: BN[];
    currentSqrtPrice: BN[];
    isExceed: boolean;
    stepNum: number;
};
export type PriceResult = {
    amountIn: BN;
    amountOut: BN;
    paths: OnePath[];
    a2b: boolean;
    b2c: boolean | undefined;
    byAmountIn: boolean;
    isExceed: boolean;
    targetSqrtPrice: BN[];
    currentSqrtPrice: BN[];
    coinTypeA: SuiAddressType;
    coinTypeB: SuiAddressType;
    coinTypeC: SuiAddressType | undefined;
    createTxParams: SwapWithRouterParams | undefined;
};
type PoolWithTvl = {
    poolAddress: string;
    tvl: number;
};
export declare class RouterModule implements IModule {
    readonly graph: Graph;
    readonly pathProviders: PathProvider[];
    private coinProviders;
    private _coinAddressMap;
    private poolAddressMap;
    protected _sdk: CetusClmmSDK;
    constructor(sdk: CetusClmmSDK);
    get sdk(): CetusClmmSDK;
    /**
     * Get pool address map with direction
     * @param {string} base base coin
     * @param {string} quote quote coin
     * @returns {AddressAndDirection} address with direction
     */
    getPoolAddressMapAndDirection(base: string, quote: string): AddressAndDirection | undefined;
    /**
     * set coin list in coin address map
     */
    private setCoinList;
    /**
     * Find best router must load graph first
     * @param {CoinProvider} coins all coins
     * @param {PathProvider} paths all paths
     */
    loadGraph(coins: CoinProvider, paths: PathProvider): void;
    /**
     * Add path provider to router graph
     * @param {PathProvider} provider path provider
     * @returns {RouterModule} module of router
     */
    private addPathProvider;
    /**
     * Add coin provider to router graph
     * @param {CoinProvider} provider  coin provider
     * @returns {RouterModule} module of router
     */
    private addCoinProvider;
    /**
     * Get token info from coin address map
     * @param {string} key coin type
     * @returns {CoinNode | undefined}
     */
    tokenInfo(key: string): CoinNode | undefined;
    /**
     * Get fee rate info from pool address map
     * @param from from coin type
     * @param to to coin type
     * @param address pool address
     * @returns fee rate of pool
     */
    getFeeRate(from: string, to: string, address: string): number;
    /**
     * Get the best price from router graph.
     *
     * @param {string} from from coin type
     * @param {string} to to coin type
     * @param {BN} amount coin amount
     * @param {boolean} byAmountIn weather fixed inoput amount
     * @param {number} priceSlippagePoint price splippage point
     * @param {string} partner partner object id
     * @param {PreSwapWithMultiPoolParams} swapWithMultiPoolParams use to downgrade
     * @returns {Promise<PriceResult | undefined>} best swap router
     */
    price(from: string, to: string, amount: BN, byAmountIn: boolean, priceSlippagePoint: number, partner: string, swapWithMultiPoolParams?: PreSwapWithMultiPoolParams): Promise<PriceResult | undefined>;
    priceUseV1(from: string, to: string, _amount: BN, byAmountIn: boolean, priceSlippagePoint: number, partner: string, swapWithMultiPoolParams?: PreSwapWithMultiPoolParams): Promise<PriceResult>;
    preRouterSwapA2B2C(params: PreRouterSwapParams[]): Promise<PreSwapResult | null>;
    getPoolWithTVL(): Promise<PoolWithTvl[]>;
}
export {};
