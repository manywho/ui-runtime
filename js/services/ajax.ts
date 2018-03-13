/**
 * Helpers for making AJAX calls to the platform. API documentation can be found here: https://manywho.github.io/slate/
 */

/** workaround for a typedoc issue */
import * as Connection from './connection';
import * as Log from 'loglevel';
import * as Settings from './settings';

/**
 * Make a file or objectdata request to the platform
 * @param url Endpoint (excluding host) that the request will be made against
 * @param event Type of event, `Settings.event(event + '.done')` will be called when the request completes
 * @param limit Number of results to return
 * @param search Search string to apply to the list filter
 * @param orderBy Property name to order results by
 * @param orderByDirection ASC or DESC
 * @param page Page offset for the list filter
 */
export const dispatchDataRequest = (
        url: string,
        event: string,
        request: any,
        tenantId: string,
        stateId: string,
        authenticationToken: string,
        limit: number,
        search: string,
        orderBy: string,
        orderByDirection: string,
        page: number,
    ): JQueryXHR => {

    request.listFilter = request.listFilter || {};
    request.listFilter.search = search || null;

    request.listFilter.limit = limit;
    if (limit == null || limit === undefined)
        request.listFilter.limit = Settings.global('paging.files');

    if (orderBy)
        request.listFilter.orderByPropertyDeveloperName = orderBy;

    if (orderByDirection)
        request.listFilter.orderByDirectionType = orderByDirection;

    if (page > 0)
        request.listFilter.offset = (page - 1) * request.listFilter.limit;

    return Connection.request(null, event, url, 'POST', tenantId, stateId, authenticationToken, request);
};

/**
 * POST to `/api/run/1/authentication/stateId`
 */
export const login = (
    loginUrl: string, 
    username: string, 
    password: string, 
    sessionId: string, 
    sessionUrl: string, 
    stateId: string, 
    tenantId: string,
): JQueryXHR => {

    Log.info('Logging into Flow State: \n    Id: ' + stateId);

    const request = {
        loginUrl,
        sessionUrl,
        username,
        password,
        token: null,
        sessionToken: sessionId,
    };

    return Connection.request(null, 'login', '/api/run/1/authentication/' + stateId, 'POST', tenantId, null, null, request);
};

/**
 * POST to `/api/run/1` to initialize a state
 */
export const initialize = (engineInitializationRequest: any, tenantId: string, authenticationToken: string): JQueryXHR => {
    Log.info(`Initializing Flow: \n Id: ${engineInitializationRequest.flowId.id} \n Version Id: '${engineInitializationRequest.flowId.versionId}`);
    return Connection.request(null, 'initialization', '/api/run/1', 'POST', tenantId, null, authenticationToken, engineInitializationRequest);
};

/**
 * POST to `/api/run/1/state/out/stateId/selectedOutcomeId` to flow out
 */
export const flowOut = (stateId: string, tenantId: string, selectedOutcomeId: string, authenticationToken: string): JQueryXHR => {
    return Connection.request(
        null, 
        'flowOut',
        '/api/run/1/state/out/' + stateId + '/' + selectedOutcomeId, 
        'POST',
        tenantId, 
        stateId, 
        authenticationToken, 
        null,
    );
};

/**
 * GET the state of currently executing flow at `/api/run/1/state/stateId`
 */
export const join = (stateId: string, tenantId: string, authenticationToken: string): JQueryXHR => {
    Log.info('Joining State: ' + stateId);
    return Connection.request(null, 'join', '/api/run/1/state/' + stateId, 'GET', tenantId, stateId, authenticationToken, null);
};

/**
 * POST to `/api/run/1/state/engineInvokeRequest.stateId` to update the state of the flow
 */
