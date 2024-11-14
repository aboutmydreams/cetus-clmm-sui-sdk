import { initMainnetSDK } from "./mainnet";
import { initTestnetSDK } from "./testnet";
/**
 * Helper function to initialize the Cetus SDK
 * @param env - The environment to initialize the SDK in. One of 'mainnet' or 'testnet'.
 * @param fullNodeUrl - The full node URL to use.
 * @param simulationAccount - The simulation account address to use. If not provided,
 *                            the default simulation account `0x0000000000000000000000000000000000000000000000000000000000000000` will be used.
 *                            If you use the `preswap` method, you should set a simulation account and ensure that this address has sufficient input coins.
 * @returns The initialized Cetus SDK.
 */
export function initCetusSDK(options) {
    const { network, fullNodeUrl, simulationAccount } = options;
    return network === 'mainnet' ? initMainnetSDK(fullNodeUrl, simulationAccount) : initTestnetSDK(fullNodeUrl, simulationAccount);
}
