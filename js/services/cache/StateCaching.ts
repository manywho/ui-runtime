import Snapshot from '../Snapshot';
import store from '../../stores/store';

import { hasNoNetwork, hasNetwork } from '../../actions';
import { setStateValue } from '../../models/State';

declare const manywho: any;
declare const metaData: any;

let authenticationToken = undefined;
let timer = undefined;

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
            { id: value.valueElementId },
            value.typeElementId,
            snapshot,
            valueProps,
        );
    });
};

/**
 * @param stateId
 * @param tenantId
 * @param token
 * @description Polling the states value endpoint.
 * We do this so that the offline value state is kept up to date
 * ready for when network connectivity is lost.
 * This polling of the values endpoint is also used as a continuous
 * network check that allows us to notify users when they have
 * lost or regained network connectivity.
 */
export const pollForStateValues = (stateId: string, tenantId: string, token: string) => {
    authenticationToken = token;

    // This needs to be set in the player manually
    // or injected in when generating a Cordova app
    const pollInterval = manywho.settings.global('offline.cache.pollInterval');

    clearTimeout(timer);

    const url = `${manywho.settings.global('platform.uri')}/api/run/1/state/${stateId}/values`;

    const request = {
        headers: {
            ManyWhoTenant: tenantId,
        },
    };

    if (authenticationToken) {
        request.headers['Authorization'] = authenticationToken;
    }

    return fetch(url, request)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
            injectValuesIntoState(response);

            timer = setTimeout(
                () => { pollForStateValues(stateId, tenantId, authenticationToken); }, pollInterval,
            );

            if (!store.getState().hasNetwork) {
                store.dispatch<any>(hasNetwork());
            }
        })
        .catch(() => {
            timer = setTimeout(
                () => { pollForStateValues(stateId, tenantId, authenticationToken); }, pollInterval,
            );

            if (!store.getState().isOffline && store.getState().hasNetwork) {
                store.dispatch<any>(hasNoNetwork());
            }
        });

};
