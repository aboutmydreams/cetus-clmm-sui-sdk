import BN from 'bn.js';
import { LiquidityInput } from '../types/liquidity';
import type { ClmmpoolData, TickData } from '../types/clmmpool';
import Decimal from '../utils/decimal';
export type SwapStepResult = {
    amountIn: BN;
    amountOut: BN;
    nextSqrtPrice: BN;
    feeAmount: BN;
};
export type SwapResult = {
    amountIn: BN;
    amountOut: BN;
    feeAmount: BN;
    refAmount: BN;
    nextSqrtPrice: BN;
    crossTickNum: number;
};
export type CoinAmounts = {
    coinA: BN;
    coinB: BN;
};
export declare function toCoinAmount(a: number, b: number): CoinAmounts;
/**
 * Get the amount A delta about two prices, for give amount of liquidity.
 * `delta_a = (liquidity * delta_sqrt_price) / sqrt_price_upper * sqrt_price_lower)`
 *
 * @param sqrtPrice0 - A sqrt price
 * @param sqrtPrice1 - Another sqrt price
 * @param liquidity - The amount of usable liquidity
 * @param roundUp - Whether to round the amount up or down
 * @returns
 */
export declare function getDeltaA(sqrtPrice0: BN, sqrtPrice1: BN, liquidity: BN, roundUp: boolean): BN;
/**
 * Get the amount B delta about two prices, for give amount of liquidity.
 * `delta_a = (liquidity * delta_sqrt_price) / sqrt_price_upper * sqrt_price_lower)`
 *
 * @param sqrtPrice0 - A sqrt price
 * @param sqrtPrice1 - Another sqrt price
 * @param liquidity - The amount of usable liquidity
 * @param roundUp - Whether to round the amount up or down
 * @returns
 */
export declare function getDeltaB(sqrtPrice0: BN, sqrtPrice1: BN, liquidity: BN, roundUp: boolean): BN;
/**
 * Get the next sqrt price from give a delta of token_a.
 * `new_sqrt_price = (sqrt_price * liquidity) / (liquidity +/- amount * sqrt_price)`
 *
 * @param sqrtPrice - The start sqrt price
 * @param liquidity - The amount of usable liquidity
 * @param amount - The amount of token_a
 * @param byAmountIn - Weather to fixed input
 */
export declare function getNextSqrtPriceAUp(sqrtPrice: BN, liquidity: BN, amount: BN, byAmountIn: boolean): BN;
/**
 * Get the next sqrt price from give a delta of token_b.
 * `new_sqrt_price = (sqrt_price +(delta_b / liquidity)`
 *
 * @param sqrtPrice - The start sqrt price
 * @param liquidity - The amount of usable liquidity
 * @param amount - The amount of token_a
 * @param byAmountIn - Weather to fixed input
 */
export declare function getNextSqrtPriceBDown(sqrtPrice: BN, liquidity: BN, amount: BN, byAmountIn: boolean): BN;
/**
 * Get next sqrt price from input parameter.
 *
 * @param sqrtPrice
 * @param liquidity
 * @param amount
 * @param aToB
 * @returns
 */
export declare function getNextSqrtPriceFromInput(sqrtPrice: BN, liquidity: BN, amount: BN, aToB: boolean): BN;
/**
 * Get the next sqrt price from output parameters.
 *
 * @param sqrtPrice
 * @param liquidity
 * @param amount
 * @param a2b
 * @returns
 */
export declare function getNextSqrtPriceFromOutput(sqrtPrice: BN, liquidity: BN, amount: BN, a2b: boolean): BN;
/**
 * Get the amount of delta_a or delta_b from input parameters, and round up result.
 *
 * @param currentSqrtPrice
 * @param targetSqrtPrice
 * @param liquidity
 * @param a2b
 * @returns
 */
export declare function getDeltaUpFromInput(currentSqrtPrice: BN, targetSqrtPrice: BN, liquidity: BN, a2b: boolean): BN;
/**
 * Get the amount of delta_a or delta_b from output parameters, and round down result.
 *
 * @param currentSqrtPrice
 * @param targetSqrtPrice
 * @param liquidity
 * @param a2b
 * @returns
 */
