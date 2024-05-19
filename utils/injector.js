const pendingCallbacks = {};

/**
 * Removes a pending callback from the list of pending callbacks.
 *
 * @param {Function} callback - The callback function to be removed.
 */
const removePendingCallback = (callback) => {
    delete pendingCallbacks[callback];
}

export default {
    pendingCallbacks,
    removePendingCallback
}