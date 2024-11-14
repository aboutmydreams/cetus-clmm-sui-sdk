import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Secp256k1Keypair } from '@mysten/sui/keypairs/secp256k1';
import { SuiObjectResponse } from '@mysten/sui/client';
import { Pool, Position, PositionReward } from '../types';
import { NFT } from '../types/sui';
import { TickData } from '../types/clmmpool';
/**
 * Converts an amount to a decimal value, based on the number of decimals specified.
 * @param  {number | string} amount - The amount to convert to decimal.
 * @param  {number | string} decimals - The number of decimals to use in the conversion.
 * @returns {number} - Returns the converted amount as a number.
 */
export declare function toDecimalsAmount(amount: number | string, decimals: number | string): number;
/**
 * Converts a bigint to an unsigned integer of the specified number of bits.
 * @param {bigint} int - The bigint to convert.
 * @param {number} bits - The number of bits to use in the conversion. Defaults to 32 bits.
 * @returns {string} - Returns the converted unsigned integer as a string.
 */
export declare function asUintN(int: bigint, bits?: number): string;
/**
 * Converts a bigint to a signed integer of the specified number of bits.
 * @param {bigint} int - The bigint to convert.
 * @param {number} bits - The number of bits to use in the conversion. Defaults to 32 bits.
 * @returns {number} - Returns the converted signed integer as a number.
 */
export declare function asIntN(int: bigint, bits?: number): number;
/**
 * Converts an amount in decimals to its corresponding numerical value.
 * @param {number|string} amount - The amount to convert.
 * @param {number|string} decimals - The number of decimal places used in the amount.
 * @returns {number} - Returns the converted numerical value.
 */
export declare function fromDecimalsAmount(amount: number | string, decimals: number | string): number;
/**
 * Converts a secret key in string or Uint8Array format to an Ed25519 key pair.
 * @param {string|Uint8Array} secretKey - The secret key to convert.
 * @param {string} ecode - The encoding of the secret key ('hex' or 'base64'). Defaults to 'hex'.
 * @returns {Ed25519Keypair} - Returns the Ed25519 key pair.
 */
export declare function secretKeyToEd25519Keypair(secretKey: string | Uint8Array, ecode?: 'hex' | 'base64'): Ed25519Keypair;
/**
 * Converts a secret key in string or Uint8Array format to a Secp256k1 key pair.
 * @param {string|Uint8Array} secretKey - The secret key to convert.
 * @param {string} ecode - The encoding of the secret key ('hex' or 'base64'). Defaults to 'hex'.
 * @returns {Ed25519Keypair} - Returns the Secp256k1 key pair.
 */
export declare function secretKeyToSecp256k1Keypair(secretKey: string | Uint8Array, ecode?: 'hex' | 'base64'): Secp256k1Keypair;
/**
 * Builds a Pool object based on a SuiObjectResponse.
 * @param {SuiObjectResponse} objects - The SuiObjectResponse containing information about the pool.
 * @returns {Pool} - The built Pool object.
 */
export declare function buildPool(objects: SuiObjectResponse): Pool;
/**
 * Builds an NFT object based on a response containing information about the NFT.
 * @param {any} objects - The response containing information about the NFT.
 * @returns {NFT} - The built NFT object.
 */
export declare function buildNFT(objects: any): NFT;
/** Builds a Position object based on a SuiObjectResponse.
 * @param {SuiObjectResponse} object - The SuiObjectResponse containing information about the position.
 * @returns {Position} - The built Position object.
 */
export declare function buildPosition(object: SuiObjectResponse): Position;
/**
 * Builds a PositionReward object based on a response containing information about the reward.
 * @param {any} fields - The response containing information about the reward.
 * @returns {PositionReward} - The built PositionReward object.
 */
export declare function buildPositionReward(fields: any): PositionReward;
/**
 * Builds a TickData object based on a response containing information about tick data.
 * It must check if the response contains the required fields.
 * @param {SuiObjectResponse} objects - The response containing information about tick data.
 * @returns {TickData} - The built TickData object.
 */
export declare function buildTickData(objects: SuiObjectResponse): TickData;
/**
 * Builds a TickData object based on a given event's fields.
 * @param {any} fields - The fields of an event.
 * @returns {TickData} - The built TickData object.
 * @throws {Error} If any required field is missing.
 */
export declare function buildTickDataByEvent(fields: any): TickData;
export declare function buildClmmPositionName(pool_index: number, position_index: number): string;
