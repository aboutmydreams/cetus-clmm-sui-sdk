import { SwapDirection } from '../types/liquidity';
import { MathUtil } from './utils';
export var AmountSpecified;
(function (AmountSpecified) {
    AmountSpecified["Input"] = "Specified input amount";
    AmountSpecified["Output"] = "Specified output amount";
})(AmountSpecified || (AmountSpecified = {}));
export var PositionStatus;
(function (PositionStatus) {
    PositionStatus[PositionStatus["BelowRange"] = 0] = "BelowRange";
    PositionStatus[PositionStatus["InRange"] = 1] = "InRange";
    PositionStatus[PositionStatus["AboveRange"] = 2] = "AboveRange";
})(PositionStatus || (PositionStatus = {}));
/**
 * This class provides utility methods for working with positions.
 */
export class PositionUtil {
    /**
     * Get the position status for the given tick indices.
     *
     * @param currentTickIndex The current tick index.
     * @param lowerTickIndex The lower tick index.
     * @param upperTickIndex The upper tick index.
     * @returns The position status.
     */
    static getPositionStatus(currentTickIndex, lowerTickIndex, upperTickIndex) {
        if (currentTickIndex < lowerTickIndex) {
            return PositionStatus.BelowRange;
        }
        if (currentTickIndex < upperTickIndex) {
            return PositionStatus.InRange;
        }
        return PositionStatus.AboveRange;
    }
}
/**
 * Order sqrt price.
 * @param liquidity - liqudity.
 * @param sqrtPrice0X64 - Current sqrt price of coin 0.
 * @param sqrtPrice1X64 - Current sqrt price of coin 1.
 *
 * @returns
 */
function orderSqrtPrice(sqrtPrice0X64, sqrtPrice1X64) {
    if (sqrtPrice0X64.lt(sqrtPrice1X64)) {
        return [sqrtPrice0X64, sqrtPrice1X64];
    }
    return [sqrtPrice1X64, sqrtPrice0X64];
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
export function getCoinAFromLiquidity(liquidity, sqrtPrice0X64, sqrtPrice1X64, roundUp) {
    const [sqrtPriceLowerX64, sqrtPriceUpperX64] = orderSqrtPrice(sqrtPrice0X64, sqrtPrice1X64);
    const numerator = liquidity.mul(sqrtPriceUpperX64.sub(sqrtPriceLowerX64)).shln(64);
    const denominator = sqrtPriceUpperX64.mul(sqrtPriceLowerX64);
    if (roundUp) {
        return MathUtil.divRoundUp(numerator, denominator);
    }
    return numerator.div(denominator);
}
/**
 * Get token B from liquidity.
 * @param liquidity - liqudity.
 * @param sqrtPrice0X64 - Current sqrt price of token 0.
 * @param sqrtPrice1X64 - Current sqrt price of token 1.
 * @param roundUp - If round up.
 *
 * @returns
 */
export function getCoinBFromLiquidity(liquidity, sqrtPrice0X64, sqrtPrice1X64, roundUp) {
    const [sqrtPriceLowerX64, sqrtPriceUpperX64] = orderSqrtPrice(sqrtPrice0X64, sqrtPrice1X64);
    const result = liquidity.mul(sqrtPriceUpperX64.sub(sqrtPriceLowerX64));
    if (roundUp) {
        return MathUtil.shiftRightRoundUp(result);
    }
    return result.shrn(64);
}
/**
 * Get liquidity from token A.
 *
 * @param amount - The amount of token A.
 * @param sqrtPriceLowerX64 - The lower sqrt price.
 * @param sqrtPriceUpperX64 - The upper sqrt price.
 * @param roundUp - If round up.
 * @returns liquidity.
 */
export function getLiquidityFromCoinA(amount, sqrtPriceLowerX64, sqrtPriceUpperX64, roundUp) {
    const result = amount.mul(sqrtPriceLowerX64).mul(sqrtPriceUpperX64).div(sqrtPriceUpperX64.sub(sqrtPriceLowerX64));
    if (roundUp) {
        return MathUtil.shiftRightRoundUp(result);
    }
    return result.shrn(64);
}
/**
 * Get liquidity from token B.
 * @param amount - The amount of token B.
 * @param sqrtPriceLowerX64 - The lower sqrt price.
 * @param sqrtPriceUpperX64 - The upper sqrt price.
 * @param roundUp - If round up.
 *
 * @returns liquidity.
 */
export function getLiquidityFromCoinB(amount, sqrtPriceLowerX64, sqrtPriceUpperX64, roundUp) {
    const numerator = amount.shln(64);
    const denominator = sqrtPriceUpperX64.sub(sqrtPriceLowerX64);
    if (roundUp) {
        return MathUtil.divRoundUp(numerator, denominator);
    }
    return numerator.div(denominator);
}
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
export function getAmountFixedDelta(currentSqrtPriceX64, targetSqrtPriceX64, liquidity, amountSpecified, swapDirection) {
    if ((amountSpecified === AmountSpecified.Input) === (swapDirection === SwapDirection.A2B)) {
        return getCoinAFromLiquidity(liquidity, currentSqrtPriceX64, targetSqrtPriceX64, amountSpecified === AmountSpecified.Input);
    }
    return getCoinBFromLiquidity(liquidity, currentSqrtPriceX64, targetSqrtPriceX64, amountSpecified === AmountSpecified.Input);
}
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
export function getAmountUnfixedDelta(currentSqrtPriceX64, targetSqrtPriceX64, liquidity, amountSpecified, swapDirection) {
    if ((amountSpecified === AmountSpecified.Input) === (swapDirection === SwapDirection.A2B)) {
        return getCoinBFromLiquidity(liquidity, currentSqrtPriceX64, targetSqrtPriceX64, amountSpecified === AmountSpecified.Output);
    }
    return getCoinAFromLiquidity(liquidity, currentSqrtPriceX64, targetSqrtPriceX64, amountSpecified === AmountSpecified.Output);
}
export function adjustForSlippage(n, { numerator, denominator }, adjustUp) {
    if (adjustUp) {
        return n.mul(denominator.add(numerator)).div(denominator);
    }
    return n.mul(denominator).div(denominator.add(numerator));
}
export function adjustForCoinSlippage(tokenAmount, slippage, adjustUp) {
    return {
        tokenMaxA: adjustForSlippage(tokenAmount.coinA, slippage, adjustUp),
        tokenMaxB: adjustForSlippage(tokenAmount.coinB, slippage, adjustUp),
    };
}
