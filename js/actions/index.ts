declare const manywho;

export const isOffline = result => ({
    type: 'is_OFFLINE',
    payload: result,
});

export const isReplaying = result => ({
    type: 'IS_REPLAYING',
    payload: result,
});

export const setCachingProgress = result => ({
    type: 'CACHE_PROGRESS',
    payload: result,
});

export const cachingProgress = (result) => {
    const progress = result.progress;
    const flowKey = result.flowKey;
    return (dispatch) => {
        if (progress === 100 && flowKey) {
            manywho.model.addNotification(flowKey, {
                message: 'Caching is complete. You are ready to go offline',
                position: 'bottom',
                type: 'success',
                dismissible: true,
            });
            dispatch(setCachingProgress(0));
        } else {
            dispatch(setCachingProgress(progress));
        }
    };
};
