import BN from 'bn.js';
import Decimal from '../utils/decimal';
export declare class TickMath {
    static priceToSqrtPriceX64(price: Decimal, decimalsA: number, decimalsB: number): BN;
    static sqrtPriceX64ToPrice(sqrtPriceX64: BN, decimalsA: number, decimalsB: number): Decimal;
    static tickIndexToSqrtPriceX64(tickIndex: number): BN;
    static sqrtPriceX64ToTickIndex(sqrtPriceX64: BN): number;
    static tickIndexToPrice(tickIndex: number, decimalsA: number, decimalsB: number): Decimal;
    static priceToTickIndex(price: Decimal, decimalsA: number, decimalsB: number): number;
    static priceToInitializableTickIndex(price: Decimal, decimalsA: number, decimalsB: number, tickSpacing: number): number;
    static getInitializableTickIndex(tickIndex: number, tickSpacing: number): number;
    /**
     *
     * @param tickIndex
     * @param tickSpacing
     * @returns
     */
    static getNextInitializableTickIndex(tickIndex: number, tickSpacing: number): number;
    static getPrevInitializableTickIndex(tickIndex: number, tickSpacing: number): number;
}
export declare function getTickDataFromUrlData(ticks: any): any[];
export declare function tickScore(tickIndex: number): Decimal;
