import { normalizeSuiObjectId } from '@mysten/sui/utils';
import { CoinAssist, GAS_TYPE_ARG, GAS_TYPE_ARG_LONG } from '../math/CoinAssist';
import { removeHexPrefix } from './hex';
const EQUAL = 0;
const LESS_THAN = 1;
const GREATER_THAN = 2;
function cmp(a, b) {
    if (a === b) {
        return EQUAL;
    }
    if (a < b) {
        return LESS_THAN;
    }
    return GREATER_THAN;
}
function compare(symbolX, symbolY) {
    let i = 0;
    const len = symbolX.length <= symbolY.length ? symbolX.length : symbolY.length;
    const lenCmp = cmp(symbolX.length, symbolY.length);
    while (i < len) {
        const elemCmp = cmp(symbolX.charCodeAt(i), symbolY.charCodeAt(i));
        i += 1;
        if (elemCmp !== 0) {
            return elemCmp;
        }
    }
    return lenCmp;
}
export function isSortedSymbols(symbolX, symbolY) {
    return compare(symbolX, symbolY) === LESS_THAN;
}
export function composeType(address, ...args) {
    const generics = Array.isArray(args[args.length - 1]) ? args.pop() : [];
    const chains = [address, ...args].filter(Boolean);
    let result = chains.join('::');
    if (generics && generics.length) {
        result += `<${generics.join(', ')}>`;
    }
    return result;
}
export function extractAddressFromType(type) {
    return type.split('::')[0];
}
export function extractStructTagFromType(type) {
    try {
        let _type = type.replace(/\s/g, '');
        const genericsString = _type.match(/(<.+>)$/);
        const generics = genericsString?.[0]?.match(/(\w+::\w+::\w+)(?:<.*?>(?!>))?/g);
        if (generics) {
            _type = _type.slice(0, _type.indexOf('<'));
            const tag = extractStructTagFromType(_type);
            const structTag = {
                ...tag,
                type_arguments: generics.map((item) => extractStructTagFromType(item).source_address),
            };
            structTag.type_arguments = structTag.type_arguments.map((item) => {
                return CoinAssist.isSuiCoin(item) ? item : extractStructTagFromType(item).source_address;
            });
            structTag.source_address = composeType(structTag.full_address, structTag.type_arguments);
            return structTag;
        }
        const parts = _type.split('::');
        const isSuiCoin = _type === GAS_TYPE_ARG || _type === GAS_TYPE_ARG_LONG;
        const structTag = {
            full_address: _type,
            address: isSuiCoin ? '0x2' : normalizeSuiObjectId(parts[0]),
            module: parts[1],
            name: parts[2],
            type_arguments: [],
            source_address: '',
        };
        structTag.full_address = `${structTag.address}::${structTag.module}::${structTag.name}`;
        structTag.source_address = composeType(structTag.full_address, structTag.type_arguments);
        return structTag;
    }
    catch (error) {
        return {
            full_address: type,
            address: '',
            module: '',
            name: '',
            type_arguments: [],
            source_address: type,
        };
    }
}
export function normalizeCoinType(coinType) {
    return extractStructTagFromType(coinType).source_address;
}
export function fixSuiObjectId(value) {
    if (value.toLowerCase().startsWith('0x')) {
        return normalizeSuiObjectId(value);
    }
    return value;
}
/**
 * Fixes and normalizes a coin type by removing or keeping the prefix.
 *
 * @param {string} coinType - The coin type to be fixed.
 * @param {boolean} removePrefix - Whether to remove the prefix or not (default: true).
 * @returns {string} - The fixed and normalized coin type.
 */
export const fixCoinType = (coinType, removePrefix = true) => {
    const arr = coinType.split('::');
    const address = arr.shift();
    let normalizeAddress = normalizeSuiObjectId(address);
    if (removePrefix) {
        normalizeAddress = removeHexPrefix(normalizeAddress);
    }
    return `${normalizeAddress}::${arr.join('::')}`;
};
/**
 * Recursively traverses the given data object and patches any string values that represent Sui object IDs.
 *
 * @param {any} data - The data object to be patched.
 */
export function patchFixSuiObjectId(data) {
    for (const key in data) {
        const type = typeof data[key];
        if (type === 'object') {
            patchFixSuiObjectId(data[key]);
        }
        else if (type === 'string') {
            const value = data[key];
            if (value && !value.includes('::')) {
                data[key] = fixSuiObjectId(value);
            }
        }
    }
}
