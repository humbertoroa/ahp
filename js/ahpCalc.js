import { ahpArrayHelper } from './ahpArrayHelper.js';

/**
 * AHP Calculation Logic
 */
export const ahpCalc = {
    /**
     * consistance index array
     */
    consistencyIndex: [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49],

    /**
     * purpose: calcuate the results of an ahp poll
     *
     * @param {Array} resultArray an array of the responses to an ahp poll
     * @return {Object} the poll results
     * 		resultColumn - an array of the poll results
     * 		consistencyRatio - the cr value
     * 		eigen - the eigen results, which include the eigen value, eigen vector, and max eigen value
     */
    calculateResults: function(resultArray) {
        const _sumRow = this._calculateSumRow(resultArray);
        const _normalizedResults = this._normalizeResults(resultArray, _sumRow);
        const _resultColumn = this._calculateResultAverages(_normalizedResults);
        const _consistencyRatio = this._calcConsistencyRatio(resultArray, _resultColumn);

        return {
            resultColumn: _resultColumn,
            consistencyRatio: _consistencyRatio.cr,
            eigen: _consistencyRatio.eigen
        };
    },

    /**
     * purpose: calculate the sum of each column
     *
     * @param {Array} resultArray an array of poll options
     * @return {Array} sumArray an array of the column sums
     */
    _calculateSumRow: function(resultArray) {
        const size = resultArray.length;
        const sumArray = [];

        // iterate through column row values to calculate the column sum
        for (let j = 0; j < size; j++) {
            sumArray[j] = 0;
            for (let i = 0; i < size; i++) {
                sumArray[j] += resultArray[i][j];
            }
        }

        return sumArray;
    },

    /**
     * purpose: create a normalized array by dividing each column row value by the column sum
     *
     * @param {Array} resultArray an array of the responses to an ahp poll
     * @param {Array} sumRow an array of the column sums
     * @return {Array} resultArrayNormalized the normalized result array
     */
    _normalizeResults: function(resultArray, sumRow) {
        const size = resultArray.length;

        // initialize the normalized array
        const resultArrayNormalized = ahpArrayHelper._setUpSquareArray(size);

        // iterate through column row values and divide the row value by the column sum
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                resultArrayNormalized[i][j] = resultArray[i][j] / sumRow[j];
            }
        }

        return resultArrayNormalized;

    },

    /**
     * purpose: calculate the average value for each row in the normalized array
     *
     * @param {Array} resultArrayNormalized the normalized result array
     * @return {Array} resultColumn an array that contains the average value of each row
     */
    _calculateResultAverages: function(resultArrayNormalized) {
        const size = resultArrayNormalized.length;
        const resultColumn = [];

        for (let i = 0; i < size; i++) {
            resultColumn[i] = 0;
            for (let j = 0; j < size; j++) {
                resultColumn[i] += resultArrayNormalized[i][j];
            }
            resultColumn[i] = resultColumn[i] / size;
        }

        return resultColumn;
    },

    /**
     * purpose: calculate the consistance ratio
     *
     * @param {Array} resultArray an array of the responses to an ahp poll
     * @param {Array} resultColumn an array that contains the average value of each row
     * @return {Object} the cr and eigen results
     */
    _calcConsistencyRatio: function(resultArray, resultColumn) {
        const eigen = this._calcPrincipalEigenValue(resultArray, resultColumn);
        const options = resultArray.length;
        const ci = (eigen.avgEigenValue - options) / (options - 1);
        const cr = ci / this.consistencyIndex[options - 1];

        return {
            cr: cr,
            eigen: eigen
        };
    },

    /**
     * purpose: calculate the principle eigen value for the results
     *
     * @param {Array} resultArray an array of the responses to an ahp poll
     * @param {Array} resultColumn an array that contains the average value of each row
     * @return {Object} eigen results
     */
    _calcPrincipalEigenValue: function(resultArray, resultColumn) {
        const size = resultArray.length;

        // resultArray * resultColumn
        const arr = [];
        for (let i = 0; i < size; i++) {
            arr[i] = 0;
            for (let j = 0; j < size; j++) {
                arr[i] += resultColumn[j] * resultArray[i][j];
            }
        }

        // calc eigen values
        const eigenVector = [];
        let eigenValue = 0;
        let maxEigenValue = 0;
        for (let i = 0; i < size; i++) {
            const val = arr[i] / resultColumn[i];
            eigenVector[i] = val;
            eigenValue += val;

            maxEigenValue = (val > maxEigenValue) ? val : maxEigenValue;
        }
        const avgEigenValue = eigenValue / size;

        return {
            avgEigenValue: avgEigenValue,
            eigenVector: eigenVector,
            maxEigenValue: maxEigenValue
        };

    }
};