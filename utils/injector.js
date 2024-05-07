const pendingCallbacks = {};

const removePendingCallback = (callback) => {
    delete pendingCallbacks[callback];
}

export default {
    pendingCallbacks,
    removePendingCallback
}