export const invoke = (engineInvokeRequest: any, tenantId: string, authenticationToken: string): JQueryXHR => {
    Log.info('Invoking State: ' + engineInvokeRequest.stateId);
    return Connection.request(
        null, 
        'invoke', 
        '/api/run/1/state/' + engineInvokeRequest.stateId, 
        'POST', 
        tenantId, 
        engineInvokeRequest.stateId, 
        authenticationToken, 
        engineInvokeRequest,
    );
};

/**
 * POST to `/api/run/1/navigation/stateId`
 */
export const getNavigation = (
    stateId: string, 
    stateToken: string, 
    navigationElementId: string, 
    tenantId: string, 
    authenticationToken?: string,
): JQueryXHR => {
    const request = { stateId, stateToken, navigationElementId };
    return Connection.request(null, 'navigation', '/api/run/1/navigation/' + stateId, 'POST', tenantId, stateId, authenticationToken, request);
};

/**
 * GET at `/api/run/1/flow/name/name`
 */
export const getFlowByName = (name: string, tenantId: string, authenticationToken: string): JQueryXHR => {
    return Connection.request(null, 'getFlowByName', '/api/run/1/flow/name/' + name, 'GET', tenantId, null, authenticationToken, null);
};

/**
 * POST to `/api/service/1/data` to make an objectdata request
 * @param limit Number of results to return
 * @param search Search string to apply to the list filter
 * @param orderBy Property name to order results by
 * @param orderByDirection ASC or DESC
 * @param page Page offset for the list filter
 */
export const dispatchObjectDataRequest = (
    request: any, 
    tenantId: string, 
    stateId: string, 
    authenticationToken: string, 
    limit: number, 
    search: string, 
    orderBy: string, 
    orderByDirection: string, 
    page: number,
): JQueryXHR => {
    Log.info('Dispatching object data request');
    return dispatchDataRequest(
        '/api/service/1/data', 
        'objectData', 
        request,
        tenantId, 
        stateId, 
        authenticationToken, 
        limit, 
        search, 
        orderBy, 
        orderByDirection, 
        page,
    );
};

/**
 * POST to `/api/service/1/file` to make a filedata request
 * @param limit Number of results to return
 * @param search Search string to apply to the list filter
 * @param orderBy Property name to order results by
 * @param orderByDirection ASC or DESC
 * @param page Page offset for the list filter
 */
export const dispatchFileDataRequest = (
    request: any,
    tenantId: string, 
    stateId: string,
    authenticationToken: string,
    limit: number, 
    search: string, 
    orderBy: string, 
    orderByDirection: string, 
    page: number,
): JQueryXHR => {
    Log.info('Dispatching object data request');
    return dispatchDataRequest(
        '/api/service/1/file', 
        'fileData', 
        request, 
        tenantId, 
        stateId, 
        authenticationToken, 
        limit, 
        search, 
        orderBy, 
        orderByDirection, 
        page,
    );
};

/**
 * POST to `/api/service/1/file/content` to upload a file to a 3rd party service
 * @param onProgress Callback to recieve progress event info
 */
export const uploadFile = (
    formData: FormData, 
    tenantId: string,
    authenticationToken: string,
    onProgress: EventListenerOrEventListenerObject,
): JQueryXHR => {
    return Connection.upload(null, 'fileData', '/api/service/1/file/content', formData, tenantId, authenticationToken, onProgress);
};

/**
 * POST to `/api/social/1/stream/streamId/file` to upload a file to a 3rd party social stream
 * @param onProgress Callback to recieve progress event info
 */
export const uploadSocialFile = (
    formData: FormData, 
    streamId: string, 
    tenantId: string, 
    authenticationToken: string, 
    onProgress: EventListenerOrEventListenerObject,
): JQueryXHR => {
    return Connection.upload(null, 'fileData', '/api/social/1/stream/' + streamId + '/file', formData, tenantId, authenticationToken, onProgress);
};

/**
 * POST to `/api/run/1/authentication/stateId`
 */
