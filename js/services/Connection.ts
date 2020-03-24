import { pollForStateValues } from './cache/StateCaching';
import store from '../stores/store';
import { isOffline } from '../actions';
import OfflineCore from './OfflineCore';
import { getOfflineData } from './Storage';
import ObjectDataCaching from './cache/ObjectDataCaching';

declare const manywho: any;
declare const jQuery: any;
declare const $: any;

const pingTimeout = 3000;

enum EventTypes {
    invoke = 'invoke',
    join = 'join',
    navigation = 'navigation',
    initialization = 'initialization',
    objectData = 'objectData',
}

/**
 * @description Check network availability by pinging the platform's health endpoint `/api/health
 *
 * The timeout period starts at the point the $.ajax call is made;
 * if several other requests are in progress and the browser has no connections available,
 * it is possible for a request to time out before it can be sent
 */
export const hasNetwork = () => {
    const deferred = jQuery.Deferred();

    $.ajax({
        url: `${manywho.settings.global('platform.uri')}/api/health`,
        timeout: pingTimeout,
    })
    .then(() => {
        deferred.resolve(true);
    })
    .fail(() => {
        store.dispatch<any>(isOffline(true));
        deferred.resolve(false);
    });

    return deferred;
};

/**
 * @param stateId
 * @description determining whether a flow has cached
 * requests that still need to be synced. If there is
 * an entry cached in indexDB for the current state
 * then the flow is classified as "being offline"
 */
export const isOnline = (stateId, request, event) => {

    const deferred = jQuery.Deferred();

    // If requests are being replayed then we want to bypass
    // the health checks in case a request fails
    if (store.getState().isReplaying) {
        return deferred.resolve(true);
    }

    const flowId = (request && request.flowId) ? request.flowId.id : null;

    getOfflineData(stateId, flowId, event)
        .then((flow) => {
            if (flow) {
                store.dispatch<any>(isOffline(true));
                return deferred.resolve(false);
            }

            store.dispatch<any>(isOffline(false));
            hasNetwork()
                .then((response) => {
                    if (response) {
                        return deferred.resolve(true);
                    }
                    return deferred.resolve(false);
                });
        });

    return deferred;
};

/**
 * Perform a request to the API in a normal online environment
 * @param event
 * @param urlPart
 * @param methodType
 * @param tenantId
 * @param stateId
 * @param authenticationToken
 * @param request
 */
export const onlineRequest = (
    event: EventTypes,
    urlPart: string,
    methodType: string,
    tenantId: string,
    stateId: string,
    authenticationToken: string,
    request: any,
) => {

    let json = null;

    if (request != null) {
        json = JSON.stringify(request);
    }

    return $.ajax({
        url: manywho.settings.global('platform.uri') + urlPart,
        type: methodType,
        dataType: 'json',
        contentType: 'application/json',
        processData: true,
        data: json,
        beforeSend: (xhr) => {
            manywho.connection.beforeSend.call(this, xhr, tenantId, authenticationToken, event, request);
            if (manywho.utils.isNullOrWhitespace(stateId) === false) {
                xhr.setRequestHeader('ManyWhoState', stateId);
            }
        },
    })
    .done((response) => {

        // Here is where we initiate the offline functionality
        // This happens in join and initialisation responses (when the flow first ran or user has joined)
        if (event === EventTypes.initialization || event === EventTypes.join) {

            // Determine if a flow that requires authentication
            // has successfully been authenticated
            const isAuthenticated = authenticationToken && response.authorizationContext &&
            (response.authorizationContext.directoryId &&
            response.authorizationContext.directoryName &&
            response.authorizationContext.loginUrl);

            // Determine if a flow is just public
            const isPublic = !authenticationToken &&
            (!response.authorizationContext.directoryId &&
            !response.authorizationContext.directoryName &&
            !response.authorizationContext.loginUrl);

            if (isAuthenticated || isPublic) {

                getOfflineData(stateId, null, null)
                    .then((flow) => {
                        if (!flow) {

                            // Theres nothing cached in indexedb so
                            // this flow has must be online with no
                            // pending requests to be replayed
                            const flowModel = OfflineCore.initialize(
                                tenantId,
                                response.stateId,
                                response.stateToken,
                                authenticationToken,
                            );

                            // Start polling for state values
                            if (response.stateId && tenantId) {
                                pollForStateValues(response.stateId, tenantId, authenticationToken);
                            }

                            // Start caching object data
                            ObjectDataCaching(flowModel);
                        }
                        if (flow) {
                            // Data cached in indexdb so flow
                            // has requests that need to be replayed
                            store.dispatch<any>(isOffline(true));
                        }
                    });
            }
        }
        manywho.settings.event(`${event}.done`);
    })
    .fail(manywho.connection.onError)
    .fail(manywho.settings.event(`${event}.fail`));
};

/**
 * Passing the request back to the offline engine
 * to generate the appropriate response.
 * @param resolveContext
 * @param event
 * @param urlPart
 * @param request
 * @param tenantId
 * @param stateId
 */
