import BN from 'bn.js';
import Decimal from 'decimal.js';
export declare function estPoolAPR(preBlockReward: BN, rewardPrice: BN, totalTradingFee: BN, totalLiquidityValue: BN): BN;
export type estPosAPRResult = {
    feeAPR: Decimal;
    posRewarder0APR: Decimal;
    posRewarder1APR: Decimal;
    posRewarder2APR: Decimal;
};
export declare function estPositionAPRWithDeltaMethod(currentTickIndex: number, lowerTickIndex: number, upperTickIndex: number, currentSqrtPriceX64: BN, poolLiquidity: BN, decimalsA: number, decimalsB: number, decimalsRewarder0: number, decimalsRewarder1: number, decimalsRewarder2: number, feeRate: number, amountAStr: string, amountBStr: string, poolAmountA: BN, poolAmountB: BN, swapVolumeStr: string, poolRewarders0Str: string, poolRewarders1Str: string, poolRewarders2Str: string, coinAPriceStr: string, coinBPriceStr: string, rewarder0PriceStr: string, rewarder1PriceStr: string, rewarder2PriceStr: string): estPosAPRResult;
export declare function estPositionAPRWithMultiMethod(lowerUserPrice: number, upperUserPrice: number, lowerHistPrice: number, upperHistPrice: number): Decimal;
