var displayHelper = {};

/**
 * purpose: initialize the poll
 */
displayHelper.initializePoll = function(){
	
	// bind events only to elements that exist
	var addOptionBtn = document.getElementById('addOption');
	if(addOptionBtn) {
		addOptionBtn.addEventListener('click', function(){
			displayHelper.addOptionToList();
		});
	}
	
	var addMultiOptionsBtn = document.getElementById('addMultiOptions');
	if(addMultiOptionsBtn) {
		addMultiOptionsBtn.addEventListener('click', function(){
			displayHelper.addMultiOptionsToList();
		});
	}

	document.querySelectorAll('.startPoll').forEach(function(element) {
		element.addEventListener('click', function(){
			displayHelper.startPoll();
		});
	});
	
	document.querySelectorAll('.stopPoll').forEach(function(element) {
		element.addEventListener('click', function(){
			displayHelper.stopPoll();
		});
	});
	
	document.querySelectorAll('.changePoll').forEach(function(element) {
		element.addEventListener('click', function(){
			displayHelper.stopPoll();
		});
	});
	
	// add an option to the list when the user selects the enter key
	var optionTextInput = document.getElementById('optionText');
	if(optionTextInput) {
		optionTextInput.addEventListener('keypress', function (e) {  
			if (e.key === 'Enter') {
				// take an action
				displayHelper.addOptionToList();
			}  
		});
	}
     
     // hide the poll results container because there are not any results yet
     document.getElementById('pollResults').style.display = 'none';
};


/**
 * purpose: add an option to the option list using the string in 
 * the input field: #optionText
 */
displayHelper.addOptionToList = function(){
	var optionTextInput = document.getElementById('optionText');
	if(optionTextInput) {
		var option = optionTextInput.value;
		displayHelper._addOption(option);	
	}
};

/**
 * purpose: add multiple options to the option list using the strings in
 * the textarea: #multiOptionText
 */
displayHelper.addMultiOptionsToList = function(){
	// split the options from the textarea
	var options = document.getElementById('multiOptionText').value;
	var optionArray = options.split('\n');

	// add each option
	optionArray.forEach(function(option){
		displayHelper._addOption(option);
	});

	// clear the textarea
	document.getElementById('multiOptionText').value = '';

};

/**
 * purpose: add an option to the option list
 * 
 * @param String option the option text
 */
displayHelper._addOption = function(option){

	option.trim();

	if(option.length > 0){
		var row = document.createElement('tr');
		row.className = 'new';
		row.style.display = 'none';
		row.innerHTML = '<td class="index"></td><td class="option">' + option + '</td><td><a href="#" class="removeParent">[x]</a></td>';
		document.getElementById('optionsList').appendChild(row);
		
		// Fade in effect
		row.style.display = 'table-row';
		row.style.opacity = '0';
		var opacity = 0;
		var fadeIn = setInterval(function() {
			opacity += 0.1;
			row.style.opacity = opacity;
			if (opacity >= 1) {
				clearInterval(fadeIn);
			}
		}, 50);
		
		// clear the option text
		displayHelper._resetOptionInputText();		
		
		// bind the remove event to the delete button
		displayHelper._bindRemoveEvents();
		
		// update the table index. This will renumber the table rows.
		displayHelper._updateTableIndex();
	}
};

/**
 * purpose: clear the text in the input: #optionText
 */
