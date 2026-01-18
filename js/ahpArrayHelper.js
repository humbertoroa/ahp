/**
 * Helper functions for array manipulation in AHP calculations
 */
export const ahpArrayHelper = {
    /**
     * purpose: initialize a square array with 0s and diagonal values of 1.
     *
     * @param {number} size the size of the array
     * @return {Array} the intialized array
     */
    _setUpSquareArray: function(size) {
        const result = [];

        // setup array rows
        for(let i = 0; i < size; i++){
            result[i] = this._getInitializedArray(size);
        }

        // set diagonal values to 1
        for(let i = 0; i < size; i++){
            result[i][i] = 1;
        }

        return result;
    },

    /**
     * purpose: initialize an array with 0s
     *
     * @param {number} size the size of the array
     * @return {Array} the intialized array
     */
    _getInitializedArray: function(size) {
        return new Array(size).fill(0);
    }
};