import CetusClmmSDK, { SdkOptions } from '../main';
export declare const clmmTestnet: SdkOptions;
/**
 * Initialize the testnet SDK
 * @param fullNodeUrl. If provided, it will be used as the full node URL.
 * @param simulationAccount. If provided, it will be used as the simulation account address.
 * @returns
 */
export declare function initTestnetSDK(fullNodeUrl?: string, simulationAccount?: string): CetusClmmSDK;
