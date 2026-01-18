import { ahp } from './ahp.js';
import { pollStorage } from './pollStorage.js';

export const displayHelper = {};

/**
 * purpose: display an error message to the user
 *
 * @param {String} message the error message to display
 */
displayHelper._showError = (message) => {
    let errorDiv = document.getElementById('errorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage';
        const container = document.querySelector('.container');
        container.insertBefore(errorDiv, container.firstChild);
    }
    errorDiv.textContent = `⚠ Error: ${message}`;
    errorDiv.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
};

/**
 * purpose: hide the error message
 */
displayHelper._hideError = () => {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
};

/**
 * purpose: check if an option already exists in the options list
 *
 * @param {String} option the option text to check
 * @return {Boolean} true if duplicate exists, false otherwise
 */
displayHelper._isDuplicateOption = (option) => {
    let isDuplicate = false;
    document.querySelectorAll('#optionsList .option').forEach((element) => {
        if (element.textContent.toLowerCase() === option.toLowerCase()) {
            isDuplicate = true;
        }
    });
    return isDuplicate;
};

/**
 * purpose: initialize the poll
 */
displayHelper.initializePoll = () => {

    // bind events only to elements that exist
    const addOptionBtn = document.getElementById('addOption');
    if (addOptionBtn) {
        addOptionBtn.addEventListener('click', () => {
            displayHelper.addOptionToList();
        });
    }

    const addMultiOptionsBtn = document.getElementById('addMultiOptions');
    if (addMultiOptionsBtn) {
        addMultiOptionsBtn.addEventListener('click', () => {
            displayHelper.addMultiOptionsToList();
        });
    }

    document.querySelectorAll('.startPoll').forEach((element) => {
        element.addEventListener('click', () => {
            displayHelper.startPoll();
        });
    });

    document.querySelectorAll('.stopPoll').forEach((element) => {
        element.addEventListener('click', () => {
            displayHelper.stopPoll();
        });
    });

    document.querySelectorAll('.changePoll').forEach((element) => {
        element.addEventListener('click', () => {
            displayHelper.stopPoll();
        });
    });

    // add an option to the list when the user selects the enter key
    const optionTextInput = document.getElementById('optionText');
    if (optionTextInput) {
        optionTextInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                // take an action
                displayHelper.addOptionToList();
            }
        });
    }

    // Save question text to localStorage when it changes (with debouncing)
    const questionTextInput = document.querySelector('.questionTextInput');
    let questionSaveTimeout;
    if (questionTextInput) {
        questionTextInput.addEventListener('input', () => {
            clearTimeout(questionSaveTimeout);
            questionSaveTimeout = setTimeout(() => {
                pollStorage.savePollState();
            }, 500); // Wait 500ms after user stops typing
        });
    }

    // Only hide the poll results container if there are no saved results
    const savedResults = pollStorage.loadResults();
    if (savedResults.length === 0) {
        document.getElementById('pollResults').style.display = 'none';
    } else {
        document.getElementById('pollResults').style.display = 'block';
    }
};


/**
 * purpose: add an option to the option list using the string in
 * the input field: #optionText
 */
displayHelper.addOptionToList = () => {
    const optionTextInput = document.getElementById('optionText');
    if (optionTextInput) {
        const option = optionTextInput.value;
        displayHelper._addOption(option);
    }
};

/**
 * purpose: add multiple options to the option list using the strings in
 * the textarea: #multiOptionText
 */
displayHelper.addMultiOptionsToList = () => {
    // split the options from the textarea
    const options = document.getElementById('multiOptionText').value;
    const optionArray = options.split('\n');

    // add each option
    optionArray.forEach((option) => {
        displayHelper._addOption(option);
    });

    // clear the textarea
    document.getElementById('multiOptionText').value = '';

};

/**
 * purpose: add an option to the option list
 *
 * @param {String} option the option text
 */
displayHelper._addOption = (option) => {

    option = option.trim();

    // Validate option is not empty
    if (option.length === 0) {
        return; // Silently ignore empty options
    }

    // Check for duplicate options
    if (displayHelper._isDuplicateOption(option)) {
        displayHelper._showError(`Duplicate option: "${option}" already exists.`);
        return;
    }

    const row = document.createElement('tr');
    row.className = 'new fade-in';
    row.innerHTML = `<td class="index"></td><td class="option">${option}</td><td><a href="#" class="removeParent">[x]</a></td>`;
    document.getElementById('optionsList').appendChild(row);

    // Trigger reflow to enable transition
    void row.offsetWidth;
    row.classList.add('visible');

    // clear the option text
    displayHelper._resetOptionInputText();

    // bind the remove event to the delete button
    displayHelper._bindRemoveEvents();

    // update the table index. This will renumber the table rows.
    displayHelper._updateTableIndex();

    // Save state to localStorage
    pollStorage.savePollState();
};

