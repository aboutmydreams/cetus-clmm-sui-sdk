import BN from 'bn.js';
import Decimal from 'decimal.js';
import { TickMath } from './tick';
import { MathUtil } from './utils';
const D365 = new BN(365);
const H24 = new BN(24);
const S3600 = new BN(3600);
const B05 = new BN(0.5);
export function estPoolAPR(preBlockReward, rewardPrice, totalTradingFee, totalLiquidityValue) {
    const annualRate = D365.mul(H24).mul(S3600).mul(B05);
    const APR = annualRate.mul(preBlockReward.mul(rewardPrice).add(totalTradingFee).div(totalLiquidityValue));
    return APR;
}
function calculatePoolValidTVL(amountA, amountB, decimalsA, decimalsB, coinAPrice, coinBPrice) {
    const poolValidAmountA = new Decimal(amountA.toString()).div(new Decimal(10 ** decimalsA));
    const poolValidAmountB = new Decimal(amountB.toString()).div(new Decimal(10 ** decimalsB));
    const TVL = poolValidAmountA.mul(coinAPrice).add(poolValidAmountB.mul(coinBPrice));
    return TVL;
}
export function estPositionAPRWithDeltaMethod(currentTickIndex, lowerTickIndex, upperTickIndex, currentSqrtPriceX64, poolLiquidity, decimalsA, decimalsB, decimalsRewarder0, decimalsRewarder1, decimalsRewarder2, feeRate, amountAStr, amountBStr, poolAmountA, poolAmountB, swapVolumeStr, poolRewarders0Str, poolRewarders1Str, poolRewarders2Str, coinAPriceStr, coinBPriceStr, rewarder0PriceStr, rewarder1PriceStr, rewarder2PriceStr) {
    const amountA = new Decimal(amountAStr);
    const amountB = new Decimal(amountBStr);
    const swapVolume = new Decimal(swapVolumeStr);
    const poolRewarders0 = new Decimal(poolRewarders0Str);
    const poolRewarders1 = new Decimal(poolRewarders1Str);
    const poolRewarders2 = new Decimal(poolRewarders2Str);
    const coinAPrice = new Decimal(coinAPriceStr);
    const coinBPrice = new Decimal(coinBPriceStr);
    const rewarder0Price = new Decimal(rewarder0PriceStr);
    const rewarder1Price = new Decimal(rewarder1PriceStr);
    const rewarder2Price = new Decimal(rewarder2PriceStr);
    const lowerSqrtPriceX64 = TickMath.tickIndexToSqrtPriceX64(lowerTickIndex);
    const upperSqrtPriceX64 = TickMath.tickIndexToSqrtPriceX64(upperTickIndex);
    const lowerSqrtPriceD = MathUtil.toX64_Decimal(MathUtil.fromX64(lowerSqrtPriceX64)).round();
    const upperSqrtPriceD = MathUtil.toX64_Decimal(MathUtil.fromX64(upperSqrtPriceX64)).round();
    const currentSqrtPriceD = MathUtil.toX64_Decimal(MathUtil.fromX64(currentSqrtPriceX64)).round();
    let deltaLiquidity;
    const liquidityAmount0 = amountA
        .mul(new Decimal(10 ** decimalsA))
        .mul(upperSqrtPriceD.mul(lowerSqrtPriceD))
        .div(upperSqrtPriceD.sub(lowerSqrtPriceD))
        .round();
    const liquidityAmount1 = amountB
        .mul(new Decimal(10 ** decimalsB))
        .div(upperSqrtPriceD.sub(lowerSqrtPriceD))
        .round();
    if (currentTickIndex < lowerTickIndex) {
        deltaLiquidity = liquidityAmount0;
    }
    else if (currentTickIndex > upperTickIndex) {
        deltaLiquidity = liquidityAmount1;
    }
    else {
        deltaLiquidity = Decimal.min(liquidityAmount0, liquidityAmount1);
    }
    const deltaY = deltaLiquidity.mul(currentSqrtPriceD.sub(lowerSqrtPriceD));
    const deltaX = deltaLiquidity.mul(upperSqrtPriceD.sub(currentSqrtPriceD)).div(currentSqrtPriceD.mul(upperSqrtPriceD));
    const posValidTVL = deltaX
        .div(new Decimal(10 ** decimalsA))
        .mul(coinAPrice)
        .add(deltaY.div(new Decimal(10 ** decimalsB).mul(coinBPrice)));
    const poolValidTVL = calculatePoolValidTVL(poolAmountA, poolAmountB, decimalsA, decimalsB, coinAPrice, coinBPrice);
    const posValidRate = posValidTVL.div(poolValidTVL);
    const feeAPR = deltaLiquidity.eq(new Decimal(0))
        ? new Decimal(0)
        : new Decimal(feeRate / 10000)
            .mul(swapVolume)
            .mul(new Decimal(deltaLiquidity.toString()).div(new Decimal(poolLiquidity.toString()).add(new Decimal(deltaLiquidity.toString()))))
            .div(posValidTVL);
    const aprCoe = posValidRate.eq(new Decimal(0)) ? new Decimal(0) : posValidRate.mul(new Decimal(36500 / 7)).div(posValidTVL);
    const posRewarder0APR = poolRewarders0
        .div(new Decimal(10 ** decimalsRewarder0))
        .mul(rewarder0Price)
        .mul(aprCoe);
    const posRewarder1APR = poolRewarders1
        .div(new Decimal(10 ** decimalsRewarder1))
        .mul(rewarder1Price)
        .mul(aprCoe);
    const posRewarder2APR = poolRewarders2
        .div(new Decimal(10 ** decimalsRewarder2))
        .mul(rewarder2Price)
        .mul(aprCoe);
    return {
        feeAPR,
        posRewarder0APR,
        posRewarder1APR,
        posRewarder2APR,
    };
}
export function estPositionAPRWithMultiMethod(lowerUserPrice, upperUserPrice, lowerHistPrice, upperHistPrice) {
    const retroLower = Math.max(lowerUserPrice, lowerHistPrice);
    const retroUpper = Math.min(upperUserPrice, upperHistPrice);
    const retroRange = retroUpper - retroLower;
    const userRange = upperUserPrice - lowerUserPrice;
    const histRange = upperHistPrice - lowerHistPrice;
    const userRangeD = new Decimal(userRange.toString());
    const histRangeD = new Decimal(histRange.toString());
    const retroRangeD = new Decimal(retroRange.toString());
    let m = new Decimal('0');
    if (retroRange < 0) {
        m = new Decimal('0');
    }
    else if (userRange === retroRange) {
        m = histRangeD.div(retroRangeD);
    }
    else if (histRange === retroRange) {
        m = retroRangeD.div(userRangeD);
    }
    else {
        m = retroRangeD.mul(retroRangeD).div(histRangeD).div(userRangeD);
    }
    return m;
}