displayHelper._resetOptionInputText = function(){
	var optionTextInput = document.getElementById('optionText');
	if(optionTextInput) {
		optionTextInput.va

/**
 * purpose: reset the poll using the values in the Object poll as the new poll values
 * 
 * @param Object poll an object with the question and options for the poll
 */
displayHelper._resetPoll = function(poll){
	// remove the existing poll options
	document.getElementById('optionsList').innerHTML = '';

	// set the poll question
	document.querySelector('.questionTextInput').value = poll.question;

	// set the poll options
	poll.options.forEach(function(option){
		displayHelper._addOption(option);
	});
	
	// stop the poll
	displayHelper.stopPoll();
};

/**
 * purpose: bind a remove event to the remove link for an option
 */
displayHelper._bindRemoveEvents = function(){
	document.querySelectorAll('#optionsList tr.new .removeParent').forEach(function(element){
		element.addEventListener('click', function(){
			this.parentNode.parentNode.remove();
			displayHelper._updateTableIndex();
		});
	});
	
	document.querySelectorAll('#optionsList tr.new').forEach(function(element){
		element.classList.remove('new');
	});
};
		
/**
 * purpose: function to stop a poll. This function is bound to a button.
 */
displayHelper.stopPoll = function(){
	// hide the stop poll button container
	document.querySelectorAll('.stopPoll').forEach(function(element){
		element.style.display = 'none';
	});
	
	// hide the poll questions container
	document.querySelectorAll('.changePoll').forEach(function(element){
		element.style.display = 'none';
	});
	document.getElementById('pollQuestions').style.display = 'none';
	
	// show hidden containers for setup
	document.querySelectorAll('.newOption, .removeParent, .startPoll, .setup').forEach(function(element){
		element.style.display = 'block';
	});
	
	// show the existing poll results
	document.getElementById('pollResults').style.display = 'block';
};

/**
 * purpose: function to change a poll. This allows the user to change the poll values.
 * This function is bound to a button.
 */
displayHelper.changePoll = function(){
	// hide the stop poll button container
	document.querySelectorAll('.stopPoll').forEach(function(element){
		element.style.display = 'none';
	});
	
	//show the change poll container
	document.querySelectorAll('.changePoll').forEach(function(element){
		element.style.display = 'block';
	});
	
	// show the existing poll results
	document.getElementById('pollResults').style.display = 'block';
};

/**
 * purpose: function to start a poll. This function is bound to a button.
 */
displayHelper.startPoll = function(){
	if(document.querySelectorAll('#optionsList .option').length > 1){
		// hide the setup container
		document.querySelectorAll('.setup').forEach(function(element){
			element.style.display = 'none';
		});
		
		// display the stop poll button
		document.querySelectorAll('.stopPoll').forEach(function(element){
			element.style.display = 'block';
		});
		
		// hide the existing poll results
		document.getElementById('pollResults').style.display = 'none';

		// hide set up containers
		document.querySelectorAll('.newOption, .removeParent, .startPoll').forEach(function(element){
			element.style.display = 'none';
		});
		
		var pollSettings = {};
		pollSettings.optionArray = [];

		pollSettings.questionText = document.querySelector('.questionTextInput').value;

		// extract the options
		document.querySelectorAll('#optionsList .option').forEach(function(element){
			pollSettings.optionArray.push(element.textContent);
		});
		
		//pollSettings.voteType = document.querySelector("input[name='votingType']:checked").value;
        pollSettings.voteType = "simpleVoting";

		// start the poll
		ahp.startPoll(pollSettings);
		
	}
};

/**
 * purpose: update the option list index
 */
displayHelper._updateTableIndex = function(){
	document.querySelectorAll('#optionsList .index').forEach(function(element, index){
		element.innerHTML = '<strong>option ' + (index+1) + ': </strong>';
	});
};

var ahp = {};

/**
 * the question text
 */ 
ahp.question = '';

/**
 * array to store the votes
 */
ahp.resultArray = [];

/**
 * array to store the options that are presented as pairs
 */
ahp.optionArray = [];

/**
 * the score values
 */
ahp.scores = {eq: 1, low: 2, high: 4};

/**
 * the index of the current pair with respect to the total number of questions that will be asked
 */
ahp.questionIndex = 1;

/**
 * the total number of questions that will be asked. initialized when the poll is started
 */
ahp.questionTotal = 0;

// the index of the current result set. Used to number each result set.
ahp.resultCount = 1;


/**
 * purpose: start the poll
 * 
 * @param Array optionArray the options to be presented as pairs for voting
 * @param String questionText the question
 */
ahp.startPoll = function(pollSettings){
	// setup the questions and options
	ahp.question = pollSettings.questionText;
	ahp.optionArray = pollSettings.optionArray;
	
	ahp._setVotingType(pollSettings);

	// setup the result array
	ahp._setUpResultArray();
	
	// determine the total number of questions
	ahp._initializeQuestionCount();
	
	// display the first pair
	ahp._displayNextQuestion();
	document.getElementById('pollQuestions').style.display = 'block';
};

/**
 * purpose: initialize the question count
 */
ahp._initializeQuestionCount = function(){
	ahp.questionIndex = 1;
	ahp.questionTotal = ((ahp.optionArray.length * ahp.optionArray.length) - ahp.optionArray.length) / 2;	
};

/**
 * purpose: hide/show vote buttons based on voteType
 * 
 * @param Object pollSettings 
 */
ahp._setVotingType = function(pollSettings){
	if(pollSettings.voteType){
		 switch (pollSettings.voteType) {
		 	case 'simpleVoting':
		 		document.querySelectorAll('.detailedPollButtons').forEach(function(element){
		 			element.style.display = 'none';
		 		});
		 		document.querySelectorAll('.simplePollButtons').forEach(function(element){
		 			element.style.display = 'block';
		 		});
		 		break;
		 		
		 	case 'detailedVoting':
		 		document.querySelectorAll('.simplePollButtons').forEach(function(element){
		 			element.style.display = 'none';
		 		});
		 		document.querySelectorAll('.detailedPollButtons').forEach(function(element){
		 			element.style.display = 'block';
		 		});
		 		break;
		 		
		 	default:
		 		break;
		 }
	}
};

/**
 * purpose: display the next pair. If there are no more pairs, then calculate the results.
 */
ahp._displayNextQuestion = function(){
	// get the next pair
	var nextQuestion = ahp._getNextQuestion(this.optionArray, this.resultArray);
	
	if(nextQuestion !== false){
		// display the pair
		document.querySelector('.questionTextDisplay').textContent = ahp.question;
		document.querySelector('.questionIndex').textContent = 'comparison '+ ahp.questionIndex +' of ' + ahp.questionTotal;
		document.getElementById('pollQuestion1').textContent = ahp.optionArray[nextQuestion[0]];
		document.getElementById('pollQuestion2').textContent = ahp.optionArray[nextQuestion[1]];
		ahp._bindVoteEvents(nextQuestion);
	} else {
		// calculate the results
		ahp._unbindVoteEvents();
		ahp._calculateResult();
	}
	
};

/**
 * purpose: unbind the events on the voting buttons
 */
ahp._unbindVoteEvents = function(){
	document.querySelectorAll('.simplePollButtons input[type="button"]').forEach(function(element){
		element.replaceWith(element.cloneNode(true));
	});

	document.querySelectorAll('.detailedPollButtons input[type="button"]').forEach(function(element){
		element.replaceWith(element.cloneNode(true));
	});
}; 

/**
 * purpose: bind the events to the voting buttons
 */
ahp._bindVoteEvents = function(nextQuestionArr){
	ahp._unbindVoteEvents();
		
	var leftpair = nextQuestionArr;
	var rightpair = [nextQuestionArr[1], nextQuestionArr[0] ];
	
	ahp._bindSimpleVoteEvents(leftpair, rightpair);
	ahp._bindDetailedVoteEvents(leftpair, rightpair);
};

/**
 * purpose: bind the events to the simple buttons
 */
ahp._bindSimpleVoteEvents = function(leftpair, rightpair){
	document.querySelector('.simplePollButtons #L_MuchMore').addEventListener('click', function(){
		ahp.recordVote(leftpair, ahp.scores.high);
	});

	document.querySelector('.simplePollButtons #L_SlightlyMore').addEventListener('click', function(){
		ahp.recordVote(leftpair, ahp.scores.low);
	});
	
	document.querySelector('.simplePollButtons #L_R_Same').addEventListener('click', function(){
		ahp.recordVote(leftpair, ahp.scores.eq);
	});
	
	document.querySelector('.simplePollButtons #R_SlightlyMore').addEventListener('click', function(){
		ahp.recordVote(rightpair, ahp.scores.low);
	});
	
	document.getElementById('R_MuchMore').addEventListener('click', function(){
		ahp.recordVote(rightpair, ahp.scores.high);
	});
};

/**
 * purpose: bind the events to the detailed buttons
 */
ahp._bindDetailedVoteEvents = function(leftpair, rightpair){
	document.querySelectorAll('.detailedPollButtons input[type="button"].leftMore').forEach(function(element){
		element.addEventListener('click', function(){
			ahp.recordVote(leftpair, parseInt(this.value, 10));
		});
	});
	
	document.querySelectorAll('.detailedPollButtons input[type="button"].rightMore').forEach(function(element){
		element.addEventListener('click', function(){
			ahp.recordVote(rightpair, parseInt(this.value, 10));
		});
	});
	
	document.querySelector('.detailedPollButtons input[type="button"].same').addEventListener('click', function(){
		ahp.recordVote(leftpair, 1);
	});
};


/**
 * purpose: record a vote
 * 
 * @param Array pair the index of the questions in optionArray
 * @param Integer score the value of the vote
 */
ahp.recordVote = function (pair, score){
	console.log(pair, score);

	// record the scores
	ahp.resultArray[pair[0]][pair[1]] = score;
	ahp.resultArray[pair[1]][pair[0]] = 1/score;
	
	// increment the question index
	ahp.questionIndex ++;
	
	// display the next pair
	ahp._displayNextQuestion();
};

/**
 * purpose: calculate the results
 */
ahp._calculateResult = function(){
	console.log('calculating results ...');
	
	// hide questions 
	document.getElementById('pollQuestions').style.display = 'none';

	// calc results
	var calcResults = ahpCalc.calculateResults(this.resultArray);
	
	// display the results
	ahp._displayResults(calcResults);
	
	displayHelper.changePoll();
};

/**
 * purpose: display the result table
 */
ahp._displayResults = function(calcResults){
	var html = '';
	var resultId = 'result_set_' +	ahp.resultCount;
	
	// remove the current class from existing result tables
	document.querySelectorAll('table.current').forEach(function(element){
		element.classList.remove('current');
	});
	
	
	html += '<table class="current pollResultTable">';
	
	// the question text
	html +=	'<tr>' + 
			'<td colspan="4" class="titleRow">Result Set #' +
			ahp.resultCount +
			': ' +
			'<span class="resultSetQuestionText">' +
			ahp.question +
			' </span>' + 
			'</td></tr>';
			
	html += '<tr class="result_set resultColumnTitle">' +
			'<td>Option</td>'	+
			'<td>Result</td>'	+
			'<td>Scaled <br /> Result</td>' +	
			'<td>&nbsp</td>'+
			'</tr>';	
			
	// the option text and result values	
	for(var i = 0; i < ahp.optionArray.length; i++){

		var resultText = this._convertRealToRoundedPercent(calcResults.resultColumn[i]);
	
		html += '<tr class="result_set" >' +
				'<td>' + 
				// option title
				'<span class="resultSetOptionText">' + ahp.optionArray[i] + '</span>' +
				'</td>' +
				'<td>' +
				'<span class="result">' + resultText + '</span>' + 
				'</td>' +
				'<td>' +
				'<span style="text-align: right;" class="scaledResult">' + resultText + '</span>' + 
				'</td>' +
				'<td>' +
				// bar
				'<div style="background-color:blue;width:' + (resultText * 1.2 * 100).toFixed(4) + 'px">&nbsp;</div>' +
				'</td>' +
				'</tr>';
	}
	// the question text
	html +=	'<tr class="result_set">' +
			'<td colspan="2" style="text-align: right;">&nbsp;</td>' +
			'<td colspan="2" style="text-align: left;">' +
			'<input size="4" style="text-align: right;" class="resultScaleFactor" value="1"/>' +
			'<button style="text-align: right;" class="scaleResults-new">Scale</button>' +
			'</td></tr>';
	
	// the consistancy calculation
	var consistencyRatioClass = '';
	if(calcResults.consistencyRatio < 0.11 ){
		consistencyRatioClass = 'green';
	}
	else {
		consistencyRatioClass = 'orange';
	}

	html +=	'<tr>' +
			'<td colspan="4" class = "' +
			 consistencyRatioClass +
			'">Consistency Ratio: ' +
			 this._convertRealToRoundedPercent(calcResults.consistencyRatio, 2) + 
			'</td></tr>';
	
	// the action buttons
	html +=	'<tr class="' + resultId +'" >' +
			'<td colspan="3">' +
			'<input type="button" class="retryPoll" value="Retry" />' +
			'<input type="button" class="togglePollResults" value="Hide/Show" /></td></tr>';

	html += '</table>';
	
	// display the table
	var tempDiv = document.createElement('div');
	tempDiv.innerHTML = html;
	var table = tempDiv.firstChild;
	var h3 = document.querySelector('#pollResults h3');
	h3.parentNode.insertBefore(table, h3.nextSibling);
	
	// increment the result table count
	ahp.resultCount ++;
	
	// bind events to the buttons in the new table
	ahp._addRetryEvents(resultId);
	ahp._addResultToggleEvents(resultId);
	ahp._addScaleResultsEvents();
};

/**
 * purpose: round a real number
 */
ahp._convertRealToRoundedPercent = function(num, digits){
	var e = (digits) ? digits : 4; 
	var f1 = Math.pow(10, e);
	
	// rounding will be done by adding half the last digit to last-digit + 1
	// f2 determines the position of last-digit + 1 and r is half the last digit
	var f2 = Math.pow(10, e+1);
	var r = 5 / f2;
	
	// calc rounded result
	var resultValue = ((((num + r ) * f1) + '').split('.', 1)/f1).toFixed(4);
	
	// convert to string
	resultValue = resultValue + '';
	
	return resultValue;
};

ahp._addScaleResultsEvents = function(){
	
	document.querySelectorAll('.scaleResults-new').forEach(function(button){
		button.addEventListener('click', function(){
			var scaleFactor = this.parentNode.querySelector('.resultScaleFactor').value;
			
			this.parentNode.parentNode.parentNode.querySelectorAll('.result').forEach(function(resultElement){
				var currentVal = resultElement.textContent;
				var scaledResult = resultElement.parentNode.parentNode.querySelector('.scaledResult');
				scaledResult.textContent = ahp._convertRealToRoundedPercent(currentVal * scaleFactor);
			});	
		});
	});
	
	// bind the enter key events
	document.querySelectorAll('.scaleResults-new').forEach(function(button){
		var input = button.parentNode.querySelector('.resultScaleFactor');
		if(input){
			input.addEventListener('keypress', function (e) {  
				if (e.key === 'Enter') {  
					var scaleFactor = this.value;
					
					this.parentNode.parentNode.parentNode.querySelectorAll('.result').forEach(function(resultElement){
						var currentVal = resultElement.textContent;
						var scaledResult = resultElement.parentNode.parentNode.querySelector('.scaledResult');
						scaledResult.textContent = ahp._convertRealToRoundedPercent(currentVal * scaleFactor);
					});	
				}  
			}); 
		}
	});

	document.querySelectorAll('.scaleResults-new').forEach(function(element){
		element.className = '';
	});	
};


/**
 * purpose: bind the retry event to the retry button in the result table
 */
ahp._addRetryEvents = function(resultId){
	
	// bind the button click event to the retry function
	document.querySelector('.'+ resultId + ' input.retryPoll').addEventListener('click', function(){
		ahp._retryPoll(resultId);
	});	
};

/**
 * purpose: function to toggle the display of rows in the result table.
 * This function is bound to a button in the result table.
 */
ahp._addResultToggleEvents = function(resultId){
	
	// toggle the rows
	document.querySelector('.'+ resultId + ' input.togglePollResults').addEventListener('click', function(){
		this.parentNode.parentNode.parentNode.querySelectorAll('.result_set').forEach(function(element){
			element.style.display = element.style.display === 'none' ? 'table-row' : 'none';
		});
	});	
};

/**
 * purpose: function to retry a poll. This function is bound to a button
 * in the result table.
 */
ahp._retryPoll = function(resultId){
	var poll = {};
	poll.options = [];

	// get the poll question text from the result table
	poll.question = document.querySelector('.' + resultId).parentNode.querySelector('.resultSetQuestionText').textContent;
	
	// get the poll options from the result table
	document.querySelector('.' + resultId).parentNode.querySelectorAll('.resultSetOptionText').forEach(function(element, i){
		poll.options[i] = element.textContent;
	});
	
	// reset the poll using the result question and options
	displayHelper._resetPoll(poll);
};

/**
 * purpose: setup the result array
 */
ahp._setUpResultArray = function(){
	this.resultArray = ahpArrayHelper._setUpSquareArray(this.optionArray.length);
};

/**
 * purpose: find the next pair to display. 
 * 
 * @param Array optionArray an array of poll options
 * @return Array the row and column of the next unanswered question pair
 * @return Boolean returns false if there are no more pairs
 */
ahp._getNextQuestion = function(optionArray, resultArray){
	for(var i = 0; i < optionArray.length; i++){
		for(var j = 0; j < optionArray.length; j++){
			if(resultArray[i][j] === 0){
				return [i, j];
			}
		}
	}
	return false;
};




/**
 * purpose: execute functions on document load
 */
document.addEventListener('DOMContentLoaded', function(){
	// intialize the poll
	displayHelper.initializePoll();
	
});