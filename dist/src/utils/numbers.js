import Decimal from 'decimal.js';
export function d(value) {
    if (Decimal.isDecimal(value)) {
        return value;
    }
    return new Decimal(value === undefined ? 0 : value);
}
export function decimalsMultiplier(decimals) {
    return d(10).pow(d(decimals).abs());
}
