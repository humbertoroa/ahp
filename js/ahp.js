import { ahpArrayHelper } from './ahpArrayHelper.js';
import { ahpCalc } from './ahpCalc.js';
import { displayHelper } from './displayHelper.js';
import { pollStorage } from './pollStorage.js';

export const ahp = {};

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
ahp.scores = {
    eq: 1,
    low: 2,
    high: 4
};

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
 * @param {Array} optionArray the options to be presented as pairs for voting
 * @param {String} questionText the question
 */
ahp.startPoll = (pollSettings) => {
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
ahp._initializeQuestionCount = () => {
    ahp.questionIndex = 1;
    ahp.questionTotal = ((ahp.optionArray.length * ahp.optionArray.length) - ahp.optionArray.length) / 2;
};

/**
 * purpose: hide/show vote buttons based on voteType
 *
 * @param {Object} pollSettings
 */
ahp._setVotingType = (pollSettings) => {
    if (pollSettings.voteType) {
        switch (pollSettings.voteType) {
            case 'simpleVoting':
                document.querySelectorAll('.detailedPollButtons').forEach((element) => {
                    element.style.display = 'none';
                });
                document.querySelectorAll('.simplePollButtons').forEach((element) => {
                    element.style.display = 'table-row';
                });
                break;

            case 'detailedVoting':
                document.querySelectorAll('.simplePollButtons').forEach((element) => {
                    element.style.display = 'none';
                });
                document.querySelectorAll('.detailedPollButtons').forEach((element) => {
                    element.style.display = 'table-row';
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
ahp._displayNextQuestion = () => {
    // get the next pair
    const nextQuestion = ahp._getNextQuestion(ahp.optionArray, ahp.resultArray);

    if (nextQuestion !== false) {
        // display the pair
        document.querySelector('.questionTextDisplay').textContent = ahp.question;
        document.querySelector('.questionIndex').textContent = `comparison ${ahp.questionIndex} of ${ahp.questionTotal}`;
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
ahp._unbindVoteEvents = () => {
    document.querySelectorAll('.simplePollButtons input[type="button"]').forEach((element) => {
        element.replaceWith(element.cloneNode(true));
    });

    document.querySelectorAll('.detailedPollButtons input[type="button"]').forEach((element) => {
        element.replaceWith(element.cloneNode(true));
    });
};

/**
 * purpose: bind the events to the voting buttons
 */
ahp._bindVoteEvents = (nextQuestionArr) => {
    ahp._unbindVoteEvents();

    const leftpair = nextQuestionArr;
    const rightpair = [nextQuestionArr[1], nextQuestionArr[0]];

    ahp._bindSimpleVoteEvents(leftpair, rightpair);
    ahp._bindDetailedVoteEvents(leftpair, rightpair);
};

/**
 * purpose: bind the events to the simple buttons
 */
ahp._bindSimpleVoteEvents = (leftpair, rightpair) => {
    document.querySelector('.simplePollButtons #L_MuchMore').addEventListener('click', () => {
        ahp.recordVote(leftpair, ahp.scores.high);
    });

    document.querySelector('.simplePollButtons #L_SlightlyMore').addEventListener('click', () => {
        ahp.recordVote(leftpair, ahp.scores.low);
    });

    document.querySelector('.simplePollButtons #L_R_Same').addEventListener('click', () => {
        ahp.recordVote(leftpair, ahp.scores.eq);
    });

    document.querySelector('.simplePollButtons #R_SlightlyMore').addEventListener('click', () => {
        ahp.recordVote(rightpair, ahp.scores.low);
    });

    document.getElementById('R_MuchMore').addEventListener('click', () => {
        ahp.recordVote(rightpair, ahp.scores.high);
    });
};

/**
 * purpose: bind the events to the detailed buttons
 */
ahp._bindDetailedVoteEvents = (leftpair, rightpair) => {
    document.querySelectorAll('.detailedPollButtons input[type="button"].leftMore').forEach((element) => {
        element.addEventListener('click', function() {
            ahp.recordVote(leftpair, parseInt(this.value, 10));
        });
    });

    document.querySelectorAll('.detailedPollButtons input[type="button"].rightMore').forEach((element) => {
        element.addEventListener('click', function() {
            ahp.recordVote(rightpair, parseInt(this.value, 10));
        });
    });

    document.querySelector('.detailedPollButtons input[type="button"].same').addEventListener('click', () => {
        ahp.recordVote(leftpair, 1);
    });
};


/**
 * purpose: record a vote
 *
 * @param {Array} pair the index of the questions in optionArray
 * @param {Integer} score the value of the vote
 */
ahp.recordVote = (pair, score) => {
    console.log(pair, score);

    // record the scores
    ahp.resultArray[pair[0]][pair[1]] = score;
    ahp.resultArray[pair[1]][pair[0]] = 1 / score;

    // increment the question index
    ahp.questionIndex++;

    // display the next pair
    ahp._displayNextQuestion();

    // Save state to localStorage after recording vote
    pollStorage.savePollState();
};

/**
 * purpose: calculate the results
 */
ahp._calculateResult = () => {
    console.log('calculating results ...');

    // hide questions
    document.getElementById('pollQuestions').style.display = 'none';

    // calc results
    const calcResults = ahpCalc.calculateResults(ahp.resultArray);

    // display the results
    ahp._displayResults(calcResults);

    displayHelper.changePoll();

    // Clear active poll state from localStorage since poll is now complete
    // Only keep the setup (question and options) for potential retry
    pollStorage.savePollState();
};

/**
 * purpose: display the result table
 */
ahp._displayResults = (calcResults) => {
    let html = '';
    const resultId = 'result_set_' + ahp.resultCount;

    // remove the current class from existing result tables
    document.querySelectorAll('table.current').forEach((element) => {
        element.classList.remove('current');
    });


    html += '<table class="current pollResultTable">';

    // the question text
    html += '<tr>' +
        '<td colspan="4" class="titleRow">Result Set #' +
        ahp.resultCount +
        ': ' +
        '<span class="resultSetQuestionText">' +
        ahp.question +
        ' </span>' +
        '</td></tr>';

    html += '<tr class="result_set resultColumnTitle">' +
        '<td>Option</td>' +
        '<td>Result</td>' +
        '<td>Scaled <br /> Result</td>' +
        '<td>&nbsp</td>' +
        '</tr>';

    // the option text and result values
    for (let i = 0; i < ahp.optionArray.length; i++) {

        const resultText = ahp._convertRealToRoundedPercent(calcResults.resultColumn[i]);

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
    html += '<tr class="result_set">' +
        '<td colspan="2" style="text-align: right;">&nbsp;</td>' +
        '<td colspan="2" style="text-align: left;">' +
        '<input size="4" style="text-align: right;" class="resultScaleFactor" value="1"/>' +
        '<button style="text-align: right;" class="scaleResults-new">Scale</button>' +
        '</td></tr>';

    // the consistancy calculation
    let consistencyRatioClass = '';
    if (calcResults.consistencyRatio < 0.11) {
        consistencyRatioClass = 'green';
    } else {
        consistencyRatioClass = 'orange';
    }

    html += '<tr>' +
        '<td colspan="4" class = "' +
        consistencyRatioClass +
        '">Consistency Ratio: ' +
        ahp._convertRealToRoundedPercent(calcResults.consistencyRatio, 2) +
        '</td></tr>';

    // the action buttons
    html += '<tr class="' + resultId + '" >' +
        '<td colspan="3">' +
        '<input type="button" class="retryPoll" value="Retry" />' +
        '<input type="button" class="togglePollResults" value="Hide/Show" />' +
        '<input type="button" class="deleteResult" value="Delete" style="background-color: #ffcccc; color: #cc0000;" /></td></tr>';

    html += '</table>';

    // display the table
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const table = tempDiv.firstChild;
    const h3 = document.querySelector('#pollResults h3');
    h3.parentNode.insertBefore(table, h3.nextSibling);

    // Save result data to localStorage
    const resultData = {
        id: resultId,
        resultSetNumber: ahp.resultCount,
        question: ahp.question,
        options: ahp.optionArray.slice(), // copy array
        results: calcResults.resultColumn.slice(),
        consistencyRatio: calcResults.consistencyRatio,
        timestamp: new Date().toISOString()
    };
    pollStorage.saveResult(resultData);

    // increment the result table count
    ahp.resultCount++;

    // bind events to the buttons in the new table
    ahp._addRetryEvents(resultId);
    ahp._addResultToggleEvents(resultId);
    ahp._addScaleResultsEvents();
    ahp._addDeleteResultEvents(resultId);
};

/**
 * purpose: round a real number
 */
ahp._convertRealToRoundedPercent = (num, digits) => {
    const e = (digits) ? digits : 4;
    const f1 = Math.pow(10, e);

    // rounding will be done by adding half the last digit to last-digit + 1
    // f2 determines the position of last-digit + 1 and r is half the last digit
    const f2 = Math.pow(10, e + 1);
    const r = 5 / f2;

    // calc rounded result
    let resultValue = ((((num + r) * f1) + '').split('.', 1) / f1).toFixed(4);

    // convert to string
    resultValue = resultValue + '';

    return resultValue;
};

ahp._addScaleResultsEvents = () => {

    document.querySelectorAll('.scaleResults-new').forEach((button) => {
        button.addEventListener('click', function() {
            const scaleFactor = this.parentNode.querySelector('.resultScaleFactor').value;

            this.parentNode.parentNode.parentNode.querySelectorAll('.result').forEach((resultElement) => {
                const currentVal = resultElement.textContent;
                const scaledResult = resultElement.parentNode.parentNode.querySelector('.scaledResult');
                scaledResult.textContent = ahp._convertRealToRoundedPercent(currentVal * scaleFactor);
            });
        });
    });

    // bind the enter key events
    document.querySelectorAll('.scaleResults-new').forEach((button) => {
        const input = button.parentNode.querySelector('.resultScaleFactor');
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const scaleFactor = this.value;

                    this.parentNode.parentNode.parentNode.querySelectorAll('.result').forEach((resultElement) => {
                        const currentVal = resultElement.textContent;
                        const scaledResult = resultElement.parentNode.parentNode.querySelector('.scaledResult');
                        scaledResult.textContent = ahp._convertRealToRoundedPercent(currentVal * scaleFactor);
                    });
                }
            });
        }
    });

    document.querySelectorAll('.scaleResults-new').forEach((element) => {
        element.className = '';
    });
};


/**
 * purpose: bind the retry event to the retry button in the result table
 */
ahp._addRetryEvents = (resultId) => {

    // bind the button click event to the retry function
    document.querySelector('.' + resultId + ' input.retryPoll').addEventListener('click', () => {
        ahp._retryPoll(resultId);
    });
};

/**
 * purpose: function to toggle the display of rows in the result table.
 * This function is bound to a button in the result table.
 */
ahp._addResultToggleEvents = (resultId) => {

    // toggle the rows
    document.querySelector('.' + resultId + ' input.togglePollResults').addEventListener('click', function() {
        this.parentNode.parentNode.parentNode.querySelectorAll('.result_set').forEach((element) => {
            element.style.display = element.style.display === 'none' ? 'table-row' : 'none';
        });
    });
};

/**
 * purpose: bind the delete event to the delete button in the result table
 * @param {String} resultId - the ID of the result set
 */
ahp._addDeleteResultEvents = (resultId) => {
    document.querySelector('.' + resultId + ' input.deleteResult').addEventListener('click', function() {
        // Confirm deletion
        if (confirm('Are you sure you want to delete this result?')) {
            // Remove from DOM
            const table = this.closest('table.pollResultTable');
            if (table) {
                table.remove();
            }

            // Remove from localStorage
            pollStorage.deleteResult(resultId);
        }
    });
};

/**
 * purpose: function to retry a poll. This function is bound to a button
 * in the result table.
 */
ahp._retryPoll = (resultId) => {
    const poll = {};
    poll.options = [];

    // get the poll question text from the result table
    poll.question = document.querySelector('.' + resultId).parentNode.querySelector('.resultSetQuestionText').textContent;

    // get the poll options from the result table
    document.querySelector('.' + resultId).parentNode.querySelectorAll('.resultSetOptionText').forEach((element, i) => {
        poll.options[i] = element.textContent;
    });

    // reset the poll using the result question and options
    displayHelper._resetPoll(poll);
};

/**
 * purpose: setup the result array
 */
ahp._setUpResultArray = function() {
    this.resultArray = ahpArrayHelper._setUpSquareArray(this.optionArray.length);
};

/**
 * purpose: find the next pair to display.
 *
 * @param {Array} optionArray an array of poll options
 * @return {Array} the row and column of the next unanswered question pair
 * @return {Boolean} returns false if there are no more pairs
 */
ahp._getNextQuestion = (optionArray, resultArray) => {
    for (let i = 0; i < optionArray.length; i++) {
        for (let j = 0; j < optionArray.length; j++) {
            if (resultArray[i][j] === 0) {
                return [i, j];
            }
        }
    }
    return false;
};