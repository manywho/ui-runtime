import { getFlowModel } from '../models/Flow';

declare const manywho;

export const isOffline = result => ({
    type: 'IS_OFFLINE',
    payload: result,
});

export const hasNetwork = () => {
    return (dispatch) => {

        const flow = getFlowModel();
        const flowKey = manywho.utils.getFlowKey(
            flow.tenantId,
            flow.id.id,
            flow.id.versionId,
            flow.state.id,
            'main',
        );

        manywho.model.addNotification(flowKey, {
            message: 'You are back online',
            position: 'left',
            type: 'success',
            dismissible: true,
        });

        dispatch({
            type: 'HAS_NETWORK',
        });
    };
};

export const hasNoNetwork = () => {
    return (dispatch) => {

        const flow = getFlowModel();
        const flowKey = manywho.utils.getFlowKey(
            flow.tenantId,
            flow.id.id,
            flow.id.versionId,
            flow.state.id,
            'main',
        );

        manywho.model.addNotification(flowKey, {
            message: 'You are now offline',
            position: 'left',
            type: 'danger',
            dismissible: true,
        });

        dispatch({
            type: 'HAS_NO_NETWORK',
        });
    };
};

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
