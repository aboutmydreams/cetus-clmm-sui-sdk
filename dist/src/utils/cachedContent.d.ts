import { SuiResource } from '../types/sui';
export declare const cacheTime5min: number;
export declare const cacheTime24h: number;
export declare function getFutureTime(interval: number): number;
/**
 * Defines the structure of a CachedContent object, used for caching resources in memory.
 */
export declare class CachedContent {
    overdueTime: number;
    value: SuiResource | null;
    constructor(value: SuiResource | null, overdueTime?: number);
    isValid(): boolean;
}
