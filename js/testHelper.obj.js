var testHelper = {};

testHelper.isArray = function (obj) {
   if (obj.constructor.toString().indexOf("Array") == -1){
      return false;
   }
   else {
      return true;
   }
};

/**
 * purpose: round a real number
 */
testHelper.convertRealToRoundedPercent = function(num, digits){
	var e = (digits) ? digits : 4; 
	var f1 = Math.pow(10, e);
	
	// rounding will be done by adding half the last digit to last-digit + 1
	// f2 determines the position of last-digit + 1 and r is half the last digit
	var f2 = Math.pow(10, e+1);
	var r = 5 / f2;
	
	// calc rounded result
	var resultValue = (((num + r ) * f1) + '').split('.', 1)/f1;
	
	// convert to string
	resultValue = resultValue + '';
	
	return resultValue;
};