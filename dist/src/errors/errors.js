export var MathErrorCode;
(function (MathErrorCode) {
    MathErrorCode["IntegerDowncastOverflow"] = "IntegerDowncastOverflow";
    MathErrorCode["MulOverflow"] = "MultiplicationOverflow";
    MathErrorCode["MulDivOverflow"] = "MulDivOverflow";
    MathErrorCode["MulShiftRightOverflow"] = "MulShiftRightOverflow";
    MathErrorCode["MulShiftLeftOverflow"] = "MulShiftLeftOverflow";
    MathErrorCode["DivideByZero"] = "DivideByZero";
    MathErrorCode["UnsignedIntegerOverflow"] = "UnsignedIntegerOverflow";
    MathErrorCode["InvalidCoinAmount"] = "InvalidCoinAmount";
    MathErrorCode["InvalidLiquidityAmount"] = "InvalidLiquidityAmount";
    MathErrorCode["InvalidReserveAmount"] = "InvalidReserveAmount";
    MathErrorCode["InvalidSqrtPrice"] = "InvalidSqrtPrice";
    MathErrorCode["NotSupportedThisCoin"] = "NotSupportedThisCoin";
    MathErrorCode["InvalidTwoTickIndex"] = "InvalidTwoTickIndex";
})(MathErrorCode || (MathErrorCode = {}));
export var CoinErrorCode;
(function (CoinErrorCode) {
    CoinErrorCode["CoinAmountMaxExceeded"] = "CoinAmountMaxExceeded";
    CoinErrorCode["CoinAmountMinSubceeded"] = "CoinAmountMinSubceeded ";
    CoinErrorCode["SqrtPriceOutOfBounds"] = "SqrtPriceOutOfBounds";
})(CoinErrorCode || (CoinErrorCode = {}));
export var SwapErrorCode;
(function (SwapErrorCode) {
    SwapErrorCode["InvalidSqrtPriceLimitDirection"] = "InvalidSqrtPriceLimitDirection";
    SwapErrorCode["ZeroTradableAmount"] = "ZeroTradableAmount";
    SwapErrorCode["AmountOutBelowMinimum"] = "AmountOutBelowMinimum";
    SwapErrorCode["AmountInAboveMaximum"] = "AmountInAboveMaximum";
    SwapErrorCode["NextTickNotFound"] = "NextTickNoutFound";
    SwapErrorCode["TickArraySequenceInvalid"] = "TickArraySequenceInvalid";
    SwapErrorCode["TickArrayCrossingAboveMax"] = "TickArrayCrossingAboveMax";
    SwapErrorCode["TickArrayIndexNotInitialized"] = "TickArrayIndexNotInitialized";
    SwapErrorCode["ParamsLengthNotEqual"] = "ParamsLengthNotEqual";
})(SwapErrorCode || (SwapErrorCode = {}));
export var PositionErrorCode;
(function (PositionErrorCode) {
    PositionErrorCode["InvalidTickEvent"] = "InvalidTickEvent";
    PositionErrorCode["InvalidPositionObject"] = "InvalidPositionObject";
    PositionErrorCode["InvalidPositionRewardObject"] = "InvalidPositionRewardObject";
})(PositionErrorCode || (PositionErrorCode = {}));
export var PoolErrorCode;
(function (PoolErrorCode) {
    PoolErrorCode["InvalidCoinTypeSequence"] = "InvalidCoinTypeSequence";
    PoolErrorCode["InvalidTickIndex"] = "InvalidTickIndex";
    PoolErrorCode["InvalidPoolObject"] = "InvalidPoolObject";
    PoolErrorCode["InvalidTickObjectId"] = "InvalidTickObjectId";
    PoolErrorCode["InvalidTickObject"] = "InvalidTickObject";
    PoolErrorCode["InvalidTickFields"] = "InvalidTickFields";
    PoolErrorCode["PoolsNotFound"] = "PoolsNotFound";
})(PoolErrorCode || (PoolErrorCode = {}));
export var PartnerErrorCode;
(function (PartnerErrorCode) {
    PartnerErrorCode["NotFoundPartnerObject"] = "NotFoundPartnerObject";
    PartnerErrorCode["InvalidParnterRefFeeFields"] = "InvalidParnterRefFeeFields";
})(PartnerErrorCode || (PartnerErrorCode = {}));
export var ConfigErrorCode;
(function (ConfigErrorCode) {
    ConfigErrorCode["InvalidConfig"] = "InvalidConfig";
    ConfigErrorCode["InvalidConfigHandle"] = "InvalidConfigHandle";
    ConfigErrorCode["InvalidSimulateAccount"] = "InvalidSimulateAccount";
})(ConfigErrorCode || (ConfigErrorCode = {}));
export var UtilsErrorCode;
(function (UtilsErrorCode) {
    UtilsErrorCode["InvalidSendAddress"] = "InvalidSendAddress";
    UtilsErrorCode["InvalidRecipientAddress"] = "InvalidRecipientAddress";
    UtilsErrorCode["InvalidRecipientAndAmountLength"] = "InvalidRecipientAndAmountLength";
    UtilsErrorCode["InsufficientBalance"] = "InsufficientBalance";
    UtilsErrorCode["InvalidTarget"] = "InvalidTarget";
    UtilsErrorCode["InvalidTransactionBuilder"] = "InvalidTransactionBuilder";
})(UtilsErrorCode || (UtilsErrorCode = {}));
export var RouterErrorCode;
(function (RouterErrorCode) {
    RouterErrorCode["InvalidCoin"] = "InvalidCoin";
    RouterErrorCode["NotFoundPath"] = "NotFoundPath";
    RouterErrorCode["NoDowngradeNeedParams"] = "NoDowngradeNeedParams";
    RouterErrorCode["InvalidSwapCountUrl"] = "InvalidSwapCountUrl";
    RouterErrorCode["InvalidTransactionBuilder"] = "InvalidTransactionBuilder";
    RouterErrorCode["InvalidServerResponse"] = "InvalidServerResponse";
})(RouterErrorCode || (RouterErrorCode = {}));
export var TypesErrorCode;
(function (TypesErrorCode) {
    TypesErrorCode["InvalidType"] = "InvalidType";
})(TypesErrorCode || (TypesErrorCode = {}));
export class ClmmpoolsError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.message = message;
        this.errorCode = errorCode;
    }
    static isClmmpoolsErrorCode(e, code) {
        return e instanceof ClmmpoolsError && e.errorCode === code;
    }
}
