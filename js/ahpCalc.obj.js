var ahpArrayHelper = {};

/**
 * purpose: initialize a square array with 0s and diagonal values of 1.
 * 
 * @param Integer size the size of the array
 * @return Array the intialized array
 */
ahpArrayHelper._setUpSquareArray = function(size){
	var result = [];
	
	// setup array rows
	var i;
	for(i = 0; i < size; i++){
		result[i] = this._getInitializedArray(size);
	}
	
	// set diagonal values to 1
	for(i = 0; i < size; i++){
		result[i][i] = 1;
	}
	
	return result;
};

/**
 * purpose: initialize an array with 0s
 * 
 * @param Integer size the size of the array
 * @return Array the intialized array
 */
ahpArrayHelper._getInitializedArray = function(size){
	var arr = [];
	for(var i = 0; i < size; i++){
		arr[i] = 0;
	}
	return arr;
};


var ahpCalc = {};

/**
 * consistance index array
 */
ahpCalc.consistencyIndex = [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49 ];

/**
 * purpose: calcuate the results of an ahp poll
 * 
 * @param Array resultArray an array of the responses to an ahp poll
 * @return Object the poll results
 * 		resultColumn - an array of the poll results
 * 		consistencyRatio - the cr value
 * 		eigen - the eigen results, which include the eigen value, eigen vector, and max eigen value
 */
ahpCalc.calculateResults = function(resultArray){
	var _sumRow 			= this._calculateSumRow(resultArray);
	var _normalizedResults 	= this._normalizeResults(resultArray, _sumRow); 
	var _resultColumn 		= this._calculateResultAverages(_normalizedResults);
	var _consistencyRatio 	= this._calcConsistencyRatio(resultArray, _resultColumn);
	
	return {resultColumn: _resultColumn, consistencyRatio: _consistencyRatio.cr, eigen: _consistencyRatio.eigen};
};

/**
 * purpose: calculate the sum of each column
 * 
 * @param Array resultArray an array of poll options
 * @return Array sumArray an array of the column sums
 */
ahpCalc._calculateSumRow = function(resultArray){
	var size = resultArray.length;
	var sumArray = [];
	
	// iterate through column row values to calculate the column sum
	for(var j = 0; j < size; j++){
		sumArray[j] = 0;
		for(var i = 0; i < size; i++){
			sumArray[j] += resultArray[i][j];
		}
	}
	
	return sumArray;
};

/**
 * purpose: create a normalized array by dividing each column row value by the column sum
 * 
 * @param Array resultArray an array of the responses to an ahp poll
 * @return Array resultArrayNormalized the normalized result array
 */
ahpCalc._normalizeResults = function(resultArray, sumRow){
	var size = resultArray.length;
	
	// initialize the normalized array
	var resultArrayNormalized = ahpArrayHelper._setUpSquareArray(size);
	
	// iterate through column row values and divide the row value by the column sum
	for(var i = 0; i < size; i++){
		for(var j = 0; j < size; j++){
			resultArrayNormalized[i][j] = resultArray[i][j] / sumRow[j];
		}
	}
	
	return resultArrayNormalized;
	
};

/**
 * purpose: calculate the average value for each row in the normalized array
 * 
 * @param Array resultArrayNormalized the normalized result array
 * @return Array resultColumn an array that contains the average value of each row
 */
ahpCalc._calculateResultAverages = function(resultArrayNormalized){
	var size = resultArrayNormalized.length;
	var resultColumn = [];
	
	for(var i = 0; i < size; i++){
		resultColumn[i] = 0;
		for(var j = 0; j < size; j++){
			resultColumn[i] += resultArrayNormalized[i][j];
		}
		resultColumn[i] = resultColumn[i] / size;
	}
	
	return resultColumn;
};

/**
 * purpose: calculate the consistance ratio
 * 
 * @param Array resultArray an array of the responses to an ahp poll
 * @param Array resultColumn an array that contains the average value of each row
 * @return Object the cr and eigen results
 */
ahpCalc._calcConsistencyRatio = function(resultArray, resultColumn){
	var eigen = this._calcPrincipalEigenValue(resultArray, resultColumn);
	var options = resultArray.length;
	var ci = (eigen.avgEigenValue - options) / (options - 1);
	var cr = ci / this.consistencyIndex[options-1];
	
	return {cr: cr, eigen: eigen};
};

/**
 * purpose: calculate the principle eigen value for the results
 * 
 * @param Array resultArray an array of the responses to an ahp poll
 * @param Array resultColumn an array that contains the average value of each row
 * @return Object eigen results
 */
ahpCalc._calcPrincipalEigenValue = function(resultArray, resultColumn){
	var size = resultArray.length;
	
	// resultArray * resultColumn
	var arr = [];
	for(var i= 0; i < size; i++){
		arr[i] = 0;
		for(var j= 0; j < size; j++){
			arr[i] += resultColumn[j] * resultArray[i][j];
		}
	}
	
	// calc eigen values
	var eigenVector = [];
	var eigenValue = 0;
	var maxEigenValue = 0;
	for(var i= 0; i < size; i++){
		var val = arr[i] / resultColumn[i];
		eigenVector[i] = val;
		eigenValue += val;
		
		maxEigenValue  = (val > maxEigenValue) ? val : maxEigenValue;
	}
	var avgEigenValue  = eigenValue / size;
	
	return {avgEigenValue: avgEigenValue, eigenVector: eigenVector, maxEigenValue: maxEigenValue};

};

