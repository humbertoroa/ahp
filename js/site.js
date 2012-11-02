var displayHelper = {};

/**
 * purpose: initialize the poll
 */
displayHelper.initializePoll = function(){
	
	// bind events
	$('#addOption').click(function(){
		displayHelper.addOptionToList();
	});
	
	$('.startPoll').click(function(){
		displayHelper.startPoll();
	});
	
	$('.stopPoll').click(function(){
		displayHelper.stopPoll();
	});
	
	$('.changePoll').click(function(){
		displayHelper.stopPoll();
	});
	
	// add an option to the list when the user selects the enter key
	$("#optionText").keypress(function (e) {  
         if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {  
         	// take an action
			displayHelper.addOptionToList();
         }  
     });
     
     // hide the poll results container because there are not any results yet
     $('#pollResults').hide();
};


/**
 * purpose: add an option to the option list using the string in 
 * the input field: #optionText
 */
displayHelper.addOptionToList = function(){
	var option = $('#optionText').val();
	displayHelper._addOption(option);	
};

/**
 * purpose: add an option to the option list
 * 
 * @param String option the option text
 */
displayHelper._addOption = function(option){
	if(option.length > 0){
		$('<tr class="new"><td class="index"></td><td class="option">' + option + '</td><td><a href="#" class="removeParent">[x]</a></td></tr>')
		.appendTo('#optionsList').hide().fadeIn('slow');	
		
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
	$('#optionText').val('');
	
};

/**
 * purpose: reset the poll using the values in the Object poll as the new poll values
 * 
 * @param Object poll an object with the question and options for the poll
 */
displayHelper._resetPoll = function(poll){
	// remove the existing poll options
	$('#optionsList').empty();

	// set the poll question
	$('.questionTextInput').val(poll.question);

	// set the poll options
	$.each(poll.options, function(i,n){
		console.log($(this));
		displayHelper._addOption(n);
	});
	
	// stop the poll
	displayHelper.stopPoll();
};

/**
 * purpose: bind a remove event to the remove link for an option
 */
displayHelper._bindRemoveEvents = function(){
	$('#optionsList tr.new .removeParent').click(function(){
		$(this).parent().parent().remove();
		displayHelper._updateTableIndex();
	});
	
	$('#optionsList tr.new').removeClass('new');
};
		
/**
 * purpose: function to stop a poll. This function is bound to a button.
 */
displayHelper.stopPoll = function(){
	// hide the stop poll button container
	$('.stopPoll').hide();
	
	// hide the poll questions container
	$('.changePoll, #pollQuestions').hide();
	
	// show hidden containers for setup
	$('.newOption, .removeParent, .startPoll, .setup').show('slow');
	
	// show the existing poll results
	$('#pollResults').show();
};

/**
 * purpose: function to change a poll. This allows the user to change the poll values.
 * This function is bound to a button.
 */
displayHelper.changePoll = function(){
	// hide the stop poll button container
	$('.stopPoll').hide();
	
	//show the change poll container
	$('.changePoll').show();
	
	// show the existing poll results
	$('#pollResults').show();
};

/**
 * purpose: function to start a poll. This function is bound to a button.
 */
displayHelper.startPoll = function(){
	if($('#optionsList .option').size() > 1){
		// hide the setup container
		$('.setup').hide();
		
		// display the stop poll button
		$('.stopPoll').show();
		
		// hide the existing poll results
		$('#pollResults').hide();

		// hide set up containers
		$('.newOption, .removeParent, .startPoll').hide();
		
		var pollSettings = {};
		pollSettings.optionArray = [];

		pollSettings.questionText = $('.questionTextInput').val();

		// extract the options
		var optionArray = [];
		$('#optionsList .option').each(function(i, n){
			pollSettings.optionArray[pollSettings.optionArray.length] = $(this).text();
		});
		
		pollSettings.voteType = $("input[@name='votingType']:checked").val();
		
		// start the poll
		ahp.startPoll(pollSettings);
		
	}
};

/**
 * purpose: update the option list index
 */
displayHelper._updateTableIndex = function(){
	$('#optionsList .index').each(function(index){
		$(this).html('<strong>option ' + (index+1) + ': </strong>');
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
	$('#pollQuestions').show('slow');
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
		 		$('.detailedPollButtons').hide();
		 		$('.simplePollButtons').show();
		 		break;
		 		
		 	case 'detailedVoting':
		 		$('.simplePollButtons').hide();
		 		$('.detailedPollButtons').show();
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
		$('.questionTextDisplay').text(ahp.question);
		$('.questionIndex').text('comparison '+ ahp.questionIndex +' of ' + ahp.questionTotal);
		$('#pollQuestion1').text(ahp.optionArray[nextQuestion[0]]);
		$('#pollQuestion2').text(ahp.optionArray[nextQuestion[1]]);
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
	$('.simplePollButtons input[type="button"]').each(function(){
		$(this).unbind('click');
	});

	$('.detailedPollButtons input[type="button"]').each(function(){
		$(this).unbind('click');
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
	$('.simplePollButtons #L_MuchMore').click(function(){
		ahp.recordVote(leftpair, ahp.scores.high);
	});

	$('.simplePollButtons #L_SlightlyMore').click(function(){
		ahp.recordVote(leftpair, ahp.scores.low);
	});
	
	$('.simplePollButtons #L_R_Same').click(function(){
		ahp.recordVote(leftpair, ahp.scores.eq);
	});
	
	$('.simplePollButtons #R_SlightlyMore').click(function(){
		ahp.recordVote(rightpair, ahp.scores.low);
	});
	
	$('#R_MuchMore').click(function(){
		ahp.recordVote(rightpair, ahp.scores.high);
	});
};

/**
 * purpose: bind the events to the detailed buttons
 */
ahp._bindDetailedVoteEvents = function(leftpair, rightpair){
	$('.detailedPollButtons input[type="button"].leftMore').each(function(){
		$(this).click(function(){
			ahp.recordVote(leftpair, parseInt($(this).val(), 10));
		});
	});
	
	$('.detailedPollButtons input[type="button"].rightMore').each(function(){
		$(this).click(function(){
			ahp.recordVote(rightpair, parseInt($(this).val(), 10));
		});
	});
	
	$('.detailedPollButtons input[type="button"].same').click(function(){
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
	$('#pollQuestions').hide('slow');

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
	$('table.current').removeClass('current');
	
	
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
				'<div style="background-color:blue;width:' + (resultText * 1.2 * 100) + 'px">&nbsp;</div>' + 
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
	$(html).insertAfter('#pollResults h3').hide().fadeIn('slow');
	
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
	var resultValue = (((num + r ) * f1) + '').split('.', 1)/f1;
	
	// convert to string
	resultValue = resultValue + '';
	
	return resultValue;
};

ahp._addScaleResultsEvents = function(){
	
	$('.scaleResults-new').click(function(){
		var scaleFactor = $(this).parent().find('.resultScaleFactor').get(0);
		scaleFactor = $(scaleFactor).val();
		
		$(this).parent().parent().parent().find('.result').each(function(){
			var curentVal = $(this).text();
			var scaledResult= $(this).parent().parent().find('.scaledResult').get(0);
			$(scaledResult).text(ahp._convertRealToRoundedPercent(curentVal * scaleFactor));
		});	
		
	});
	
	// bind the enter key events
	var input = $('.scaleResults-new').parent().find('.resultScaleFactor').get(0);
	$(input).keypress(function (e) {  
         if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {  
			var scaleFactor = $(this).val();
			
			$(this).parent().parent().parent().find('.result').each(function(){
				var curentVal = $(this).text();
				var scaledResult= $(this).parent().parent().find('.scaledResult').get(0);
				$(scaledResult).text(ahp._convertRealToRoundedPercent(curentVal * scaleFactor));
			});	
 
         }  
     }); 

	$('.scaleResults-new').removeClass();	
};


/**
 * purpose: bind the retry event to the retry button in the result table
 */
ahp._addRetryEvents = function(resultId){
	
	// bind the button click event to the retry function
	$('.'+ resultId + ' input.retryPoll').click(function(){
		ahp._retryPoll(resultId);
	});	
};

/**
 * purpose: function to toggle the display of rows in the result table.
 * This function is bound to a button in the result table.
 */
ahp._addResultToggleEvents = function(resultId){
	
	// toggle the rows
	$('.'+ resultId + ' input.togglePollResults').click(function(){
		$(this).parent().parent().parent().find('.result_set').toggle();
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
	poll.question = $('.' + resultId).parent().find('.resultSetQuestionText').text();
	
	// get the poll options from the result table
	$('.' + resultId).parent().find('.resultSetOptionText').each(function(i){
		poll.options[i] = $(this).text();
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
$(document).ready(function(){
	// intialize the poll
	displayHelper.initializePoll();
	
});