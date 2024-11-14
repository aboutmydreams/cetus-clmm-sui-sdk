import CetusClmmSDK, { SdkOptions } from '../../src';
export declare const clmmMainnet: SdkOptions;
/**
 * Initialize the mainnet SDK
 * @param fullNodeUrl. If provided, it will be used as the full node URL.
 * @param simulationAccount. If provided, it will be used as the simulation account address.
 * @returns
 */
export declare function initMainnetSDK(fullNodeUrl?: string, simulationAccount?: string): CetusClmmSDK;