/**
 * purpose: clear the text in the input: #optionText
 */
displayHelper._resetOptionInputText = () => {
    const optionTextInput = document.getElementById('optionText');
    if (optionTextInput) {
        optionTextInput.value = '';
    }
};

/**
 * purpose: reset the poll using the values in the Object poll as the new poll values
 *
 * @param {Object} poll an object with the question and options for the poll
 */
displayHelper._resetPoll = (poll) => {
    // remove the existing poll options
    document.getElementById('optionsList').innerHTML = '';

    // set the poll question
    document.querySelector('.questionTextInput').value = poll.question;

    // set the poll options
    poll.options.forEach((option) => {
        displayHelper._addOption(option);
    });

    // stop the poll
    displayHelper.stopPoll();
};

/**
 * purpose: bind a remove event to the remove link for an option
 */
displayHelper._bindRemoveEvents = () => {
    document.querySelectorAll('#optionsList tr.new .removeParent').forEach((element) => {
        element.addEventListener('click', function() {
            this.parentNode.parentNode.remove();
            displayHelper._updateTableIndex();
            // Save state after removing option
            pollStorage.savePollState();
        });
    });

    document.querySelectorAll('#optionsList tr.new').forEach((element) => {
        element.classList.remove('new');
        element.classList.remove('fade-in');
        element.classList.remove('visible');
    });
};

/**
 * purpose: function to stop a poll. This function is bound to a button.
 */
displayHelper.stopPoll = () => {
    // hide the stop poll button container
    document.querySelectorAll('.stopPoll').forEach((element) => {
        element.style.display = 'none';
    });

    // hide the poll questions container
    document.querySelectorAll('.changePoll').forEach((element) => {
        element.style.display = 'none';
    });
    document.getElementById('pollQuestions').style.display = 'none';

    // show hidden containers for setup
    document.querySelectorAll('.newOption, .removeParent, .startPoll, .setup').forEach((element) => {
        element.style.display = 'block';
    });

    // show the existing poll results
    document.getElementById('pollResults').style.display = 'block';
};

/**
 * purpose: function to change a poll. This allows the user to change the poll values.
 * This function is bound to a button.
 */
displayHelper.changePoll = () => {
    // hide the stop poll button container
    document.querySelectorAll('.stopPoll').forEach((element) => {
        element.style.display = 'none';
    });

    //show the change poll container
    document.querySelectorAll('.changePoll').forEach((element) => {
        element.style.display = 'block';
    });

    // show the existing poll results
    document.getElementById('pollResults').style.display = 'block';
};

/**
 * purpose: function to start a poll. This function is bound to a button.
 */
displayHelper.startPoll = () => {
    // Get question text and trim it
    const questionText = document.querySelector('.questionTextInput').value.trim();
    const optionCount = document.querySelectorAll('#optionsList .option').length;

    // Validate question text
    if (questionText.length === 0) {
        displayHelper._showError('Please enter a question before starting the poll.');
        return;
    }

    // Validate minimum number of options
    if (optionCount < 2) {
        displayHelper._showError(`Please add at least 2 options to compare. Currently you have ${optionCount} option(s).`);
        return;
    }

    // Hide error message if validation passes
    displayHelper._hideError();

    // hide the setup container
    document.querySelectorAll('.setup').forEach((element) => {
        element.style.display = 'none';
    });

    // display the stop poll button
    document.querySelectorAll('.stopPoll').forEach((element) => {
        element.style.display = 'block';
    });

    // hide the existing poll results
    document.getElementById('pollResults').style.display = 'none';

    // hide set up containers
    document.querySelectorAll('.newOption, .removeParent, .startPoll').forEach((element) => {
        element.style.display = 'none';
    });

    const pollSettings = {};
    pollSettings.optionArray = [];

    pollSettings.questionText = questionText;

    // extract the options
    document.querySelectorAll('#optionsList .option').forEach((element) => {
        pollSettings.optionArray.push(element.textContent);
    });

    //pollSettings.voteType = document.querySelector("input[name='votingType']:checked").value;
    pollSettings.voteType = "simpleVoting";

    // start the poll
    ahp.startPoll(pollSettings);

    // Save state to localStorage
    pollStorage.savePollState();
};

/**
 * purpose: update the option list index
 */
displayHelper._updateTableIndex = () => {
    document.querySelectorAll('#optionsList .index').forEach((element, index) => {
        element.innerHTML = `<strong>option ${index+1}: </strong>`;
    });
};