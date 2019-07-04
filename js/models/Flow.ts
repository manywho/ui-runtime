import { StateInit } from './State';
import { merge } from 'ramda';
import { IFlow } from '../interfaces/IModels';

declare var manywho: any;

let authenticationToken = null;
let id = null;
let objectData = null;
let requests = [];
let state = null;
let tenantId = null;

/**
 * Updates the private flow properties that represent the current flow
 * Returns an object referencing the current flow properties.
 * @param flow
 */

export const FlowInit = (flow: IFlow) => {
    authenticationToken = flow.authenticationToken;
    id = flow.id;
    objectData = flow.objectData || {};
    requests = flow.requests || [];
    tenantId = flow.tenantId;
    state = StateInit(flow.state);

    return {
        authenticationToken,
        id,
        objectData,
        requests,
        tenantId,
        state,
    };
};

/**
 * @description return current flow model in state
 */
export const getFlowModel = () => {
    return {
        authenticationToken,
        id,
        objectData,
        requests,
        tenantId,
        state,
    };
};

/**
 * @param request
 * @param snapshot
 */
export const addRequest = (request: any, snapshot: any) => {

    const currentMapElement = snapshot.metadata.mapElements.find(
        element => element.id === request.currentMapElementId,
    );
    const currentMapElementDeveloperName = currentMapElement ? currentMapElement.developerName : '';

    request.key = requests.length;
    request.currentMapElementDeveloperName = currentMapElementDeveloperName;

    requests.push({ request, assocData: null });
};

/**
 * @param request
 */
export const removeRequest = (request: any) => {
    const index = requests.indexOf(request);
    requests.splice(index, 1);
};

/**
 * Empty array of request objects
 */
export const removeRequests = () => {
    requests = [];
};

export const getRequests = () => {
    return requests;
};

/**
 * @param offlineId a randomly generated GUID that links cached requests to cached objectdata
 * @param valueId the id of a value that has objectdat bound to it
 * @param typeElementId the type id associated to objectdata linked to a request
 * @description update the assocData property of the last cached request
 */
export const setCurrentRequestOfflineId = (offlineId, valueId, typeElementId) => {
    const currentRequest = requests[requests.length - 1];
    currentRequest.assocData = { offlineId, valueId, typeElementId };
    return requests;
};

/**
 * @param typeElementId
 */
export const getObjectData = (typeElementId: string) => {
    return objectData[typeElementId];
};

/**
 * @param data
 * @param typeElementId
 */
export const cacheObjectData = (data: any, typeElementId: string) => {
    objectData[typeElementId] = data;
    return objectData;
};

/**
 * @param data
 * @param typeElementId
 */
export const patchObjectDataCache = (data: any, typeElementId: string) => {
    objectData[typeElementId] = objectData[typeElementId].map((existingObj) => {
        if (existingObj.objectData.internalId === data[0].objectData.internalId) {
            return merge(existingObj, data[0]);
        }

        return existingObj;
    });

    return objectData;
};