export const offlineRequest = (
    resolveContext: any,
    event: EventTypes,
    urlPart: string,
    request: string,
    tenantId: string,
    stateId: string,
) => {
    const deferred = jQuery.Deferred();

    OfflineCore.getResponse(resolveContext, event, urlPart, request, tenantId, stateId)
        .then((response) => {
            deferred.resolveWith(resolveContext, [response]);
        });

    return deferred
        .done(manywho.settings.event(`${event}.done`))
        .fail(manywho.connection.onError)
        .fail(manywho.settings.event(`${event}.fail`));
};

/**
 * Intercepts api requests to the engine
 * as the user interacts with the flow so that we can determine
 * if the requests should be cached or not.
 * @param resolveContext
 * @param event
 * @param urlPart
 * @param methodType
 * @param tenantId
 * @param stateId
 * @param authenticationToken
 * @param request
 */
export const request = (
    resolveContext: any,
    event: EventTypes,
    urlPart: string,
    methodType: string,
    tenantId: string,
    stateId: string,
    authenticationToken: string,
    request: any,
) => {
    return isOnline(stateId, request, event)
        .then((response) => {
            if (response) {

                // Device is connected to the internet
                return onlineRequest(event, urlPart, methodType, tenantId, stateId, authenticationToken, request);
            }

            // Device is not connected to the internet
            return offlineRequest(resolveContext, event, urlPart, request, tenantId, stateId);
        });
};

/**
 * Intercepts initialize requests before
 * an actual api call can get intercepted
 * @param tenantId
 * @param flowId
 * @param flowVersionId
 * @param container
 * @param stateId
 * @param authenticationToken
 * @param options
 * @param isInitializing
 */
export const initialize = (
    tenantId: string,
    flowId: string,
    flowVersionId: string,
    container: string,
    stateId: string,
    authenticationToken: string,
    options: any,
    isInitializing: string | boolean,
) => {

    // Check if there is any cached data
    // in indexdb associated to the flow
    return getOfflineData(stateId, flowId, 'initialization')
        .then((flow) => {

            // If there is a state cache then we extract
            // the state id, if not then state id will be null
            // (normal for initialization requests).
            //
            // stateid === true => do a join
            // stateid === null => move with authorization
            const currentStateId = flow ? flow.state.id : stateId;
            return manywho.engine._initialize(
                tenantId,
                flowId,
                flowVersionId,
                container,
                currentStateId,
                authenticationToken,
                options,
                isInitializing,
            );
        });
};

/**
 * Perform an upload request to the API in a normal online environment
 * @param event Type of event, `Settings.event(event + '.done')` will be called when the request completes
 * @param url The path to make the request against, excluding the host which is fetched from `Settings.global('platform.uri')`
 * @param files A list of files
 * @param request The request payload data
 * @param tenantId The GUID of the tenant to make the request against
 * @param authenticationToken Current running users authentication token
 * @param onProgress Callback to recieve progress event info
 * @returns JQuery deferred from the $.ajax request
 */
export const onlineUploadFiles = (
    event: string,
    url: string,
    files: File[],
    request: any,
    tenantId: string,
    authenticationToken: string,
    onProgress: EventListenerOrEventListenerObject,
) => {

    const formData = new FormData();

    files.forEach((file) => {
        formData.append('FileData', file);
    });

    formData.append('FileDataRequest', JSON.stringify(request));

    return $.ajax({
        url: manywho.settings.global('platform.uri') + url,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        xhr: () => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', onProgress, false);
            return xhr;
        },
        beforeSend: (xhr) => {
            manywho.connection.beforeSend.call(this, xhr, tenantId, authenticationToken, event);
        },
    })
    .done(manywho.settings.event(`${event}.done`))
    .fail(manywho.connection.onError)
    .fail(manywho.settings.event(`${event}.fail`));
};

/**
 * Passing the request back to the offline engine
 * to generate the appropriate response.
 * @param event
 * @param files
 * @param request
 * @param stateId
 */
export const offlineUploadFiles = (
    event: string,
    files: File[],
    request: any,
    stateId: string,
) => {
    const deferred = jQuery.Deferred();

    const response = OfflineCore.getUploadResponse(files, request, stateId);

    deferred.resolve(response);

    return deferred.done(manywho.settings.event(`${event}.done`));
};

/**
 * Perform an upload request to the API in a normal online environment
 * @param resolveContext TODO
 * @param event Type of event, `Settings.event(event + '.done')` will be called when the request completes
 * @param url The path to make the request against, excluding the host which is fetched from `Settings.global('platform.uri')`
 * @param files Files to upload
 * @param request Request payload data
 * @param tenantId The GUID of the tenant to make the request against
 * @param authenticationToken Current running users authentication token
 * @param onProgress Callback to recieve progress event info
 * @param stateId
 * @returns JQuery deferred from the $.ajax request
 */
export const uploadFiles = (
    resolveContext,
    event: string,
    url: string,
    files: File[],
    request: any,
    tenantId: string,
    authenticationToken: string,
    onProgress: EventListenerOrEventListenerObject,
    stateId: string,
) => {
    return isOnline(stateId, request, event)
        .then((response) => {
            if (response) {

                // Device is connected to the internet
                return onlineUploadFiles(event, url, files, request, tenantId, authenticationToken, onProgress);
            }

            // Device is not connected to the internet
            return offlineUploadFiles(event, files, request, stateId);
        });
};
