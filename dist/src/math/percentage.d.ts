import BN from 'bn.js';
import type { Decimal } from 'decimal.js';
/**
 * Percentage - the util set for percentage struct.
 */
export declare class Percentage {
    readonly numerator: BN;
    readonly denominator: BN;
    constructor(numerator: BN, denominator: BN);
    /**
     * Get the percentage of a number.
     *
     * @param number
     * @returns
     */
    static fromDecimal(number: Decimal): Percentage;
    /**
     * Get the percentage of a fraction.
     *
     * @param numerator
     * @param denominator
     * @returns
     */
    static fromFraction(numerator: BN | number, denominator: BN | number): Percentage;
}
