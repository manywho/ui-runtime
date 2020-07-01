import Snapshot from '../Snapshot';
import store from '../../stores/store';

import { hasNoNetwork, hasNetwork } from '../../actions';
import { setStateValue } from '../../models/State';

declare const manywho: any;
declare const metaData: any;

let timer;

const snapshot: any = Snapshot(metaData);

/**
 * @param values an array of values returned from state values endpoint
 * @description refreshing the offline state with current state values
 */
const injectValuesIntoState = (values: any) => {
    values.forEach((value) => {
        const valueProps = {
            contentValue: value.contentValue,
            objectData: value.objectData,
        };
        setStateValue(
            { id: value.valueElementId, typeElementPropertyId: null },
            value.typeElementId,
            snapshot,
            valueProps,
        );
    });
};

export const pollForStateValues = () => {
    const url = `${manywho.settings.global('platform.uri')}/api/run/1/state/${store.getState().flowInformation.stateId}/values`;

    const request = {
        headers: {
            ManyWhoTenant: store.getState().flowInformation.tenantId,
        },
    };

    if (store.getState().flowInformation.token) {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        request.headers['Authorization'] = store.getState().flowInformation.token;
    }
    return fetch(url, request)
        .then((response) => {
            if (response.status === 204) {
                return null;
            }
            return response.json();
        })
        .then((response) => {
            if (response !== null) {
                injectValuesIntoState(response);
            }

            if (!store.getState().hasNetwork) {
                store.dispatch<any>(hasNetwork());
            }
            return response;
        })
        .catch(() => {
            if (!store.getState().isOffline && store.getState().hasNetwork) {
                store.dispatch<any>(hasNoNetwork());
            }
        });
};

/**
 * @description Polling the states value endpoint.
 * We do this so that the offline value state is kept up to date
 * ready for when network connectivity is lost.
 * This polling of the values endpoint is also used as a continuous
 * network check that allows us to notify users when they have
 * lost or regained network connectivity.
 */
export const periodicallyPollForStateValues = () => {
    // This needs to be set in the player manually
    // or injected in when generating a Cordova app
    const pollInterval = manywho.settings.global('offline.cache.pollInterval');

    clearTimeout(timer);

    timer = setTimeout(
        () => { periodicallyPollForStateValues().catch((e) => console.error(e)); }, pollInterval,
    );

    return pollForStateValues()
        .then((response) => response)
        .catch((e) => console.error(e));
};