export declare function getDeltaDownFromOutput(currentSqrtPrice: BN, targetSqrtPrice: BN, liquidity: BN, a2b: boolean): BN;
/**
 * Simulate per step of swap on every tick.
 *
 * @param currentSqrtPrice
 * @param targetSqrtPrice
 * @param liquidity
 * @param amount
 * @param feeRate
 * @param byAmountIn
 * @returns
 */
export declare function computeSwapStep(currentSqrtPrice: BN, targetSqrtPrice: BN, liquidity: BN, amount: BN, feeRate: BN, byAmountIn: boolean): SwapStepResult;
/**
 * Simulate swap by imput lots of ticks.
 * @param aToB
 * @param byAmountIn
 * @param amount
 * @param poolData
 * @param swapTicks
 * @returns
 */
export declare function computeSwap(aToB: boolean, byAmountIn: boolean, amount: BN, poolData: ClmmpoolData, swapTicks: Array<TickData>): SwapResult;
/**
 * Estimate liquidity for coin A
 * @param sqrtPriceX - coin A sqrtprice
 * @param sqrtPriceY - coin B sqrtprice
 * @param coinAmount - token amount
 * @return
 */
export declare function estimateLiquidityForCoinA(sqrtPriceX: BN, sqrtPriceY: BN, coinAmount: BN): BN;
/**
 * Estimate liquidity for coin B
 * @param sqrtPriceX - coin A sqrtprice
 * @param sqrtPriceY - coin B sqrtprice
 * @param coinAmount - token amount
 * @return
 */
export declare function estimateLiquidityForCoinB(sqrtPriceX: BN, sqrtPriceY: BN, coinAmount: BN): BN;
export declare class ClmmPoolUtil {
    /**
     * Update fee rate.
     * @param clmm - clmmpool data
     * @param feeAmount - fee Amount
     * @param refRate - ref rate
     * @param protocolFeeRate - protocol fee rate
     * @param iscoinA - is token A
     * @returns percentage
     */
    static updateFeeRate(clmm: ClmmpoolData, feeAmount: BN, refRate: number, protocolFeeRate: number, iscoinA: boolean): {
        refFee: BN;
        clmm: ClmmpoolData;
    };
    /**
     * Get token amount fron liquidity.
     * @param liquidity - liquidity
     * @param curSqrtPrice - Pool current sqrt price
     * @param lowerSqrtPrice - position lower sqrt price
     * @param upperSqrtPrice - position upper sqrt price
     * @param roundUp - is round up
     * @returns
     */
    static getCoinAmountFromLiquidity(liquidity: BN, curSqrtPrice: BN, lowerSqrtPrice: BN, upperSqrtPrice: BN, roundUp: boolean): CoinAmounts;
    /**
     * Estimate liquidity and token amount from one amounts
     * @param lowerTick - lower tick
     * @param upperTick - upper tick
     * @param coinAmount - token amount
     * @param iscoinA - is token A
     * @param roundUp - is round up
     * @param isIncrease - is increase
     * @param slippage - slippage percentage
     * @param curSqrtPrice - current sqrt price.
     * @return IncreaseLiquidityInput
     */
    static estLiquidityAndcoinAmountFromOneAmounts(lowerTick: number, upperTick: number, coinAmount: BN, iscoinA: boolean, roundUp: boolean, slippage: number, curSqrtPrice: BN): LiquidityInput;
    /**
     * Estimate liquidity from token amounts
     * @param curSqrtPrice - current sqrt price.
     * @param lowerTick - lower tick
     * @param upperTick - upper tick
     * @param tokenAmount - token amount
     * @return
     */
    static estimateLiquidityFromcoinAmounts(curSqrtPrice: BN, lowerTick: number, upperTick: number, tokenAmount: CoinAmounts): BN;
    /**
     * Estimate coin amounts from total amount
     * @param lowerTick
     * @param upperTick
     * @param decimalsA
     * @param decimalsB
     * @param curSqrtPrice
     * @param totalAmount
     * @param tokenPriceA
     * @param tokenPriceB
     * @returns
     */
    static estCoinAmountsFromTotalAmount(lowerTick: number, upperTick: number, curSqrtPrice: BN, totalAmount: string, tokenPriceA: string, tokenPriceB: string): {
        amountA: Decimal;
        amountB: Decimal;
    };
    static calculateDepositRatioFixTokenA(lowerTick: number, upperTick: number, curSqrtPrice: BN): {
        ratioA: Decimal;
        ratioB: Decimal;
    };
}
