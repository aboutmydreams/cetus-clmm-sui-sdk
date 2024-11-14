import BN from 'bn.js';
import { Pool } from '../types/clmm_type';
import { TickData } from '../types/clmmpool';
export declare enum SplitUnit {
    FIVE = 5,
    TEN = 10,
    TWENTY = 20,
    TWENTY_FIVE = 25,
    FIVETY = 50,
    HUNDRED = 100
}
export declare function createSplitArray(minSplitUnit: SplitUnit): number[];
export declare function createSplitAmountArray(amount: BN, minSplitUnit: SplitUnit): BN[];
export type SplitSwapResult = {
    amountInArray: BN[];
    amountOutArray: BN[];
    feeAmountArray: BN[];
    nextSqrtPriceArray: BN[];
    isExceed: boolean[];
};
export declare class SplitSwap {
    readonly minSplitUnit: number;
    amountArray: BN[];
    private byAmountIn;
    private a2b;
    private clmmpool;
    private ticks;
    private splitSwapResult;
    constructor(amount: BN, unit: SplitUnit, clmmpool: Pool, a2b: boolean, byAmountIn: boolean, tickData: TickData[]);
    createSplitSwapParams(amount: BN, unit: SplitUnit): void;
    computeSwap(): SplitSwapResult;
}
