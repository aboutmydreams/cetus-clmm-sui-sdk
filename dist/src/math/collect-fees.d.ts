import BN from 'bn.js';
import { Pool, Position } from '../types';
import { TickData } from '../types/clmmpool';
/**
 * @category CollectFeesQuoteParam
 */
export type CollectFeesQuoteParam = {
    clmmpool: Pool;
    position: Position;
    tickLower: TickData;
    tickUpper: TickData;
};
/**
 * @category CollectFeesQuote
 */
export type CollectFeesQuote = {
    position_id: string;
    feeOwedA: BN;
    feeOwedB: BN;
};
/**
 * Get a fee quote on the outstanding fees owed to a position.
 *
 * @category CollectFeesQuoteParam
 * @param param A collection of fetched Clmmpool accounts to faciliate the quote.
 * @returns A quote object containing the fees owed for each token in the pool.
 */
export declare function collectFeesQuote(param: CollectFeesQuoteParam): CollectFeesQuote;
