import { ahp } from './ahp.js';
import { displayHelper } from './displayHelper.js';

/**
 * Local Storage Manager
 * Handles saving and loading poll state to/from localStorage
 */
export const pollStorage = {
    STORAGE_KEY: 'ahp_poll_state',
    RESULTS_KEY: 'ahp_poll_results',

    /**
     * purpose: save current poll state to localStorage
     */
    savePollState: function() {
        try {
            const state = {
                // Poll setup
                question: ahp.question || '',
                options: ahp.optionArray || [],

                // Active poll state
                isActive: document.getElementById('pollQuestions').style.display !== 'none',
                questionIndex: ahp.questionIndex || 1,
                questionTotal: ahp.questionTotal || 0,
                resultArray: ahp.resultArray || [],
                voteType: document.querySelector('.simplePollButtons') &&
                    document.querySelector('.simplePollButtons').style.display !== 'none' ?
                    'simpleVoting' : 'detailedVoting',

                // Result count for numbering result sets
                resultCount: ahp.resultCount || 1,

                // Save timestamp
                timestamp: new Date().toISOString()
            };

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Failed to save poll state:', e);
        }
    },

    /**
     * purpose: load poll state from localStorage
     * @return {Object|null} the saved state or null if none exists
     */
    loadPollState: function() {
        try {
            const stateJson = localStorage.getItem(this.STORAGE_KEY);
            if (stateJson) {
                return JSON.parse(stateJson);
            }
        } catch (e) {
            console.error('Failed to load poll state:', e);
        }
        return null;
    },

    /**
     * purpose: clear saved poll state from localStorage
     */
    clearPollState: function() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (e) {
            console.error('Failed to clear poll state:', e);
        }
    },

    /**
     * purpose: restore poll state from localStorage
     */
    restorePollState: function() {
        const state = this.loadPollState();
        if (!state) {
            return false;
        }

        // Restore options to the list
        if (state.options && state.options.length > 0) {
            state.options.forEach((option) => {
                displayHelper._addOption(option);
            });
        }

        // Restore question text
        if (state.question) {
            document.querySelector('.questionTextInput').value = state.question;
        }

        // Restore result count
        if (state.resultCount) {
            ahp.resultCount = state.resultCount;
        }

        // If poll was active, restore the active state
        if (state.isActive && state.options && state.options.length > 1) {
            // Set up poll data
            ahp.question = state.question;
            ahp.optionArray = state.options;
            ahp.resultArray = state.resultArray || [];
            ahp.questionIndex = state.questionIndex || 1;
            ahp.questionTotal = state.questionTotal || 0;

            // Restore voting type
            const pollSettings = {
                voteType: state.voteType || 'simpleVoting'
            };
            ahp._setVotingType(pollSettings);

            // Show poll questions UI
            document.getElementById('pollQuestions').style.display = 'block';

            // Hide setup containers
            document.querySelectorAll('.setup').forEach((element) => {
                element.style.display = 'none';
            });

            // Show stop poll button
            document.querySelectorAll('.stopPoll').forEach((element) => {
                element.style.display = 'block';
            });

            // Hide setup buttons and links
            document.querySelectorAll('.newOption, .removeParent, .startPoll').forEach((element) => {
                element.style.display = 'none';
            });

            // Hide results
            document.getElementById('pollResults').style.display = 'none';

            // Display the current question
            ahp._displayNextQuestion();
        }

        return true;
    },

    /**
     * purpose: save a poll result to localStorage
     * @param {Object} resultData - the result data to save
     */
    saveResult: function(resultData) {
        try {
            const results = this.loadResults();
            results.push(resultData);
            localStorage.setItem(this.RESULTS_KEY, JSON.stringify(results));
        } catch (e) {
            console.error('Failed to save result:', e);
        }
    },

    /**
     * purpose: load all poll results from localStorage
     * @return {Array} array of saved results
     */
    loadResults: function() {
        try {
            const resultsJson = localStorage.getItem(this.RESULTS_KEY);
            if (resultsJson) {
                return JSON.parse(resultsJson);
            }
        } catch (e) {
            console.error('Failed to load results:', e);
        }
        return [];
    },

    /**
     * purpose: delete a specific result from localStorage
     * @param {String} resultId - the ID of the result to delete
     */
    deleteResult: function(resultId) {
        try {
            let results = this.loadResults();
            results = results.filter((result) => {
                return result.id !== resultId;
            });
            localStorage.setItem(this.RESULTS_KEY, JSON.stringify(results));
        } catch (e) {
            console.error('Failed to delete result:', e);
        }
    },

    /**
     * purpose: clear all results from localStorage
     */
    clearAllResults: function() {
        try {
            localStorage.removeItem(this.RESULTS_KEY);
        } catch (e) {
            console.error('Failed to clear results:', e);
        }
    },

    /**
     * purpose: restore all saved results from localStorage and display them
     */
    restoreResults: function() {
        const results = this.loadResults();
        if (results.length === 0) {
            return;
        }

        // Display results in order
        results.forEach((resultData) => {
            this._renderSavedResult(resultData);
        });

        // Update ahp.resultCount to continue numbering from the highest saved result
        const maxResultNumber = Math.max.apply(Math, results.map((r) => {
            return r.resultSetNumber;
        }));
        ahp.resultCount = maxResultNumber + 1;
    },

    /**
     * purpose: render a saved result from localStorage data
     * @param {Object} resultData - the saved result data
     */
    _renderSavedResult: function(resultData) {
        let html = '';
        const resultId = resultData.id;

        // remove the current class from existing result tables
        document.querySelectorAll('table.current').forEach((element) => {
            element.classList.remove('current');
        });

        html += '<table class="current pollResultTable">';

        // the question text
        html += '<tr>' +
            '<td colspan="4" class="titleRow">Result Set #' +
            resultData.resultSetNumber +
            ': ' +
            '<span class="resultSetQuestionText">' +
            resultData.question +
            ' </span>' +
            '</td></tr>';

        html += '<tr class="result_set resultColumnTitle">' +
            '<td>Option</td>' +
            '<td>Result</td>' +
            '<td>Scaled <br /> Result</td>' +
            '<td>&nbsp</td>' +
            '</tr>';

        // the option text and result values
        for (let i = 0; i < resultData.options.length; i++) {
            const resultText = ahp._convertRealToRoundedPercent(resultData.results[i]);

            html += '<tr class="result_set" >' +
                '<td>' +
                // option title
                '<span class="resultSetOptionText">' + resultData.options[i] + '</span>' +
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

        // scale factor input
        html += '<tr class="result_set">' +
            '<td colspan="2" style="text-align: right;">&nbsp;</td>' +
            '<td colspan="2" style="text-align: left;">' +
            '<input size="4" style="text-align: right;" class="resultScaleFactor" value="1"/>' +
            '<button style="text-align: right;" class="scaleResults-new">Scale</button>' +
            '</td></tr>';

        // the consistency calculation
        let consistencyRatioClass = '';
        if (resultData.consistencyRatio < 0.11) {
            consistencyRatioClass = 'green';
        } else {
            consistencyRatioClass = 'orange';
        }

        html += '<tr>' +
            '<td colspan="4" class = "' +
            consistencyRatioClass +
            '">Consistency Ratio: ' +
            ahp._convertRealToRoundedPercent(resultData.consistencyRatio, 2) +
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

        // bind events to the buttons in the restored table
        ahp._addRetryEvents(resultId);
        ahp._addResultToggleEvents(resultId);
        ahp._addScaleResultsEvents();
        ahp._addDeleteResultEvents(resultId);
    }
};