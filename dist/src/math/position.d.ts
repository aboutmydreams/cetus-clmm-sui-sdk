import BN from 'bn.js';
import { SwapDirection } from '../types/liquidity';
import { CoinAmounts } from './clmm';
import { Percentage } from './percentage';
export declare enum AmountSpecified {
    Input = "Specified input amount",
    Output = "Specified output amount"
}
export declare enum PositionStatus {
    BelowRange = 0,
    InRange = 1,
    AboveRange = 2
}
/**
 * This class provides utility methods for working with positions.
 */
export declare class PositionUtil {
    /**
     * Get the position status for the given tick indices.
     *
     * @param currentTickIndex The current tick index.
     * @param lowerTickIndex The lower tick index.
     * @param upperTickIndex The upper tick index.
     * @returns The position status.
     */
    static getPositionStatus(currentTickIndex: number, lowerTickIndex: number, upperTickIndex: number): PositionStatus;
}
/**
 * Get token A from liquidity.
 * @param liquidity - liquidity.
 * @param sqrtPrice0X64 - Current sqrt price of coin 0.
 * @param sqrtPrice1X64 - Current sqrt price of coin 1.
 * @param roundUp - If round up.
 *
 * @returns
 */
export declare function getCoinAFromLiquidity(liquidity: BN, sqrtPrice0X64: BN, sqrtPrice1X64: BN, roundUp: boolean): BN;
/**
 * Get token B from liquidity.
 * @param liquidity - liqudity.
 * @param sqrtPrice0X64 - Current sqrt price of token 0.
 * @param sqrtPrice1X64 - Current sqrt price of token 1.
 * @param roundUp - If round up.
 *
 * @returns
 */
export declare function getCoinBFromLiquidity(liquidity: BN, sqrtPrice0X64: BN, sqrtPrice1X64: BN, roundUp: boolean): BN;
/**
 * Get liquidity from token A.
 *
 * @param amount - The amount of token A.
 * @param sqrtPriceLowerX64 - The lower sqrt price.
 * @param sqrtPriceUpperX64 - The upper sqrt price.
 * @param roundUp - If round up.
 * @returns liquidity.
 */
export declare function getLiquidityFromCoinA(amount: BN, sqrtPriceLowerX64: BN, sqrtPriceUpperX64: BN, roundUp: boolean): BN;
/**
 * Get liquidity from token B.
 * @param amount - The amount of token B.
 * @param sqrtPriceLowerX64 - The lower sqrt price.
 * @param sqrtPriceUpperX64 - The upper sqrt price.
 * @param roundUp - If round up.
 *
 * @returns liquidity.
 */
export declare function getLiquidityFromCoinB(amount: BN, sqrtPriceLowerX64: BN, sqrtPriceUpperX64: BN, roundUp: boolean): BN;
/**
 * Get amount of fixed delta.
 * @param currentSqrtPriceX64 - Current sqrt price.
 * @param targetSqrtPriceX64 - Target sqrt price.
 * @param liquidity - liqudity.
 * @param amountSpecified - The amount specified in the swap.
 * @param swapDirection - The swap direction.
 *
 * @returns
 */
export declare function getAmountFixedDelta(currentSqrtPriceX64: BN, targetSqrtPriceX64: BN, liquidity: BN, amountSpecified: AmountSpecified, swapDirection: SwapDirection): BN;
/**
 * Get amount of unfixed delta.
 * @param currentSqrtPriceX64 - Current sqrt price.
 * @param targetSqrtPriceX64 - Target sqrt price.
 * @param liquidity - liqudity.
 * @param amountSpecified - The amount specified in the swap.
 * @param swapDirection - The swap direction.
 *
 * @returns
 */
export declare function getAmountUnfixedDelta(currentSqrtPriceX64: BN, targetSqrtPriceX64: BN, liquidity: BN, amountSpecified: AmountSpecified, swapDirection: SwapDirection): BN;
export declare function adjustForSlippage(n: BN, { numerator, denominator }: Percentage, adjustUp: boolean): BN;
export declare function adjustForCoinSlippage(tokenAmount: CoinAmounts, slippage: Percentage, adjustUp: boolean): {
    tokenMaxA: BN;
    tokenMaxB: BN;
};
