import BN from 'bn.js';
import { TransactionArgument, Transaction } from '@mysten/sui/transactions';
import { SdkOptions } from '../sdk';
import SDK from '../main';
export type Order = {
    quantity: number;
    price: number;
};
export type DeepbookPool = {
    poolID: string;
    tickSize: number;
    lotSize: number;
    baseAsset: string;
    quoteAsset: string;
    takerFeeRate: number;
    makerRebateRate: number;
};
export declare class DeepbookUtils {
    static createAccountCap(senderAddress: string, sdkOptions: SdkOptions, tx: Transaction, isTransfer?: boolean): ({
        $kind: "NestedResult";
        NestedResult: [number, number];
    } | Transaction)[];
    static deleteAccountCap(accountCap: string, sdkOptions: SdkOptions, tx: Transaction): Transaction;
    static deleteAccountCapByObject(accountCap: TransactionArgument, sdkOptions: SdkOptions, tx: Transaction): Transaction;
    static getAccountCap(sdk: SDK, showDisplay?: boolean): Promise<string>;
    static getPools(sdk: SDK): Promise<DeepbookPool[]>;
    static getPoolAsks(sdk: SDK, poolAddress: string, baseCoin: string, quoteCoin: string): Promise<Order[]>;
    static getPoolBids(sdk: SDK, poolAddress: string, baseCoin: string, quoteCoin: string): Promise<Order[]>;
    static preSwap(sdk: SDK, pool: DeepbookPool, a2b: boolean, amountIn: number): Promise<{
        poolAddress: string;
        estimatedAmountIn: number;
        estimatedAmountOut: number;
        estimatedFeeAmount: BN;
        isExceed: boolean;
        amount: number;
        aToB: boolean;
        byAmountIn: boolean;
    }>;
    static simulateSwap(sdk: SDK, poolID: string, baseCoin: string, quoteCoin: string, a2b: boolean, amount: number): Promise<{
        poolAddress: any;
        estimatedAmountIn: any;
        estimatedAmountOut: any;
        aToB: any;
    } | null>;
}
