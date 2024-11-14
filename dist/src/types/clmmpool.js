import BN from 'bn.js';
import { ZERO } from '../math/utils';
/**
 * Transforms a Pool object into ClmmpoolData format.
 * @param {Pool} pool - The liquidity pool object to transform.
 * @returns {ClmmpoolData} The transformed ClmmpoolData object.
 */
export function transClmmpoolDataWithoutTicks(pool) {
    const poolData = {
        coinA: pool.coinTypeA, // string
        coinB: pool.coinTypeB, // string
        currentSqrtPrice: new BN(pool.current_sqrt_price), // BN
        currentTickIndex: pool.current_tick_index, // number
        feeGrowthGlobalA: new BN(pool.fee_growth_global_a), // BN
        feeGrowthGlobalB: new BN(pool.fee_growth_global_b), // BN
        feeProtocolCoinA: new BN(pool.fee_protocol_coin_a), // BN
        feeProtocolCoinB: new BN(pool.fee_protocol_coin_b), // BN
        feeRate: new BN(pool.fee_rate), // number
        liquidity: new BN(pool.liquidity), // BN
        tickIndexes: [], // number[]
        tickSpacing: Number(pool.tickSpacing), // number
        ticks: [], // Array<TickData>
        collection_name: '',
    };
    return poolData;
}
/**
 * Creates a Bits object from an index.
 * @param {number | string} index - The index value.
 * @returns {Bits} The created Bits object.
 */
export function newBits(index) {
    const index_BN = new BN(index);
    if (index_BN.lt(ZERO)) {
        return {
            bits: index_BN
                .neg()
                .xor(new BN(2).pow(new BN(64)).sub(new BN(1)))
                .add(new BN(1))
                .toString(),
        };
    }
    return {
        bits: index_BN.toString(),
    };
}
