import BN from 'bn.js';
import { Pool } from '../types';
import { TickData } from '../types/clmmpool';
export declare class TickUtil {
    /**
     * Get min tick index.
     * @param tick_spacing tick spacing
     * @retruns min tick index
     */
    static getMinIndex(tickSpacing: number): number;
    /**
     * Get max tick index.
     * @param tick_spacing - tick spacing
     * @retruns max tick index
     */
    static getMaxIndex(tickSpacing: number): number;
}
/**
 * Get nearest tick by current tick.
 *
 * @param tickIndex
 * @param tickSpacing
 * @returns
 */
export declare function getNearestTickByTick(tickIndex: number, tickSpacing: number): number;
/**
 * Calculate reward amount in tick range.
 * @param {Pool}pool Pool object.
 * @param {TickData}tickLower Tick lower data.
 * @param {TickData}tickUpper Tick upper data.
 * @param {number}tickLowerIndex Tick lower index.
 * @param {number}tickUpperIndex Tick upper index.
 * @param {BN[]}growthGlobal
 * @returns
 */
export declare function getRewardInTickRange(pool: Pool, tickLower: TickData, tickUpper: TickData, tickLowerIndex: number, tickUpperIndex: number, growthGlobal: BN[]): BN[];
