import { setStateValue } from '../../models/State';
import Snapshot from '../Snapshot';
import store from '../../stores/store';

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
 * @description making a GET call to the states value endpoint
 */
export const pollForStateValues = (stateId: string, tenantId: string, token: string) => {
    authenticationToken = token;

    // This needs to be set in the player manually
    // or injected in when generating a Cordova app
    const pollInterval = manywho.settings.global('offline.cache.pollInterval');

    clearTimeout(timer);

    if (!store.getState().isOffline) { // only poll api whilst online
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

                // This is so the flow can perioically poll for the latest values
                // in case values have changed from a user joining the state
                timer = setTimeout(
                    () => { pollForStateValues(stateId, tenantId, authenticationToken); }, pollInterval,
                );
            })
            .catch(response => console.error(response));
    }
};
