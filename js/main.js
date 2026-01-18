import { displayHelper } from './displayHelper.js';
import { pollStorage } from './pollStorage.js';

/**
 * purpose: execute functions on document load
 */
document.addEventListener('DOMContentLoaded', () => {
    // intialize the poll
    displayHelper.initializePoll();

    // restore saved poll results from localStorage
    pollStorage.restoreResults();

    // restore poll state from localStorage if available
    pollStorage.restorePollState();
});