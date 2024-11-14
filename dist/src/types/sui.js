import { ClmmpoolsError, TypesErrorCode } from '../errors/errors';
/**
 * The address representing the clock in the system.
 */
export const CLOCK_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000006';
/**
 * Constants for different modules in the CLMM (Cryptocurrency Liquidity Mining Module).
 */
export const ClmmPartnerModule = 'partner';
export const ClmmIntegratePoolModule = 'pool_script';
export const ClmmIntegratePoolV2Module = 'pool_script_v2';
export const ClmmIntegratePoolV3Module = 'pool_script_v3';
export const ClmmIntegrateRouterModule = 'router';
export const ClmmIntegrateRouterWithPartnerModule = 'router_with_partner';
export const ClmmFetcherModule = 'fetcher_script';
export const ClmmExpectSwapModule = 'expect_swap';
export const ClmmIntegrateUtilsModule = 'utils';
/**
 * The address for CoinInfo module.
 */
export const CoinInfoAddress = '0x1::coin::CoinInfo';
/**
 * The address for CoinStore module.
 */
export const CoinStoreAddress = '0x1::coin::CoinStore';
/**
 * Constants for different modules in the Deepbook system.
 */
export const DeepbookCustodianV2Moudle = 'custodian_v2';
export const DeepbookClobV2Moudle = 'clob_v2';
export const DeepbookEndpointsV2Moudle = 'endpoints_v2';
/**
 * Gets the default SUI input type based on the provided value.
 * @param value - The value to determine the default input type for.
 * @returns The default SUI input type.
 * @throws Error if the type of the value is unknown.
 */
export const getDefaultSuiInputType = (value) => {
    if (typeof value === 'string' && value.startsWith('0x')) {
        return 'object'; // Treat value as an object if it starts with '0x'.
    }
    if (typeof value === 'number' || typeof value === 'bigint') {
        return 'u64'; // Treat number or bigint values as 'u64' type.
    }
    if (typeof value === 'boolean') {
        return 'bool'; // Treat boolean values as 'bool' type.
    }
    throw new ClmmpoolsError(`Unknown type for value: ${value}`, TypesErrorCode.InvalidType);
};