export const sessionAuthentication = (tenantId: string, stateId: string, request: any, authenticationToken: string): JQueryXHR => {
    Log.info('Authenticating using session ID');
    return Connection.request(
        null, 
        'sessionAuthentication', 
        '/api/run/1/authentication/' + stateId, 
        'POST', 
        tenantId, 
        stateId, 
        authenticationToken, 
        request,
    );
};

/**
 * GET at `/api/run/1/state/stateId/ping/`
 */
export const ping = (tenantId: string, stateId: string, stateToken: string, authenticationToken: string): JQueryXHR => {
    Log.info('Pinging for changes');
    return Connection.request(
        null, 
        'ping', 
        '/api/run/1/state/' + stateId + '/ping/' + stateToken, 
        'GET', 
        tenantId, 
        stateId, 
        authenticationToken, 
        null,
    );
};

/**
 * GET at `/api/log/flowId/stateId`
 */
export const getExecutionLog = (tenantId: string, flowId: string, stateId: string, authenticationToken: string): JQueryXHR => {
    Log.info('Getting Execution Log');
    return Connection.request(null, 'log', '/api/log/' + flowId + '/' + stateId, 'GET', tenantId, stateId, authenticationToken, null);
};

/**
 * GET at `/api/social/1/stream/streamId/user/me`
 */
export const getSocialMe = (tenantId: string, streamId: string, stateId: string, authenticationToken: string): JQueryXHR => {
    Log.info('Getting Social User, Me');
    return Connection.request(null, 'social', '/api/social/1/stream/' + streamId + '/user/me', 'GET', tenantId, stateId, authenticationToken, null);
};

/**
 * GET at `/api/social/1/stream/streamId/follower`
 */
export const getSocialFollowers = (tenantId: string, streamId: string, stateId: string, authenticationToken: string): JQueryXHR => {
    Log.info('Getting Social Followers');
    return Connection.request(null, 'social', '/api/social/1/stream/' + streamId + '/follower', 'GET', tenantId, stateId, authenticationToken, null);
};

/**
 * GET at `/api/social/1/stream/streamId?page=page&pageSize=pageSize`
 */
export const getSocialMessages = (
    tenantId: string,
    streamId: string, 
    stateId: string, 
    page: number, 
    pageSize: number, 
    authenticationToken: string,
): JQueryXHR => {
    Log.info('Getting Social Messages');
    return Connection.request(
        null, 
        'social', 
        '/api/social/1/stream/' + streamId + '?page=' + page + '&pageSize=' + pageSize, 
        'GET', 
        tenantId, 
        stateId, 
        authenticationToken, 
        null,
    );
};

/**
 * POST to `/api/social/1/stream/streamId/message`
 */
export const sendSocialMessage = (tenantId: string, streamId: string, stateId: string, request: any, authenticationToken: string): JQueryXHR => {
    Log.info('Sending Social Message');
    return Connection.request(
        null, 
        'social', 
        '/api/social/1/stream/' + streamId + '/message', 
        'POST', 
        tenantId, 
        stateId, 
        authenticationToken, 
        request,
    );
};

/**
 * POST to `/api/social/1/stream/streamId?follow=isFollowing`
 */
export const follow = (tenantId: string, streamId: string, stateId: string, isFollowing: boolean, authenticationToken: string): JQueryXHR => {
    Log.info('Following Social Message');
    return Connection.request(
        null, 
        'social', 
        '/api/social/1/stream/' + streamId + '?follow=' + isFollowing.toString(), 
        'POST', 
        tenantId, 
        stateId, 
        authenticationToken, 
        null,
    );
};

/**
 * GET at `/api/social/1/stream/streamId/user?name=name`
 */
export const getSocialUsers = (tenantId: string, streamId: string, stateId: string, name: string, authenticationToken: string): JQueryXHR => {
    Log.info('Following Social Message');
    return Connection.request(
        null, 
        'social', 
        '/api/social/1/stream/' + streamId + '/user?name=' + name, 
        'GET', 
        tenantId, 
        stateId, 
        authenticationToken, 
        null,
    );
};
