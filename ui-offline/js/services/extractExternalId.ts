/**
 * extractExternalId module.
 * @module services/extractExternalId
 * @description This module solves the problem of saving objectdata
 * that should already exist inside a service. An example scenario
 * would be a flow that enables CRUD operations on Salesforce leads.
 * When a save data action is simulated for creating a new lead it is impossible
 * to assign that lead an external ID (for obvious reasons). Consequently, if that lead is then
 * updated whilst still offline the objectdata sent in the request will have
 * an external ID of null, causing a service error when the request is replayed.
 * The solution here is that during the save data action simulation newly cached objectdata
 * gets associated to the request that triggers it using a generated GUID. All subsequent requests that trigger
 * modification of the cached objectdata will also get tagged with the GUID.
 * So after the request that initially triggered the caching of that objectdata is replayed,
 * the state of the value the objectdata is bound to can be queried to determine the external ID
 * the engine has assigned to it at that exact point in the flow. This external ID can
 * then be injected into every other associated request.
 *
 * CAVEAT: For this solution to work, in the flow, the value cannot be emptied immediately after the save.
 */

import { getRequests, getObjectData } from '../models/Flow';

declare const manywho;

interface IassocData {
    offlineId: string;
    valueId: string;
    typeElementId: string;
}

/**
 * @param assocData an object containing a GUID that links requests to objectdata
 * @param externalId the ID assigned to a value that represents a service record
 * @description finding all cached requests that have an association with cached
 * objectdata and injecting the external id into the request body if applicable.
 */
export const checkForRequestsThatNeedAnExternalId = (assocData: IassocData, externalId: string) => {

    // Find the objectdata in the cache that is associated to the request
    const objectData = getObjectData(assocData.typeElementId);
    const assocObject = objectData.filter((obj) => obj.assocData).find((obj) => obj.assocData.offlineId === assocData.offlineId);

    // Extract it's internalId
    const assocObjectInternalId = assocObject.objectData.internalId;

    // Then find every request that has a page input response that has specified objectdata
    // where an object has an enternal id of null and has a matching internal id to the object
    const allRequests = getRequests();
    allRequests.forEach((request) => {
        const inputResponses = request.request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses;
        inputResponses.forEach((inputResponse) => {
            if (inputResponse.objectData && inputResponse.objectData.length > 0) {
                inputResponse.objectData.forEach((obj) => {
                    if (obj.externalId === null && obj.internalId === assocObjectInternalId) {

                        // Update the matching object data with the external id
                        obj.externalId = externalId;
                    }
                });
            }
        });
    });

    return allRequests;
};

/**
 * @param request the cached request to be replayed
 * @param tenantId
 * @param authenticationToken
 * @param stateId
 * @description make a call to the state values endpoint if the cached request is associated
 * to cached objectdata, in order to extract the values external ID.
 */
const extractExternalId = (request: any, tenantId: string, authenticationToken: string, stateId: string) => {

    if (request.assocData) {
        const { valueId } = request.assocData;
        const url = `${manywho.settings.global('platform.uri')}/api/run/1/state/${stateId}/values/${valueId}`;
        const valueRequest = {
            headers: {
                ManyWhoTenant: tenantId,
                // Public flows have no Authorization header. Supplying the header with a null value does not work.
            },
        };
        if (authenticationToken) {
             
            valueRequest.headers['Authorization'] = authenticationToken;
        }
        return fetch(url, valueRequest)
            .then((response) => response.json())
            .then((response) => {

                checkForRequestsThatNeedAnExternalId(
                    request.assocData,
                    response.objectData[0].externalId,
                );
                return response;
            })
            .catch((response) => console.error(response));
    }

    return Promise.resolve();
};

export default extractExternalId;
