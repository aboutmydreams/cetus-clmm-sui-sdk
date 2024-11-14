import { ClmmpoolsError, ConfigErrorCode } from '../errors/errors';
/**
 * Enumerates the possible status values of a position within a liquidity mining module.
 */
export var ClmmPositionStatus;
(function (ClmmPositionStatus) {
    /**
     * The position has been deleted or removed.
     */
    ClmmPositionStatus["Deleted"] = "Deleted";
    /**
     * The position exists and is active.
     */
    ClmmPositionStatus["Exists"] = "Exists";
    /**
     * The position does not exist or is not active.
     */
    ClmmPositionStatus["NotExists"] = "NotExists";
})(ClmmPositionStatus || (ClmmPositionStatus = {}));
/**
 * Utility function to retrieve packager configurations from a package object.
 * @param {Package<T>} packageObj - The package object containing configurations.
 * @throws {Error} Throws an error if the package does not have a valid config.
 * @returns {T} The retrieved configuration.
 */
export function getPackagerConfigs(packageObj) {
    if (packageObj.config === undefined) {
        throw new ClmmpoolsError(`package: ${packageObj.package_id}  not config in sdk SdkOptions`, ConfigErrorCode.InvalidConfig);
    }
    return packageObj.config;
}
