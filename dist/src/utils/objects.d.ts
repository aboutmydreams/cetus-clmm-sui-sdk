import { SuiObjectData, SuiObjectRef, SuiObjectResponse, OwnedObjectRef, ObjectOwner, DisplayFieldsResponse, SuiMoveObject, SuiParsedData } from '@mysten/sui/client';
export declare function getSuiObjectData(resp: SuiObjectResponse): SuiObjectData | null | undefined;
export declare function getObjectDeletedResponse(resp: SuiObjectResponse): SuiObjectRef | undefined;
export declare function getObjectNotExistsResponse(resp: SuiObjectResponse): string | undefined;
export declare function getObjectReference(resp: SuiObjectResponse | OwnedObjectRef): SuiObjectRef | undefined;
export declare function getObjectId(data: SuiObjectResponse | SuiObjectRef | OwnedObjectRef): string;
export declare function getObjectVersion(data: SuiObjectResponse | SuiObjectRef | SuiObjectData): string | number | undefined;
export declare function isSuiObjectResponse(resp: SuiObjectResponse | SuiObjectData): resp is SuiObjectResponse;
export declare function getMovePackageContent(data: SuiObjectResponse): any | undefined;
export declare function getMoveObject(data: SuiObjectResponse | SuiObjectData): SuiMoveObject | undefined;
export declare function getMoveObjectType(resp: SuiObjectResponse): string | undefined;
/**
 * Deriving the object type from the object response
 * @returns 'package' if the object is a package, move object type(e.g., 0x2::coin::Coin<0x2::sui::SUI>)
 * if the object is a move object
 */
export declare function getObjectType(resp: SuiObjectResponse | SuiObjectData): string | null | undefined;
export declare function getObjectPreviousTransactionDigest(resp: SuiObjectResponse): string | null | undefined;
export declare function getObjectOwner(resp: SuiObjectResponse): ObjectOwner | null | undefined;
export declare function getObjectDisplay(resp: SuiObjectResponse): DisplayFieldsResponse;
/**
 * Get the fields of a sui object response or data. The dataType of the object must be moveObject.
 * @param {SuiObjectResponse | SuiObjectData}object The object to get the fields from.
 * @returns {any} The fields of the object.
 */
export declare function getObjectFields(object: SuiObjectResponse | SuiObjectData): any;
export interface SuiObjectDataWithContent extends SuiObjectData {
    content: SuiParsedData;
}
/**
 * Return hasPublicTransfer of a move object.
 * @param {SuiObjectResponse | SuiObjectData}data
 * @returns
 */
export declare function hasPublicTransfer(data: SuiObjectResponse | SuiObjectData): boolean;
