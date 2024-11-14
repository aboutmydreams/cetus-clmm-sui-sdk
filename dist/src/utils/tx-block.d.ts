import { Transaction } from '@mysten/sui/transactions';
/**
 * Check if the address is a valid sui address.
 * @param {string}address
 * @returns
 */
export declare function checkInvalidSuiAddress(address: string): boolean;
export declare class TxBlock {
    txBlock: Transaction;
    constructor();
    /**
     * Transfer sui to many recipoents.
     * @param {string[]}recipients The recipient addresses.
     * @param {number[]}amounts The amounts of sui coins to be transferred.
     * @returns this
     */
    transferSuiToMany(recipients: string[], amounts: number[]): this;
    /**
     * Transfer sui to one recipient.
     * @param {string}recipient recipient cannot be empty or invalid sui address.
     * @param {number}amount
     * @returns this
     */
    transferSui(recipient: string, amount: number): this;
    /**
     * Transfer coin to many recipients.
     * @param {string}recipient recipient cannot be empty or invalid sui address.
     * @param {number}amount amount cannot be empty or invalid sui address.
     * @param {string[]}coinObjectIds object ids of coins to be transferred.
     * @returns this
     * @deprecated use transferAndDestoryZeroCoin instead
     */
    transferCoin(recipient: string, amount: number, coinObjectIds: string[]): this;
}
