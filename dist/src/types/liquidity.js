/**
 * Represents the direction of a swap.
 */
export var SwapDirection;
(function (SwapDirection) {
    /**
     * Swap from coin A to coin B.
     */
    SwapDirection["A2B"] = "a2b";
    /**
     * Swap from coin B to coin A.
     */
    SwapDirection["B2A"] = "b2a";
})(SwapDirection || (SwapDirection = {}));
