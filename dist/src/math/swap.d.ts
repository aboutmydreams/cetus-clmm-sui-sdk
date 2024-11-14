import BN from 'bn.js';
export declare class SwapUtils {
    /**
     * Get the default sqrt price limit for a swap.
     *
     * @param a2b - true if the swap is A to B, false if the swap is B to A.
     * @returns The default sqrt price limit for the swap.
     */
    static getDefaultSqrtPriceLimit(a2b: boolean): BN;
    /**
     * Get the default values for the otherAmountThreshold in a swap.
     *
     * @param amountSpecifiedIsInput - The direction of a swap
     * @returns The default values for the otherAmountThreshold parameter in a swap.
     */
    static getDefaultOtherAmountThreshold(amountSpecifiedIsInput: boolean): BN;
}
/**
 * Get lower sqrt price from token A.
 *
 * @param amount - The amount of tokens the user wanted to swap from.
 * @param liquidity - The liquidity of the pool.
 * @param sqrtPriceX64 - The sqrt price of the pool.
 * @returns LowesqrtPriceX64
 */
export declare function getLowerSqrtPriceFromCoinA(amount: BN, liquidity: BN, sqrtPriceX64: BN): BN;
/**
 * Get upper sqrt price from token A.
 *
 * @param amount - The amount of tokens the user wanted to swap from.
 * @param liquidity - The liquidity of the pool.
 * @param sqrtPriceX64 - The sqrt price of the pool.
 * @returns LowesqrtPriceX64
 */
export declare function getUpperSqrtPriceFromCoinA(amount: BN, liquidity: BN, sqrtPriceX64: BN): BN;
/**
 * Get lower sqrt price from coin B.
 *
 * @param amount - The amount of coins the user wanted to swap from.
 * @param liquidity - The liquidity of the pool.
 * @param sqrtPriceX64 - The sqrt price of the pool.
 * @returns LowesqrtPriceX64
 */
export declare function getLowerSqrtPriceFromCoinB(amount: BN, liquidity: BN, sqrtPriceX64: BN): BN;
/**
 * Get upper sqrt price from coin B.
 *
 * @param amount - The amount of coins the user wanted to swap from.
 * @param liquidity - The liquidity of the pool.
 * @param sqrtPriceX64 - The sqrt price of the pool.
 * @returns LowesqrtPriceX64
 */
export declare function getUpperSqrtPriceFromCoinB(amount: BN, liquidity: BN, sqrtPriceX64: BN): BN;
