import BN from 'bn.js';
import Decimal from 'decimal.js';
import { Transaction } from '@mysten/sui/transactions';
import { CoinAssist } from '../math/CoinAssist';
import { ClmmIntegrateRouterWithPartnerModule, ClmmIntegratePoolV2Module, ClmmIntegrateRouterModule, ClmmIntegrateUtilsModule, CLOCK_ADDRESS, } from '../types/sui';
import { adjustForSlippage, asUintN, ClmmPoolUtil, d, DeepbookUtils, getPackagerConfigs, normalizeCoinType, SwapUtils, ZERO, } from '../index';
import { ClmmpoolsError, UtilsErrorCode } from '../errors/errors';
/**
 * Adjust coinpair is sui
 * @param {CoinPairType} coinPair
 * @returns
 */
export function findAdjustCoin(coinPair) {
    const isAdjustCoinA = CoinAssist.isSuiCoin(coinPair.coinTypeA);
    const isAdjustCoinB = CoinAssist.isSuiCoin(coinPair.coinTypeB);
    return { isAdjustCoinA, isAdjustCoinB };
}
/**
 *
 * @param {number} slippageAmount
 * @param slippage
 * @returns
 */
function reverSlippageAmount(slippageAmount, slippage) {
    return Decimal.ceil(d(slippageAmount).div(1 + slippage)).toString();
}
export async function printTransaction(tx, isPrint = true) {
    console.log(`inputs`, tx.blockData.inputs);
    tx.blockData.transactions.forEach((item, index) => {
        if (isPrint) {
            console.log(`transaction ${index}: `, item);
        }
    });
}
export class TransactionUtil {
    static createCollectRewarderAndFeeParams(sdk, tx, params, allCoinAsset, allCoinAssetA, allCoinAssetB) {
        if (allCoinAssetA === undefined) {
            allCoinAssetA = [...allCoinAsset];
        }
        if (allCoinAssetB === undefined) {
            allCoinAssetB = [...allCoinAsset];
        }
        const coinTypeA = normalizeCoinType(params.coinTypeA);
        const coinTypeB = normalizeCoinType(params.coinTypeB);
        if (params.collect_fee) {
            const primaryCoinAInput = TransactionUtil.buildCoinForAmount(tx, allCoinAssetA, BigInt(0), coinTypeA, false);
            allCoinAssetA = primaryCoinAInput.remainCoins;
            const primaryCoinBInput = TransactionUtil.buildCoinForAmount(tx, allCoinAssetB, BigInt(0), coinTypeB, false);
            allCoinAssetB = primaryCoinBInput.remainCoins;
            tx = sdk.Position.createCollectFeePaylod({
                pool_id: params.pool_id,
                pos_id: params.pos_id,
                coinTypeA: params.coinTypeA,
                coinTypeB: params.coinTypeB,
            }, tx, primaryCoinAInput.targetCoin, primaryCoinBInput.targetCoin);
        }
        const primaryCoinInputs = [];
        params.rewarder_coin_types.forEach((type) => {
            switch (normalizeCoinType(type)) {
                case coinTypeA:
                    primaryCoinInputs.push(TransactionUtil.buildCoinForAmount(tx, allCoinAssetA, BigInt(0), type, false).targetCoin);
                    break;
                case coinTypeB:
                    primaryCoinInputs.push(TransactionUtil.buildCoinForAmount(tx, allCoinAssetB, BigInt(0), type, false).targetCoin);
                    break;
                default:
                    primaryCoinInputs.push(TransactionUtil.buildCoinForAmount(tx, allCoinAsset, BigInt(0), type, false).targetCoin);
                    break;
            }
        });
        tx = sdk.Rewarder.createCollectRewarderPaylod(params, tx, primaryCoinInputs);
        return tx;
    }
    /**
     * adjust transaction for gas
     * @param sdk
     * @param amount
     * @param tx
     * @returns
     */
    static async adjustTransactionForGas(sdk, allCoins, amount, tx) {
        tx.setSender(sdk.senderAddress);
        // amount coins
        const amountCoins = CoinAssist.selectCoinAssetGreaterThanOrEqual(allCoins, amount).selectedCoins;
        if (amountCoins.length === 0) {
            throw new ClmmpoolsError(`Insufficient balance`, UtilsErrorCode.InsufficientBalance);
        }
        const totalAmount = CoinAssist.calculateTotalBalance(allCoins);
        // If the remaining coin balance is greater than 1000000000, no gas fee correction will be done
        if (totalAmount - amount > 1000000000) {
            return { fixAmount: amount };
        }
        // payload Estimated gas consumption
        const estimateGas = await sdk.fullClient.calculationTxGas(tx);
        // Find estimateGas objectIds
        const gasCoins = CoinAssist.selectCoinAssetGreaterThanOrEqual(allCoins, BigInt(estimateGas), amountCoins.map((item) => item.coinObjectId)).selectedCoins;
        // There is not enough gas and the amount needs to be adjusted
        if (gasCoins.length === 0) {
            // Readjust the amount , Reserve 500 gas for the spit
            const newGas = BigInt(estimateGas) + BigInt(500);
            if (totalAmount - amount < newGas) {
                amount -= newGas;
                if (amount < 0) {
                    throw new ClmmpoolsError(`gas Insufficient balance`, UtilsErrorCode.InsufficientBalance);
                }
                const newTx = new Transaction();
                return { fixAmount: amount, newTx };
            }
        }
        return { fixAmount: amount };
    }
    // -----------------------------------------liquidity-----------------------------------------------//
    /**
     * build add liquidity transaction
     * @param params
     * @param slippage
     * @param curSqrtPrice
     * @returns
     */
    static async buildAddLiquidityFixTokenForGas(sdk, allCoins, params, gasEstimateArg, tx, inputCoinA, inputCoinB) {
        tx = await TransactionUtil.buildAddLiquidityFixToken(sdk, allCoins, params, tx, inputCoinA, inputCoinB);
        const { isAdjustCoinA } = findAdjustCoin(params);
        const suiAmount = isAdjustCoinA ? params.amount_a : params.amount_b;
        const newResult = await TransactionUtil.adjustTransactionForGas(sdk, CoinAssist.getCoinAssets(isAdjustCoinA ? params.coinTypeA : params.coinTypeB, allCoins), BigInt(suiAmount), tx);
        const { fixAmount } = newResult;
        const { newTx } = newResult;
        if (newTx != null) {
            let primaryCoinAInputs;
            let primaryCoinBInputs;
            if (isAdjustCoinA) {
                params.amount_a = Number(fixAmount);
                primaryCoinAInputs = TransactionUtil.buildAddLiquidityFixTokenCoinInput(newTx, !params.fix_amount_a, fixAmount.toString(), params.slippage, params.coinTypeA, allCoins, false);
                primaryCoinBInputs = TransactionUtil.buildAddLiquidityFixTokenCoinInput(newTx, params.fix_amount_a, params.amount_b, params.slippage, params.coinTypeB, allCoins, false);
            }
            else {
                params.amount_b = Number(fixAmount);
                primaryCoinAInputs = TransactionUtil.buildAddLiquidityFixTokenCoinInput(newTx, !params.fix_amount_a, params.amount_a, params.slippage, params.coinTypeA, allCoins, false);
                primaryCoinBInputs = TransactionUtil.buildAddLiquidityFixTokenCoinInput(newTx, params.fix_amount_a, fixAmount.toString(), params.slippage, params.coinTypeB, allCoins, false);
                params = TransactionUtil.fixAddLiquidityFixTokenParams(params, gasEstimateArg.slippage, gasEstimateArg.curSqrtPrice);
                tx = await TransactionUtil.buildAddLiquidityFixTokenArgs(newTx, sdk, allCoins, params, primaryCoinAInputs, primaryCoinBInputs);
                return tx;
            }
        }
        return tx;
    }
    /**
     * build add liquidity transaction
     * @param params
     * @param packageId
     * @returns
     */
    static async buildAddLiquidityFixToken(sdk, allCoinAsset, params, tx, inputCoinA, inputCoinB) {
        if (sdk.senderAddress.length === 0) {
            throw Error('this config sdk senderAddress is empty');
        }
        tx = tx || new Transaction();
        let primaryCoinAInputs;
        let primaryCoinBInputs;
        if (inputCoinA == null || inputCoinB == null) {
            primaryCoinAInputs = TransactionUtil.buildAddLiquidityFixTokenCoinInput(tx, !params.fix_amount_a, params.amount_a, params.slippage, params.coinTypeA, allCoinAsset, false);
            primaryCoinBInputs = TransactionUtil.buildAddLiquidityFixTokenCoinInput(tx, params.fix_amount_a, params.amount_b, params.slippage, params.coinTypeB, allCoinAsset, false);
        }
        else {
            primaryCoinAInputs = {
                targetCoin: inputCoinA,
                remainCoins: [],
                isMintZeroCoin: false,
                tragetCoinAmount: '0',
            };
            primaryCoinBInputs = {
                targetCoin: inputCoinB,
                remainCoins: [],
                isMintZeroCoin: false,
                tragetCoinAmount: '0',
            };
        }
        tx = TransactionUtil.buildAddLiquidityFixTokenArgs(tx, sdk, allCoinAsset, params, primaryCoinAInputs, primaryCoinBInputs);
        return tx;
    }
    static buildAddLiquidityFixTokenCoinInput(tx, need_interval_amount, amount, slippage, coinType, allCoinAsset, buildVector = true) {
        return need_interval_amount
            ? TransactionUtil.buildCoinForAmountInterval(tx, allCoinAsset, { amountSecond: BigInt(reverSlippageAmount(amount, slippage)), amountFirst: BigInt(amount) }, coinType, buildVector)
            : TransactionUtil.buildCoinForAmount(tx, allCoinAsset, BigInt(amount), coinType, buildVector);
    }
    /**
     * fix add liquidity fix token for coin amount
     * @param params
     * @param slippage
     * @param curSqrtPrice
     * @returns
     */
    static fixAddLiquidityFixTokenParams(params, slippage, curSqrtPrice) {
        const coinAmount = params.fix_amount_a ? params.amount_a : params.amount_b;
        const liquidityInput = ClmmPoolUtil.estLiquidityAndcoinAmountFromOneAmounts(Number(params.tick_lower), Number(params.tick_upper), new BN(coinAmount), params.fix_amount_a, true, slippage, curSqrtPrice);
        params.amount_a = params.fix_amount_a ? params.amount_a : liquidityInput.tokenMaxA.toNumber();
        params.amount_b = params.fix_amount_a ? liquidityInput.tokenMaxB.toNumber() : params.amount_b;
        return params;
    }
    static buildAddLiquidityFixTokenArgs(tx, sdk, allCoinAsset, params, primaryCoinAInputs, primaryCoinBInputs) {
        const typeArguments = [params.coinTypeA, params.coinTypeB];
        const functionName = params.is_open ? 'open_position_with_liquidity_by_fix_coin' : 'add_liquidity_by_fix_coin';
        const { clmm_pool, integrate } = sdk.sdkOptions;
        if (!params.is_open) {
            tx = TransactionUtil.createCollectRewarderAndFeeParams(sdk, tx, params, allCoinAsset, primaryCoinAInputs.remainCoins, primaryCoinBInputs.remainCoins);
        }
        const clmmConfig = getPackagerConfigs(clmm_pool);
        const args = params.is_open
            ? [
                tx.object(clmmConfig.global_config_id),
                tx.object(params.pool_id),
                tx.pure.u32(Number(asUintN(BigInt(params.tick_lower)).toString())),
                tx.pure.u32(Number(asUintN(BigInt(params.tick_upper)).toString())),
                primaryCoinAInputs.targetCoin,
                primaryCoinBInputs.targetCoin,
                tx.pure.u64(params.amount_a),
                tx.pure.u64(params.amount_b),
                tx.pure.bool(params.fix_amount_a),
                tx.object(CLOCK_ADDRESS),
            ]
            : [
                tx.object(clmmConfig.global_config_id),
                tx.object(params.pool_id),
                tx.object(params.pos_id),
                primaryCoinAInputs.targetCoin,
                primaryCoinBInputs.targetCoin,
                tx.pure.u64(params.amount_a),
                tx.pure.u64(params.amount_b),
                tx.pure.bool(params.fix_amount_a),
                tx.object(CLOCK_ADDRESS),
            ];
        tx.moveCall({
            target: `${integrate.published_at}::${ClmmIntegratePoolV2Module}::${functionName}`,
            typeArguments,
            arguments: args,
        });
        return tx;
    }
    // -------------------------------------------swap--------------------------------------------------//
    /**
     * build add liquidity transaction
     * @param params
     * @param slippage
     * @param curSqrtPrice
     * @returns
     */
    static async buildSwapTransactionForGas(sdk, params, allCoinAsset, gasEstimateArg) {
        let tx = TransactionUtil.buildSwapTransaction(sdk, params, allCoinAsset);
        tx.setSender(sdk.senderAddress);
        const newResult = await TransactionUtil.adjustTransactionForGas(sdk, CoinAssist.getCoinAssets(params.a2b ? params.coinTypeA : params.coinTypeB, allCoinAsset), BigInt(params.by_amount_in ? params.amount : params.amount_limit), tx);
        const { fixAmount, newTx } = newResult;
        if (newTx !== undefined) {
            newTx.setSender(sdk.senderAddress);
            if (params.by_amount_in) {
                params.amount = fixAmount.toString();
            }
            else {
                params.amount_limit = fixAmount.toString();
            }
            params = await TransactionUtil.fixSwapParams(sdk, params, gasEstimateArg);
            const primaryCoinInputA = TransactionUtil.buildCoinForAmount(tx, allCoinAsset, params.a2b ? BigInt(params.by_amount_in ? params.amount : params.amount_limit) : BigInt(0), params.coinTypeA);
            const primaryCoinInputB = TransactionUtil.buildCoinForAmount(tx, allCoinAsset, params.a2b ? BigInt(0) : BigInt(params.by_amount_in ? params.amount : params.amount_limit), params.coinTypeB);
            tx = TransactionUtil.buildSwapTransactionArgs(newTx, params, sdk.sdkOptions, primaryCoinInputA, primaryCoinInputB);
        }
        return tx;
    }
    /**
     * build swap transaction
     * @param params
     * @param packageId
     * @returns
     */
    static buildSwapTransaction(sdk, params, allCoinAsset) {
        let tx = new Transaction();
        tx.setSender(sdk.senderAddress);
        const primaryCoinInputA = TransactionUtil.buildCoinForAmount(tx, allCoinAsset, params.a2b ? BigInt(params.by_amount_in ? params.amount : params.amount_limit) : BigInt(0), params.coinTypeA, false);
        const primaryCoinInputB = TransactionUtil.buildCoinForAmount(tx, allCoinAsset, params.a2b ? BigInt(0) : BigInt(params.by_amount_in ? params.amount : params.amount_limit), params.coinTypeB, false);
        tx = TransactionUtil.buildSwapTransactionArgs(tx, params, sdk.sdkOptions, primaryCoinInputA, primaryCoinInputB);
        return tx;
    }
    /**
     * build swap transaction
     * @param params
     * @param packageId
     * @returns
     */
    static buildSwapTransactionArgs(tx, params, sdkOptions, primaryCoinInputA, primaryCoinInputB) {
        const { clmm_pool, integrate } = sdkOptions;
        const sqrtPriceLimit = SwapUtils.getDefaultSqrtPriceLimit(params.a2b);
        const typeArguments = [params.coinTypeA, params.coinTypeB];
        const { global_config_id } = getPackagerConfigs(clmm_pool);
        if (global_config_id === undefined) {
            throw Error('clmm.config.global_config_id is undefined');
        }
        const hasSwapPartner = params.swap_partner !== undefined;
        const functionName = hasSwapPartner
            ? params.a2b
                ? 'swap_a2b_with_partner'
                : 'swap_b2a_with_partner'
            : params.a2b
                ? 'swap_a2b'
                : 'swap_b2a';
        const args = hasSwapPartner
            ? [
                tx.object(global_config_id),
                tx.object(params.pool_id),
                tx.object(params.swap_partner),
                primaryCoinInputA.targetCoin,
                primaryCoinInputB.targetCoin,
                tx.pure.bool(params.by_amount_in),
                tx.pure.u64(params.amount),
                tx.pure.u64(params.amount_limit),
                tx.pure.u128(sqrtPriceLimit.toString()),
                tx.object(CLOCK_ADDRESS),
            ]
            : [
                tx.object(global_config_id),
                tx.object(params.pool_id),
                primaryCoinInputA.targetCoin,
                primaryCoinInputB.targetCoin,
                tx.pure.bool(params.by_amount_in),
                tx.pure.u64(params.amount),
                tx.pure.u64(params.amount_limit),
                tx.pure.u128(sqrtPriceLimit.toString()),
                tx.object(CLOCK_ADDRESS),
            ];
        tx.moveCall({
            target: `${integrate.published_at}::${ClmmIntegratePoolV2Module}::${functionName}`,
            typeArguments,
            arguments: args,
        });
        return tx;
    }
    // -------------------------------------swap-with-out-transfer-coin-----------------------------------------//
    /**
     * build add liquidity transaction with out transfer coins
     * @param params
     * @param slippage
     * @param curSqrtPrice
     * @returns
     */
    static async buildSwapTransactionWithoutTransferCoinsForGas(sdk, params, allCoinAsset, gasEstimateArg) {
        let { tx, coinABs } = TransactionUtil.buildSwapTransactionWithoutTransferCoins(sdk, params, allCoinAsset);
        tx.setSender(sdk.senderAddress);
        const newResult = await TransactionUtil.adjustTransactionForGas(sdk, CoinAssist.getCoinAssets(params.a2b ? params.coinTypeA : params.coinTypeB, allCoinAsset), BigInt(params.by_amount_in ? params.amount : params.amount_limit), tx);
        const { fixAmount, newTx } = newResult;
        if (newTx !== undefined) {
            newTx.setSender(sdk.senderAddress);
            if (params.by_amount_in) {
                params.amount = fixAmount.toString();
            }
            else {
                params.amount_limit = fixAmount.toString();
            }
            params = await TransactionUtil.fixSwapParams(sdk, params, gasEstimateArg);
            const primaryCoinInputA = TransactionUtil.buildCoinForAmount(tx, allCoinAsset, params.a2b ? BigInt(params.by_amount_in ? params.amount : params.amount_limit) : BigInt(0), params.coinTypeA, false, true);
            const primaryCoinInputB = TransactionUtil.buildCoinForAmount(tx, allCoinAsset, params.a2b ? BigInt(0) : BigInt(params.by_amount_in ? params.amount : params.amount_limit), params.coinTypeB, false, true);
            const res = TransactionUtil.buildSwapTransactionWithoutTransferCoinArgs(sdk, newTx, params, sdk.sdkOptions, primaryCoinInputA, primaryCoinInputB);
            tx = res.tx;
            coinABs = res.txRes;
        }
        return { tx, coinABs };
    }
    /**
     * build swap transaction and return swaped coin
     * @param params
     * @param packageId
     * @returns
     */
    static buildSwapTransactionWithoutTransferCoins(sdk, params, allCoinAsset) {
        const tx = new Transaction();
        tx.setSender(sdk.senderAddress);
        // Fix amount must set true, to support amount limit.
        const primaryCoinInputA = TransactionUtil.buildCoinForAmount(tx, allCoinAsset, params.a2b ? BigInt(params.by_amount_in ? params.amount : params.amount_limit) : BigInt(0), params.coinTypeA, false, true);
        const primaryCoinInputB = TransactionUtil.buildCoinForAmount(tx, allCoinAsset, params.a2b ? BigInt(0) : BigInt(params.by_amount_in ? params.amount : params.amount_limit), params.coinTypeB, false, true);
        const res = TransactionUtil.buildSwapTransactionWithoutTransferCoinArgs(sdk, tx, params, sdk.sdkOptions, primaryCoinInputA, primaryCoinInputB);
        return { tx: res.tx, coinABs: res.txRes };
    }
    /**
     * build swap transaction
     * @param params
     * @param packageId
     * @returns
     */
    static buildSwapTransactionWithoutTransferCoinArgs(sdk, tx, params, sdkOptions, primaryCoinInputA, primaryCoinInputB) {
        const { clmm_pool, integrate } = sdkOptions;
        const sqrtPriceLimit = SwapUtils.getDefaultSqrtPriceLimit(params.a2b);
        const { global_config_id } = getPackagerConfigs(clmm_pool);
        if (global_config_id === undefined) {
            throw Error('clmm.config.global_config_id is undefined');
        }
        const hasSwapPartner = params.swap_partner !== undefined;
        const functionName = hasSwapPartner ? 'swap_with_partner' : 'swap';
        const moduleName = hasSwapPartner ? ClmmIntegrateRouterWithPartnerModule : ClmmIntegrateRouterModule;
        const args = hasSwapPartner
            ? [
                tx.object(global_config_id),
                tx.object(params.pool_id),
                tx.object(params.swap_partner),
                primaryCoinInputA.targetCoin,
                primaryCoinInputB.targetCoin,
                tx.pure.bool(params.a2b),
                tx.pure.bool(params.by_amount_in),
                tx.pure.u64(params.amount),
                tx.pure.u128(sqrtPriceLimit.toString()),
                tx.pure.bool(false), // use coin value always set false.
                tx.object(CLOCK_ADDRESS),
            ]
            : [
                tx.object(global_config_id),
                tx.object(params.pool_id),
                primaryCoinInputA.targetCoin,
                primaryCoinInputB.targetCoin,
                tx.pure.bool(params.a2b),
                tx.pure.bool(params.by_amount_in),
                tx.pure.u64(params.amount),
                tx.pure.u128(sqrtPriceLimit.toString()),
                tx.pure.bool(false), // use coin value always set false.
                tx.object(CLOCK_ADDRESS),
            ];
        const typeArguments = [params.coinTypeA, params.coinTypeB];
        const coinABs = tx.moveCall({
            target: `${integrate.published_at}::${moduleName}::${functionName}`,
            typeArguments,
            arguments: args,
        });
        if (params.by_amount_in) {
            const toCoinType = params.a2b ? params.coinTypeB : params.coinTypeA;
            const toCoin = params.a2b ? coinABs[1] : coinABs[0];
            const totalAmount = Number(params.amount_limit);
            this.checkCoinThreshold(sdk, params.by_amount_in, tx, toCoin, totalAmount, toCoinType);
        }
        return { tx, txRes: coinABs };
    }
    static async fixSwapParams(sdk, params, gasEstimateArg) {
        const { currentPool } = gasEstimateArg;
        try {
            const res = await sdk.Swap.preswap({
                decimalsA: gasEstimateArg.decimalsA,
                decimalsB: gasEstimateArg.decimalsB,
                a2b: params.a2b,
                byAmountIn: params.by_amount_in,
                amount: params.amount,
                pool: currentPool,
                currentSqrtPrice: currentPool.current_sqrt_price,
                coinTypeA: currentPool.coinTypeA,
                coinTypeB: currentPool.coinTypeB,
            });
            const toAmount = gasEstimateArg.byAmountIn ? res.estimatedAmountOut : res.estimatedAmountIn;
            const amountLimit = adjustForSlippage(toAmount, gasEstimateArg.slippage, !gasEstimateArg.byAmountIn);
            params.amount_limit = amountLimit.toString();
        }
        catch (error) {
            console.log('fixSwapParams', error);
        }
        return params;
    }
    static async syncBuildCoinInputForAmount(sdk, tx, amount, coinType, buildVector = true) {
        if (sdk.senderAddress.length === 0) {
            throw Error('this config sdk senderAddress is empty');
        }
        const allCoins = await sdk.getOwnerCoinAssets(sdk.senderAddress, coinType);
        const primaryCoinInput = TransactionUtil.buildCoinForAmount(tx, allCoins, amount, coinType, buildVector).targetCoin;
        return primaryCoinInput;
    }
    static buildCoinForAmount(tx, allCoins, amount, coinType, buildVector = true, fixAmount = false) {
        const coinAssets = CoinAssist.getCoinAssets(coinType, allCoins);
        if (amount === BigInt(0) && coinAssets.length === 0) {
            return TransactionUtil.buildZeroValueCoin(allCoins, tx, coinType, buildVector);
        }
        const amountTotal = CoinAssist.calculateTotalBalance(coinAssets);
        if (amountTotal < amount) {
            throw new ClmmpoolsError(`The amount(${amountTotal}) is Insufficient balance for ${coinType} , expect ${amount} `, UtilsErrorCode.InsufficientBalance);
        }
        return TransactionUtil.buildCoin(tx, allCoins, coinAssets, amount, coinType, buildVector, fixAmount);
    }
    static buildCoin(tx, allCoins, coinAssets, amount, coinType, buildVector = true, fixAmount = false) {
        if (CoinAssist.isSuiCoin(coinType)) {
            if (buildVector) {
                const amountCoin = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
                return {
                    targetCoin: tx.makeMoveVec({ elements: [amountCoin] }),
                    remainCoins: allCoins,
                    tragetCoinAmount: amount.toString(),
                    isMintZeroCoin: false,
                    originalSplitedCoin: tx.gas,
                };
            }
            if (amount === 0n && coinAssets.length > 1) {
                const selectedCoinsResult = CoinAssist.selectCoinObjectIdGreaterThanOrEqual(coinAssets, amount);
                return {
                    targetCoin: tx.object(selectedCoinsResult.objectArray[0]),
                    remainCoins: selectedCoinsResult.remainCoins,
                    tragetCoinAmount: selectedCoinsResult.amountArray[0],
                    isMintZeroCoin: false,
                };
            }
            const selectedCoinsResult = CoinAssist.selectCoinObjectIdGreaterThanOrEqual(coinAssets, amount);
            const amountCoin = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
            return {
                targetCoin: amountCoin,
                remainCoins: selectedCoinsResult.remainCoins,
                tragetCoinAmount: amount.toString(),
                isMintZeroCoin: false,
                originalSplitedCoin: tx.gas,
            };
        }
        const selectedCoinsResult = CoinAssist.selectCoinObjectIdGreaterThanOrEqual(coinAssets, amount);
        const totalSelectedCoinAmount = selectedCoinsResult.amountArray.reduce((a, b) => Number(a) + Number(b), 0).toString();
        const coinObjectIds = selectedCoinsResult.objectArray;
        if (buildVector) {
            return {
                targetCoin: tx.makeMoveVec({ elements: coinObjectIds.map((id) => tx.object(id)) }),
                remainCoins: selectedCoinsResult.remainCoins,
                tragetCoinAmount: selectedCoinsResult.amountArray.reduce((a, b) => Number(a) + Number(b), 0).toString(),
                isMintZeroCoin: false,
            };
        }
        const [primaryCoinA, ...mergeCoinAs] = coinObjectIds;
        const primaryCoinAObject = tx.object(primaryCoinA);
        let targetCoin = primaryCoinAObject;
        const tragetCoinAmount = selectedCoinsResult.amountArray.reduce((a, b) => Number(a) + Number(b), 0).toString();
        let originalSplitedCoin;
        if (mergeCoinAs.length > 0) {
            tx.mergeCoins(primaryCoinAObject, mergeCoinAs.map((coin) => tx.object(coin)));
        }
        if (fixAmount && Number(totalSelectedCoinAmount) > Number(amount)) {
            targetCoin = tx.splitCoins(primaryCoinAObject, [tx.pure.u64(amount)]);
            originalSplitedCoin = primaryCoinAObject;
        }
        return {
            targetCoin,
            remainCoins: selectedCoinsResult.remainCoins,
            originalSplitedCoin,
            tragetCoinAmount,
            isMintZeroCoin: false,
        };
    }
    static buildZeroValueCoin(allCoins, tx, coinType, buildVector = true) {
        const zeroCoin = TransactionUtil.callMintZeroValueCoin(tx, coinType);
        let targetCoin;
        if (buildVector) {
            targetCoin = tx.makeMoveVec({ elements: [zeroCoin] });
        }
        else {
            targetCoin = zeroCoin;
        }
        return {
            targetCoin,
            remainCoins: allCoins,
            isMintZeroCoin: true,
            tragetCoinAmount: '0',
        };
    }
    static buildCoinForAmountInterval(tx, allCoins, amounts, coinType, buildVector = true) {
        const coinAssets = CoinAssist.getCoinAssets(coinType, allCoins);
        if (amounts.amountFirst === BigInt(0)) {
            if (coinAssets.length > 0) {
                return TransactionUtil.buildCoin(tx, [...allCoins], [...coinAssets], amounts.amountFirst, coinType, buildVector);
            }
            return TransactionUtil.buildZeroValueCoin(allCoins, tx, coinType, buildVector);
        }
        const amountTotal = CoinAssist.calculateTotalBalance(coinAssets);
        if (amountTotal >= amounts.amountFirst) {
            return TransactionUtil.buildCoin(tx, [...allCoins], [...coinAssets], amounts.amountFirst, coinType, buildVector);
        }
        if (amountTotal < amounts.amountSecond) {
            throw new ClmmpoolsError(`The amount(${amountTotal}) is Insufficient balance for ${coinType} , expect ${amounts.amountSecond} `, UtilsErrorCode.InsufficientBalance);
        }
        return TransactionUtil.buildCoin(tx, [...allCoins], [...coinAssets], amounts.amountSecond, coinType, buildVector);
    }
    // ------------------------------------------router-v1-------------------------------------------------//
    static async buildRouterSwapTransaction(sdk, params, byAmountIn, allCoinAsset, 
    // If recipient not set, transfer objects move call will use ctx sender.
    recipient) {
        let tx = new Transaction();
        // When the router's split path length exceeds 1, router cannot support partner.
        // now router v1 just return one best path.
        // when use router v2, must set allow split to false.
        if (params.paths.length > 1) {
            params.partner = '';
        }
        tx = await this.buildRouterBasePathTx(sdk, params, byAmountIn, allCoinAsset, tx, recipient);
        return tx;
    }
    static async buildRouterBasePathTx(sdk, params, byAmountIn, allCoinAsset, tx, 
    // If recipient not set, transfer objects move call will use ctx sender.
    recipient) {
        const validPaths = params.paths.filter((path) => path && path.poolAddress);
        const inputAmount = Number(validPaths.reduce((total, path) => total.add(path.amountIn), ZERO).toString());
        const outputAmount = Number(validPaths.reduce((total, path) => total.add(path.amountOut), ZERO).toString());
        const totalAmountLimit = byAmountIn
            ? Math.round(Number(outputAmount.toString()) * (1 - params.priceSlippagePoint))
            : Math.round(Number(inputAmount.toString()) * (1 + params.priceSlippagePoint));
        const fromCoinType = params.paths[0].coinType[0];
        const toCoinType = params.paths[0].coinType[params.paths[0].coinType.length - 1];
        // When fix amount out, the amount of fromCoin must set to amountLimit to support limit amount slippage point.
        const fromCoinBuildResult = TransactionUtil.buildCoinForAmount(tx, allCoinAsset, byAmountIn ? BigInt(inputAmount) : BigInt(totalAmountLimit), fromCoinType, false, true);
        const isSplited = fromCoinBuildResult.originalSplitedCoin !== undefined;
        const toCoinBuildResult = TransactionUtil.buildCoinForAmount(tx, allCoinAsset, 0n, toCoinType, false);
        const buildRouterBasePathReturnCoin = await this.buildRouterBasePathReturnCoins(sdk, params, byAmountIn, fromCoinBuildResult, toCoinBuildResult, tx);
        const transferedCoins = [];
        const { toCoin, fromCoin } = buildRouterBasePathReturnCoin;
        tx = buildRouterBasePathReturnCoin.tx;
        if (toCoinBuildResult.isMintZeroCoin) {
            transferedCoins.push({
                coinType: toCoinType,
                coin: toCoin,
            });
        }
        else if (toCoinBuildResult.originalSplitedCoin !== undefined) {
            tx.mergeCoins(toCoinBuildResult.originalSplitedCoin, [toCoin]);
        }
        else {
            tx.mergeCoins(toCoinBuildResult.targetCoin, [toCoin]);
        }
        if (isSplited) {
            const originalSplitedFromCoin = fromCoinBuildResult?.originalSplitedCoin;
            tx.mergeCoins(originalSplitedFromCoin, [fromCoin]);
        }
        else {
            transferedCoins.push({
                coinType: fromCoinType,
                coin: fromCoin,
            });
        }
        for (let i = 0; i < transferedCoins.length; i++) {
            this.buildTransferCoin(sdk, tx, transferedCoins[i].coin, transferedCoins[i].coinType, recipient);
        }
        return tx;
    }
    static async buildRouterBasePathReturnCoins(sdk, params, byAmountIn, fromCoinBuildRes, toCoinBuildRes, tx) {
        const { clmm_pool, integrate } = sdk.sdkOptions;
        const globalConfigID = getPackagerConfigs(clmm_pool).global_config_id;
        const validPaths = params.paths.filter((path) => path && path.poolAddress);
        const inputAmount = Number(validPaths.reduce((total, path) => total.add(path.amountIn), ZERO).toString());
        const outputAmount = Number(validPaths.reduce((total, path) => total.add(path.amountOut), ZERO).toString());
        const totalAmountLimit = byAmountIn
            ? Math.round(Number(outputAmount.toString()) * (1 - params.priceSlippagePoint))
            : Math.round(Number(inputAmount.toString()) * (1 + params.priceSlippagePoint));
        const fromCoinType = params.paths[0].coinType[0];
        const toCoinType = params.paths[0].coinType[params.paths[0].coinType.length - 1];
        let fromCoin = fromCoinBuildRes.targetCoin;
        let toCoin;
        if (toCoinBuildRes.isMintZeroCoin || toCoinBuildRes.originalSplitedCoin !== undefined) {
            toCoin = toCoinBuildRes.targetCoin;
        }
        else {
            toCoin = TransactionUtil.callMintZeroValueCoin(tx, toCoinType);
        }
        const noPartner = params.partner === '';
        const moduleName = noPartner ? ClmmIntegrateRouterModule : ClmmIntegrateRouterWithPartnerModule;
        for (const path of validPaths) {
            if (path.poolAddress.length === 1) {
                const a2b = path.a2b[0];
                const swapParams = {
                    amount: Number(path.amountIn.toString()),
                    amountLimit: totalAmountLimit,
                    poolCoinA: path.a2b[0] ? fromCoinType : toCoinType,
                    poolCoinB: path.a2b[0] ? toCoinType : fromCoinType,
                };
                const functionName = noPartner ? 'swap' : 'swap_with_partner';
                const poolCoinA = a2b ? fromCoin : toCoin;
                const poolCoinB = a2b ? toCoin : fromCoin;
                const amount = byAmountIn ? path.amountIn.toString() : path.amountOut.toString();
                const sqrtPriceLimit = SwapUtils.getDefaultSqrtPriceLimit(a2b).toString();
                const args = noPartner
                    ? [
                        tx.object(globalConfigID),
                        tx.object(path.poolAddress[0]),
                        poolCoinA,
                        poolCoinB,
                        tx.pure.bool(a2b),
                        tx.pure.bool(byAmountIn),
                        tx.pure.u64(amount),
                        tx.pure.u128(sqrtPriceLimit),
                        tx.pure.bool(false),
                        tx.object(CLOCK_ADDRESS),
                    ]
                    : [
                        tx.object(globalConfigID),
                        tx.object(path.poolAddress[0]),
                        tx.object(params.partner),
                        poolCoinA,
                        poolCoinB,
                        tx.pure.bool(a2b),
                        tx.pure.bool(byAmountIn),
                        tx.pure.u64(amount),
                        tx.pure.u128(sqrtPriceLimit),
                        tx.pure.bool(false),
                        tx.object(CLOCK_ADDRESS),
                    ];
                const typeArguments = [swapParams.poolCoinA, swapParams.poolCoinB];
                const coinABs = tx.moveCall({
                    target: `${sdk.sdkOptions.integrate.published_at}::${moduleName}::${functionName}`,
                    typeArguments,
                    arguments: args,
                });
                fromCoin = a2b ? coinABs[0] : coinABs[1];
                toCoin = a2b ? coinABs[1] : coinABs[0];
            }
            else {
                const amount0 = byAmountIn ? path.amountIn : path.rawAmountLimit[0];
                const amount1 = byAmountIn ? 0 : path.amountOut;
                let functionName = '';
                if (path.a2b[0]) {
                    if (path.a2b[1]) {
                        functionName = 'swap_ab_bc';
                    }
                    else {
                        functionName = 'swap_ab_cb';
                    }
                }
                else if (path.a2b[1]) {
                    functionName = 'swap_ba_bc';
                }
                else {
                    functionName = 'swap_ba_cb';
                }
                if (!noPartner) {
                    functionName = `${functionName}_with_partner`;
                }
                const sqrtPriceLimit0 = SwapUtils.getDefaultSqrtPriceLimit(path.a2b[0]);
                const sqrtPriceLimit1 = SwapUtils.getDefaultSqrtPriceLimit(path.a2b[1]);
                const args = noPartner
                    ? [
                        tx.object(globalConfigID),
                        tx.object(path.poolAddress[0]),
                        tx.object(path.poolAddress[1]),
                        fromCoin,
                        toCoin,
                        tx.pure.bool(byAmountIn),
                        tx.pure.u64(amount0.toString()),
                        tx.pure.u64(amount1.toString()),
                        tx.pure.u128(sqrtPriceLimit0.toString()),
                        tx.pure.u128(sqrtPriceLimit1.toString()),
                        tx.object(CLOCK_ADDRESS),
                    ]
                    : [
                        tx.object(globalConfigID),
                        tx.object(path.poolAddress[0]),
                        tx.object(path.poolAddress[1]),
                        tx.object(params.partner),
                        fromCoin,
                        toCoin,
                        tx.pure.bool(byAmountIn),
                        tx.pure.u64(amount0.toString()),
                        tx.pure.u64(amount1.toString()),
                        tx.pure.u128(sqrtPriceLimit0.toString()),
                        tx.pure.u128(sqrtPriceLimit1.toString()),
                        tx.object(CLOCK_ADDRESS),
                    ];
                const typeArguments = [path.coinType[0], path.coinType[1], path.coinType[2]];
                const fromToCoins = tx.moveCall({
                    target: `${integrate.published_at}::${moduleName}::${functionName}`,
                    typeArguments,
                    arguments: args,
                });
                fromCoin = fromToCoins[0];
                toCoin = fromToCoins[1];
            }
        }
        this.checkCoinThreshold(sdk, byAmountIn, tx, toCoin, totalAmountLimit, toCoinType);
        return { fromCoin, toCoin, tx };
    }
    // ------------------------------------------router-v2-------------------------------------------------//
    static async buildAggregatorSwapReturnCoins(sdk, param, fromCoinBuildRes, toCoinBuildRes, partner, priceSplitPoint, tx, 
    // If recipient not set, transfer objects move call will use sdk.senderAddress
    recipient) {
        if (recipient == null) {
            if (sdk.senderAddress.length === 0) {
                throw Error('recipient and this config sdk senderAddress all not set');
            }
            recipient = sdk.senderAddress;
        }
        // When the router's split path length exceeds 1, router cannot support partner.
        // now router v1 just return one best path.
        // when use router v2, must set allow split to false.
        if (param.splitPaths.length > 1) {
            partner = '';
        }
        let fromCoin;
        let toCoin;
        const hasExternalPool = param.splitPaths.some((splitPath) => splitPath.basePaths.some((basePath) => basePath.label === 'Deepbook'));
        if ((!param.byAmountIn || param.splitPaths.length === 1) && !hasExternalPool) {
            const onePaths = [];
            for (const splitPath of param.splitPaths) {
                const a2b = [];
                const poolAddress = [];
                const rawAmountLimit = [];
                const coinType = [];
                for (let i = 0; i < splitPath.basePaths.length; i += 1) {
                    const basePath = splitPath.basePaths[i];
                    a2b.push(basePath.direction);
                    poolAddress.push(basePath.poolAddress);
                    rawAmountLimit.push(new BN(basePath.inputAmount.toString()));
                    if (i === 0) {
                        coinType.push(basePath.fromCoin, basePath.toCoin);
                    }
                    else {
                        coinType.push(basePath.toCoin);
                    }
                }
                const onePath = {
                    amountIn: new BN(splitPath.inputAmount.toString()),
                    amountOut: new BN(splitPath.outputAmount.toString()),
                    poolAddress,
                    a2b,
                    rawAmountLimit,
                    isExceed: false,
                    coinType,
                };
                onePaths.push(onePath);
            }
            const params = {
                paths: onePaths,
                partner,
                priceSlippagePoint: priceSplitPoint,
            };
            const buildRouterBasePathReturnCoinRes = await this.buildRouterBasePathReturnCoins(sdk, params, param.byAmountIn, fromCoinBuildRes, toCoinBuildRes, tx);
            fromCoin = buildRouterBasePathReturnCoinRes.fromCoin;
            toCoin = buildRouterBasePathReturnCoinRes.toCoin;
            tx = buildRouterBasePathReturnCoinRes.tx;
        }
        else {
            const amountLimit = Math.round(param.outputAmount * (1 - priceSplitPoint));
            fromCoin = fromCoinBuildRes.targetCoin;
            if (toCoinBuildRes.isMintZeroCoin || toCoinBuildRes.originalSplitedCoin !== undefined) {
                toCoin = toCoinBuildRes.targetCoin;
            }
            else {
                toCoin = TransactionUtil.callMintZeroValueCoin(tx, param.toCoin);
            }
            let isCreateAccountCap = false;
            let accountCap;
            if (hasExternalPool) {
                const [cap, createAccountCapTX] = DeepbookUtils.createAccountCap(recipient, sdk.sdkOptions, tx);
                tx = createAccountCapTX;
                accountCap = cap;
                isCreateAccountCap = true;
            }
            for (let i = 0; i < param.splitPaths.length; i += 1) {
                const splitPath = param.splitPaths[i];
                let middleCoin;
                for (let i = 0; i < splitPath.basePaths.length; i += 1) {
                    const basePath = splitPath.basePaths[i];
                    if (basePath.label === 'Deepbook') {
                        if (i === 0) {
                            if (splitPath.basePaths.length === 1) {
                                const deepbookTxBuild = this.buildDeepbookBasePathTx(sdk, basePath, tx, accountCap, fromCoin, toCoin, false);
                                fromCoin = deepbookTxBuild.from;
                                toCoin = deepbookTxBuild.to;
                            }
                            else {
                                middleCoin = TransactionUtil.callMintZeroValueCoin(tx, basePath.toCoin);
                                const deepbookTxBuild = this.buildDeepbookBasePathTx(sdk, basePath, tx, accountCap, fromCoin, middleCoin, false);
                                fromCoin = deepbookTxBuild.from;
                                middleCoin = deepbookTxBuild.to;
                            }
                        }
                        else {
                            const deepbookTxBuild = this.buildDeepbookBasePathTx(sdk, basePath, tx, accountCap, middleCoin, toCoin, true);
                            middleCoin = deepbookTxBuild.from;
                            toCoin = deepbookTxBuild.to;
                        }
                    }
                    if (basePath.label === 'Cetus') {
                        if (i === 0) {
                            if (splitPath.basePaths.length === 1) {
                                const clmmTxBuild = this.buildClmmBasePathTx(sdk, basePath, tx, param.byAmountIn, fromCoin, toCoin, false, partner);
                                fromCoin = clmmTxBuild.from;
                                toCoin = clmmTxBuild.to;
                            }
                            else {
                                middleCoin = TransactionUtil.callMintZeroValueCoin(tx, basePath.toCoin);
                                const clmmTxBuild = this.buildClmmBasePathTx(sdk, basePath, tx, param.byAmountIn, fromCoin, middleCoin, false, partner);
                                fromCoin = clmmTxBuild.from;
                                middleCoin = clmmTxBuild.to;
                            }
                        }
                        else {
                            const clmmTxBuild = this.buildClmmBasePathTx(sdk, basePath, tx, param.byAmountIn, middleCoin, toCoin, true, partner);
                            middleCoin = clmmTxBuild.from;
                            toCoin = clmmTxBuild.to;
                            tx.moveCall({
                                target: `${sdk.sdkOptions.integrate.published_at}::${ClmmIntegrateUtilsModule}::send_coin`,
                                typeArguments: [basePath.fromCoin],
                                arguments: [middleCoin, tx.pure.address(recipient)],
                            });
                        }
                    }
                }
            }
            this.checkCoinThreshold(sdk, param.byAmountIn, tx, toCoin, amountLimit, param.toCoin);
            if (isCreateAccountCap) {
                tx = DeepbookUtils.deleteAccountCapByObject(accountCap, sdk.sdkOptions, tx);
            }
        }
        return { fromCoin, toCoin, tx };
    }
    static async buildAggregatorSwapTransaction(sdk, param, allCoinAsset, partner, priceSlippagePoint, recipient) {
        let tx = new Transaction();
        const amountLimit = param.byAmountIn
            ? Math.round(param.outputAmount * (1 - priceSlippagePoint))
            : Math.round(param.inputAmount * (1 + priceSlippagePoint));
        const fromCoinBuildResult = TransactionUtil.buildCoinForAmount(tx, allCoinAsset, param.byAmountIn ? BigInt(param.inputAmount) : BigInt(amountLimit), param.fromCoin, false, true);
        const isSplited = fromCoinBuildResult.originalSplitedCoin != null;
        const toCoinBuildResult = TransactionUtil.buildCoinForAmount(tx, allCoinAsset, 0n, param.toCoin, false);
        const buildAggregatorSwapReturnCoinsRes = await this.buildAggregatorSwapReturnCoins(sdk, param, fromCoinBuildResult, toCoinBuildResult, partner, priceSlippagePoint, tx, recipient);
        const { fromCoin, toCoin } = buildAggregatorSwapReturnCoinsRes;
        tx = buildAggregatorSwapReturnCoinsRes.tx;
        const transferedCoins = [];
        if (toCoinBuildResult.isMintZeroCoin) {
            transferedCoins.push({
                coinType: param.toCoin,
                coin: toCoin,
            });
        }
        else if (toCoinBuildResult.originalSplitedCoin != null) {
            tx.mergeCoins(toCoinBuildResult.originalSplitedCoin, [toCoin]);
        }
        else {
            tx.mergeCoins(toCoinBuildResult.targetCoin, [toCoin]);
        }
        if (isSplited) {
            const originalSplitedFromCoin = fromCoinBuildResult.originalSplitedCoin;
            tx.mergeCoins(originalSplitedFromCoin, [fromCoin]);
        }
        else {
            transferedCoins.push({
                coinType: param.fromCoin,
                coin: fromCoin,
            });
        }
        for (let i = 0; i < transferedCoins.length; i++) {
            this.buildTransferCoin(sdk, tx, transferedCoins[i].coin, transferedCoins[i].coinType, recipient);
        }
        return tx;
    }
    static checkCoinThreshold(sdk, byAmountIn, tx, coin, amountLimit, coinType) {
        if (byAmountIn) {
            tx.moveCall({
                target: `${sdk.sdkOptions.integrate.published_at}::${ClmmIntegrateRouterModule}::check_coin_threshold`,
                typeArguments: [coinType],
                arguments: [coin, tx.pure.u64(amountLimit)],
            });
        }
    }
    static buildDeepbookBasePathTx(sdk, basePath, tx, accountCap, from, to, middleStep) {
        const base = basePath.direction ? from : to;
        const quote = basePath.direction ? to : from;
        const args = [
            tx.object(basePath.poolAddress),
            accountCap,
            tx.pure.u64(basePath.inputAmount),
            tx.pure.u64(0),
            tx.pure.bool(basePath.direction),
            base,
            quote,
            tx.pure.bool(middleStep),
            tx.object(CLOCK_ADDRESS),
        ];
        const typeArguments = basePath.direction ? [basePath.fromCoin, basePath.toCoin] : [basePath.toCoin, basePath.fromCoin];
        const coinAB = tx.moveCall({
            target: `${sdk.sdkOptions.deepbook_endpoint_v2.published_at}::endpoints_v2::swap`,
            typeArguments,
            arguments: args,
        });
        from = basePath.direction ? coinAB[0] : coinAB[1];
        to = basePath.direction ? coinAB[1] : coinAB[0];
        return {
            from,
            to,
            tx,
        };
    }
    static buildClmmBasePathTx(sdk, basePath, tx, byAmountIn, from, to, middleStep, partner) {
        const { clmm_pool, integrate } = sdk.sdkOptions;
        const globalConfigID = getPackagerConfigs(clmm_pool).global_config_id;
        let coinA = basePath.direction ? from : to;
        let coinB = basePath.direction ? to : from;
        const noPartner = partner === '';
        const moduleName = noPartner ? ClmmIntegrateRouterModule : ClmmIntegrateRouterWithPartnerModule;
        const functionName = noPartner ? 'swap' : 'swap_with_partner';
        const amount = byAmountIn ? basePath.inputAmount.toString() : basePath.outputAmount.toString();
        const sqrtPriceLimit = SwapUtils.getDefaultSqrtPriceLimit(basePath.direction);
        const args = noPartner
            ? [
                tx.object(globalConfigID),
                tx.object(basePath.poolAddress),
                coinA,
                coinB,
                tx.pure.bool(basePath.direction),
                tx.pure.bool(byAmountIn),
                tx.pure.u64(amount),
                tx.pure.u128(sqrtPriceLimit.toString()),
                tx.pure.bool(middleStep),
                tx.object(CLOCK_ADDRESS),
            ]
            : [
                tx.object(globalConfigID),
                tx.object(basePath.poolAddress),
                tx.object(partner),
                coinA,
                coinB,
                tx.pure.bool(basePath.direction),
                tx.pure.bool(byAmountIn),
                tx.pure.u64(amount),
                tx.pure.u128(sqrtPriceLimit.toString()),
                tx.pure.bool(middleStep),
                tx.object(CLOCK_ADDRESS),
            ];
        const typeArguments = basePath.direction ? [basePath.fromCoin, basePath.toCoin] : [basePath.toCoin, basePath.fromCoin];
        const coinAB = tx.moveCall({
            target: `${integrate.published_at}::${moduleName}::${functionName}`,
            typeArguments,
            arguments: args,
        });
        coinA = coinAB[0];
        coinB = coinAB[1];
        from = basePath.direction ? coinA : coinB;
        to = basePath.direction ? coinB : coinA;
        return {
            from,
            to,
            tx,
        };
    }
    static buildCoinTypePair(coinTypes, partitionQuantities) {
        const coinTypePair = [];
        if (coinTypes.length === 2) {
            const pair = [];
            pair.push(coinTypes[0], coinTypes[1]);
            coinTypePair.push(pair);
        }
        else {
            const directPair = [];
            directPair.push(coinTypes[0], coinTypes[coinTypes.length - 1]);
            coinTypePair.push(directPair);
            for (let i = 1; i < coinTypes.length - 1; i += 1) {
                if (partitionQuantities[i - 1] === 0) {
                    continue;
                }
                const pair = [];
                pair.push(coinTypes[0], coinTypes[i], coinTypes[coinTypes.length - 1]);
                coinTypePair.push(pair);
            }
        }
        return coinTypePair;
    }
    // ------------------------------------------utils-------------------------------------------------//
    static buildTransferCoinToSender(sdk, tx, coin, coinType) {
        tx.moveCall({
            target: `${sdk.sdkOptions.integrate.published_at}::${ClmmIntegrateUtilsModule}::transfer_coin_to_sender`,
            typeArguments: [coinType],
            arguments: [coin],
        });
    }
    // If recipient not set, transfer objects move call will use ctx sender
    static buildTransferCoin(sdk, tx, coin, coinType, recipient) {
        if (recipient != null) {
            tx.transferObjects([coin], tx.pure.address(recipient));
        }
        else {
            TransactionUtil.buildTransferCoinToSender(sdk, tx, coin, coinType);
        }
    }
}
TransactionUtil.callMintZeroValueCoin = (txb, coinType) => {
    return txb.moveCall({
        target: '0x2::coin::zero',
        typeArguments: [coinType],
    });
};
