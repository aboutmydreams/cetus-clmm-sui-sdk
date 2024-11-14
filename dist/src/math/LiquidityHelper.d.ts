import Decimal from 'decimal.js';
export declare function withLiquiditySlippage(value: Decimal.Instance, slippage: Decimal.Instance, mode: 'plus' | 'minus'): Decimal;
export type POOL_NO_LIQUIDITY = -1;
export type LiquidityAndCoinYResult = {
    coinYAmount: Decimal;
    lpAmount: Decimal;
};
export declare function getLiquidityAndCoinYByCoinX(coinInVal: Decimal.Instance, reserveInSize: Decimal.Instance, reserveOutSize: Decimal.Instance, lpSupply: Decimal.Instance): LiquidityAndCoinYResult | POOL_NO_LIQUIDITY;
export declare function getCoinXYForLiquidity(liquidity: Decimal.Instance, reserveInSize: Decimal.Instance, reserveOutSize: Decimal.Instance, lpSuply: Decimal.Instance): {
    coinXAmount: Decimal;
    coinYAmount: Decimal;
};
