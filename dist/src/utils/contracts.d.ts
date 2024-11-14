import { SuiAddressType, SuiStructTag } from '../types/sui';
export declare function isSortedSymbols(symbolX: string, symbolY: string): boolean;
export declare function composeType(address: string, generics: SuiAddressType[]): SuiAddressType;
export declare function composeType(address: string, struct: string, generics?: SuiAddressType[]): SuiAddressType;
export declare function composeType(address: string, module: string, struct: string, generics?: SuiAddressType[]): SuiAddressType;
export declare function extractAddressFromType(type: string): string;
export declare function extractStructTagFromType(type: string): SuiStructTag;
export declare function normalizeCoinType(coinType: string): string;
export declare function fixSuiObjectId(value: string): string;
/**
 * Fixes and normalizes a coin type by removing or keeping the prefix.
 *
 * @param {string} coinType - The coin type to be fixed.
 * @param {boolean} removePrefix - Whether to remove the prefix or not (default: true).
 * @returns {string} - The fixed and normalized coin type.
 */
export declare const fixCoinType: (coinType: string, removePrefix?: boolean) => string;
/**
 * Recursively traverses the given data object and patches any string values that represent Sui object IDs.
 *
 * @param {any} data - The data object to be patched.
 */
export declare function patchFixSuiObjectId(data: any): void;
