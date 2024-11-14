import Decimal from 'decimal.js';
import { d } from '../utils/numbers';
import { ClmmpoolsError, MathErrorCode } from '../errors/errors';
export function withLiquiditySlippage(value, slippage, mode) {
    return d(value)[mode](d(value).mul(slippage)).toDP(0);
}
export function getLiquidityAndCoinYByCoinX(coinInVal, reserveInSize, reserveOutSize, lpSupply) {
    if (coinInVal.lessThanOrEqualTo(0)) {
        throw new ClmmpoolsError('coinInVal is less than zero', MathErrorCode.InvalidCoinAmount);
    }
    if (reserveInSize.lessThanOrEqualTo(0) || reserveOutSize.lessThanOrEqualTo(0)) {
        return -1;
    }
    const coinYAmount = coinInVal.mul(reserveOutSize).div(reserveInSize);
    // const sqrtSupply = reserveInSize.mul(reserveOutSize).sqrt()
    const sqrtSupply = lpSupply;
    const lpX = coinInVal.div(reserveInSize).mul(sqrtSupply);
    const lpY = coinYAmount.div(reserveOutSize).mul(sqrtSupply);
    const lpAmount = Decimal.min(lpX, lpY);
    return {
        coinYAmount,
        lpAmount,
    };
}
export function getCoinXYForLiquidity(liquidity, reserveInSize, reserveOutSize, lpSuply) {
    if (liquidity.lessThanOrEqualTo(0)) {
        throw new ClmmpoolsError("liquidity can't be equal or less than zero", MathErrorCode.InvalidLiquidityAmount);
    }
    if (reserveInSize.lessThanOrEqualTo(0) || reserveOutSize.lessThanOrEqualTo(0)) {
        throw new ClmmpoolsError('reserveInSize or reserveOutSize can not be equal or less than zero', MathErrorCode.InvalidReserveAmount);
    }
    // const sqrtSupply = reserveInSize.mul(reserveOutSize).sqrt()
    const sqrtSupply = lpSuply;
    const coinXAmount = liquidity.div(sqrtSupply).mul(reserveInSize);
    const coinYAmount = liquidity.div(sqrtSupply).mul(reserveOutSize);
    return {
        coinXAmount,
        coinYAmount,
    };
}
