/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */
/* -------------------------- SuiObjectResponse ------------------------- */
export function getSuiObjectData(resp) {
    return resp.data;
}
export function getObjectDeletedResponse(resp) {
    if (resp.error && 'object_id' in resp.error && 'version' in resp.error && 'digest' in resp.error) {
        const { error } = resp;
        return {
            objectId: error.object_id,
            version: error.version,
            digest: error.digest,
        };
    }
    return undefined;
}
export function getObjectNotExistsResponse(resp) {
    if (resp.error && 'object_id' in resp.error && !('version' in resp.error) && !('digest' in resp.error)) {
        return resp.error.object_id;
    }
    return undefined;
}
export function getObjectReference(resp) {
    if ('reference' in resp) {
        return resp.reference;
    }
    const exists = getSuiObjectData(resp);
    if (exists) {
        return {
            objectId: exists.objectId,
            version: exists.version,
            digest: exists.digest,
        };
    }
    return getObjectDeletedResponse(resp);
}
/* ------------------------------ SuiObjectRef ------------------------------ */
export function getObjectId(data) {
    if ('objectId' in data) {
        return data.objectId;
    }
    return getObjectReference(data)?.objectId ?? getObjectNotExistsResponse(data);
}
export function getObjectVersion(data) {
    if ('version' in data) {
        return data.version;
    }
    return getObjectReference(data)?.version;
}
/* -------------------------------- SuiObject ------------------------------- */
export function isSuiObjectResponse(resp) {
    return resp.data !== undefined;
}
function isSuiObjectDataWithContent(data) {
    return data.content !== undefined;
}
export function getMovePackageContent(data) {
    const suiObject = getSuiObjectData(data);
    if (suiObject?.content?.dataType !== 'package') {
        return undefined;
    }
    return suiObject.content.disassembled;
}
export function getMoveObject(data) {
    const suiObject = 'data' in data ? getSuiObjectData(data) : data;
    if (!suiObject || !isSuiObjectDataWithContent(suiObject) || suiObject.content.dataType !== 'moveObject') {
        return undefined;
    }
    return suiObject.content;
}
export function getMoveObjectType(resp) {
    return getMoveObject(resp)?.type;
}
/**
 * Deriving the object type from the object response
 * @returns 'package' if the object is a package, move object type(e.g., 0x2::coin::Coin<0x2::sui::SUI>)
 * if the object is a move object
 */
export function getObjectType(resp) {
    const data = isSuiObjectResponse(resp) ? resp.data : resp;
    if (!data?.type && 'data' in resp) {
        if (data?.content?.dataType === 'package') {
            return 'package';
        }
        return getMoveObjectType(resp);
    }
    return data?.type;
}
export function getObjectPreviousTransactionDigest(resp) {
    return getSuiObjectData(resp)?.previousTransaction;
}
export function getObjectOwner(resp) {
    return getSuiObjectData(resp)?.owner;
}
export function getObjectDisplay(resp) {
    const display = getSuiObjectData(resp)?.display;
    if (!display) {
        return { data: null, error: null };
    }
    return display;
}
/**
 * Get the fields of a sui object response or data. The dataType of the object must be moveObject.
 * @param {SuiObjectResponse | SuiObjectData}object The object to get the fields from.
 * @returns {any} The fields of the object.
 */
export function getObjectFields(object) {
    const fields = getMoveObject(object)?.fields;
    if (fields) {
        if ('fields' in fields) {
            return fields.fields;
        }
        return fields;
    }
    return undefined;
}
/**
 * Return hasPublicTransfer of a move object.
 * @param {SuiObjectResponse | SuiObjectData}data
 * @returns
 */
export function hasPublicTransfer(data) {
    return getMoveObject(data)?.hasPublicTransfer ?? false;
}
