import { IFlow } from '../../interfaces/IModels';
import { cacheObjectData } from '../../models/Flow';
import store from '../../stores/store';
import { cachingProgress } from '../../actions';
import OnCached from './OnCached';

declare const manywho: any;
declare const metaData: any;

let objectDataCachingTimer;

/**
 * @param request generated metadata properties that define an object data request
 * @description constructs an object data request object
 * based on the generated metadata properties
 * @returns the constructed object data request object
 */
export const getObjectDataRequest = (request: any) => {

    // Check if the limit for the specific type has been configured in
    // the settings, if not then just use the global limit
    let limit = manywho.settings.global('offline.cache.requests.limitByType', null, 250);
    if (!limit[request.typeElementId]) {
        limit = manywho.settings.global('offline.cache.requests.limit', null, 250);
    } else {
        limit = limit[request.typeElementId];
    }

    const objectDataRequest: any = {
        authorization: null,
        configurationValues: null,
        command: null,
        culture: {
            id: null,
            developerName: null,
            developerSummary: null,
            brand: null,
            language: 'EN',
            country: 'USA',
            variant: null,
        },
        stateId: '00000000-0000-0000-0000-000000000000',
        token: null,
        listFilter: {
            limit,
            offset: 0,
            orderBy: (request.listFilter && request.listFilter.orderBy) ? request.listFilter.orderBy : null,
            orderByDirectionType: (request.listFilter && request.listFilter.orderByDirectionType) ? request.listFilter.orderByDirectionType : null,
            orderByTypeElementPropertyId: (request.listFilter && request.listFilter.orderByTypeElementPropertyId) ?
                request.listFilter.orderByTypeElementPropertyId : null,
        },
    };

    const typeElement = metaData.typeElements.find((element) => element.id === request.typeElementId);

    objectDataRequest.typeElementBindingId = typeElement.bindings[0].id;
    objectDataRequest.objectDataType = {
        typeElementId: typeElement.id,
        developerName: typeElement.developerName,
        properties: typeElement.properties.map((property) => ({
            developerName: property.developerName,
        })),
    };

    return objectDataRequest;
};

/**
 * @description extracting page element object data requests and flow data actions
 * from the snapshot to determine what object data requests to make
 * @returns array of all object data requests that the flow uses
 */
export const generateObjectData = () => {
    const objectDataRequests = {};

    // Find page components that use object data e.g a table
    if (metaData.pageElements) {
        metaData.pageElements.forEach((page) => {
            (page.pageComponents || [])
                .filter((component) => component.objectDataRequest)
                .forEach((component) => { objectDataRequests[component.objectDataRequest.typeElementId] = component.objectDataRequest; });
        });
    }

    // Find data actions that load data from external resources as object data
    if (metaData.mapElements) {
        metaData.mapElements.forEach((element) => {
            (element.dataActions || [])
                .filter((action) => manywho.utils.isEqual(action.crudOperationType, 'load', true) && action.objectDataRequest)
                .forEach((action) => { objectDataRequests[action.objectDataRequest.typeElementId] = action.objectDataRequest; });
        });
    }

    const requests = Object.keys(objectDataRequests)
        .map((key) => objectDataRequests[key])
        .map(getObjectDataRequest);

    return requests.concat.apply([], requests);
};

/**
 * @param flow flow information e.g. flow id, version id, tenant id
 * @description retrieve object data request responses from the engine
 * and set them in the flow model and insert them update indexdb
 * @returns true/false whether any requests were executed
 */
const ObjectDataCaching = (flow: IFlow) => {

    clearTimeout(objectDataCachingTimer);

    // only poll api whilst online
    if (store.getState().isOffline) {
        return false;
    }

    const initRequests = generateObjectData();

    if (!initRequests || initRequests.length === 0) {
        return false;
    }

    store.dispatch<any>(cachingProgress({ progress: 1, flowKey: null }));

    const executeRequest = (
        req: any,
        reqIndex: number,
        reqFlow: IFlow,
        currentTypeElementId: null,
    ) => {

        let requests = req;

        const flowKey = manywho.utils.getFlowKey(
            reqFlow.tenantId,
            reqFlow.id.id,
            reqFlow.id.versionId,
            reqFlow.state.id,
            'main',
        );

        if (reqIndex >= requests.length) {
            objectDataCachingTimer = OnCached(reqFlow);
            return;
        }

        const request = requests[reqIndex];
        request.stateId = reqFlow.state.id;

         
        return manywho.ajax.dispatchObjectDataRequest(
            request, reqFlow.tenantId, reqFlow.state.id, reqFlow.authenticationToken, request.listFilter.limit,
        )
            .then((response) => {
                if (response.objectData) {
                    cacheObjectData(
                        response.objectData.map((objectData) => ({ objectData, assocData: null })),
                        request.objectDataType.typeElementId,
                    );
                } else {
                    requests = requests.filter((item) => !item.objectDataType.typeElementId === currentTypeElementId);
                }
                return response;
            })
            .then(() => {
                const newIndex = reqIndex + 1;
                store.dispatch<any>(cachingProgress({ flowKey, progress: Math.round(Math.min((newIndex / initRequests.length) * 100, 100)) }));
                executeRequest(requests, newIndex, reqFlow, currentTypeElementId);
            })
            .fail(() => {
                store.dispatch<any>(cachingProgress({ flowKey, progress: 100 }));
                alert('An error caching data has occurred, your flow may not work as expected whilst offline');
            });
    };
    executeRequest(initRequests, 0, flow, null);
    return true;
};

export default ObjectDataCaching;
