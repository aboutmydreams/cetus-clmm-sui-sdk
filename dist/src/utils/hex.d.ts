export declare function addHexPrefix(hex: string): string;
export declare function removeHexPrefix(hex: string): string;
export declare function shortString(str: string, start?: number, end?: number): string;
export declare function shortAddress(address: string, start?: number, end?: number): string;
export declare function checkAddress(address: any, options?: {
    leadingZero: boolean;
}): boolean;
/**
 * Attempts to turn a value into a `Buffer`. As input it supports `Buffer`, `String`, `Number`, null/undefined, `BN` and other objects with a `toArray()` method.
 * @param v the value
 */
export declare function toBuffer(v: any): Buffer;
export declare function bufferToHex(buffer: Buffer): string;
/**
 * '\x02\x00\x00\x00' to 2
 * @param binaryData
 */
export declare function hexToNumber(binaryData: string): number;
export declare function utf8to16(str: string): string;
export declare function hexToString(str: string): string;
