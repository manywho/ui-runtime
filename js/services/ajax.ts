

import Connection from './connection';
import * as Log from 'loglevel';
import Settings from './settings';

declare var manywho: any;

export default {

    dispatchDataRequest(url, eventPrefix, request, tenantId, stateId, authenticationToken, limit, search, orderBy, orderByDirection, page) {

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

        return Connection.request(null, eventPrefix, url, 'POST', tenantId, stateId, authenticationToken, request);
    },

    login(loginUrl, username, password, sessionId, sessionUrl, stateId, tenantId) {

        Log.info('Logging into Flow State: \n    Id: ' + stateId);

        const request = {
            username: username,
            password: password,
            token: null,
            sessionToken: sessionId,
            sessionUrl: sessionUrl,
            loginUrl: loginUrl
        };

        return Connection.request(null, 'login', '/api/run/1/authentication/' + stateId, 'POST', tenantId, null, null, request);
    },

    initialize(engineInitializationRequest, tenantId, authenticationToken) {
        Log.info('Initializing Flow: \n    Id: ' + engineInitializationRequest.flowId.id + '\n    Version Id: ' + engineInitializationRequest.flowId.versionId);
        return Connection.request(null, 'initialization', '/api/run/1', 'POST', tenantId, null, authenticationToken, engineInitializationRequest);
    },

    flowOut(stateId, tenantId, selectedOutcomeId, authenticationToken) {
        return Connection.request(null, 'flowOut', '/api/run/1/state/out/' + stateId + '/' + selectedOutcomeId, 'POST', tenantId, stateId, authenticationToken, null);
    },

    join(stateId, tenantId, authenticationToken) {
        Log.info('Joining State: ' + stateId);
        return Connection.request(null, 'join', '/api/run/1/state/' + stateId, 'GET', tenantId, stateId, authenticationToken, null);
    },

    invoke(engineInvokeRequest, tenantId, authenticationToken) {
        Log.info('Invoking State: ' + engineInvokeRequest.stateId);
        return Connection.request(null, 'invoke', '/api/run/1/state/' + engineInvokeRequest.stateId, 'POST', tenantId, engineInvokeRequest.stateId, authenticationToken, engineInvokeRequest);
    },

    getNavigation(stateId, stateToken, navigationElementId, tenantId, authenticationToken?) {
        const request = { 'stateId': stateId, 'stateToken': stateToken, 'navigationElementId': navigationElementId };
        return Connection.request(null, 'navigation', '/api/run/1/navigation/' + stateId, 'POST', tenantId, stateId, authenticationToken, request);
    },

    getFlowByName(flowName, tenantId, authenticationToken) {
        return Connection.request(null, 'getFlowByName', '/api/run/1/flow/name/' + flowName, 'GET', tenantId, null, authenticationToken, null);
    },

    dispatchObjectDataRequest(request, tenantId, stateId, authenticationToken, limit, search, orderBy, orderByDirection, page) {
        Log.info('Dispatching object data request');
        return exports.default.dispatchDataRequest('/api/service/1/data', 'objectData', request, tenantId, stateId, authenticationToken, limit, search, orderBy, orderByDirection, page);
    },

    dispatchFileDataRequest(request, tenantId, stateId, authenticationToken, limit, search, orderBy, orderByDirection, page) {
        Log.info('Dispatching object data request');
        return exports.default.dispatchDataRequest('/api/service/1/file', 'fileData', request, tenantId, stateId, authenticationToken, limit, search, orderBy, orderByDirection, page);
    },

    uploadFile(formData, tenantId, authenticationToken, onProgress) {
        return Connection.upload(null, 'fileData', '/api/service/1/file/content', formData, tenantId, authenticationToken, onProgress);
    },

    uploadSocialFile(formData, streamId, tenantId, authenticationToken, onProgress) {
        return Connection.upload(null, 'fileData', '/api/social/1/stream/' + streamId + '/file', formData, tenantId, authenticationToken, onProgress);
    },

    sessionAuthentication(tenantId, stateId, request, authenticationToken) {
        Log.info('Authenticating using session ID');
        return Connection.request(null, 'sessionAuthentication', '/api/run/1/authentication/' + stateId, 'POST', tenantId, stateId, authenticationToken, request);
    },

    ping(tenantId, stateId, stateToken, authenticationToken) {
        Log.info('Pinging for changes');
        return Connection.request(null, 'ping', '/api/run/1/state/' + stateId + '/ping/' + stateToken, 'GET', tenantId, stateId, authenticationToken, null);
    },

    getExecutionLog(tenantId, flowId, stateId, authenticationToken) {
        Log.info('Getting Execution Log');
        return Connection.request(null, 'log', '/api/log/' + flowId + '/' + stateId, 'GET', tenantId, stateId, authenticationToken, null);
    },

    getSocialMe(tenantId, streamId, stateId, authenticationToken) {
        Log.info('Getting Social User, Me');
        return Connection.request(null, 'social', '/api/social/1/stream/' + streamId + '/user/me', 'GET', tenantId, stateId, authenticationToken, null);
    },

    getSocialFollowers(tenantId, streamId, stateId, authenticationToken) {
        Log.info('Getting Social Followers');
        return Connection.request(null, 'social', '/api/social/1/stream/' + streamId + '/follower', 'GET', tenantId, stateId, authenticationToken, null);
    },

    getSocialMessages(tenantId, streamId, stateId, page, pageSize, authenticationToken) {
        Log.info('Getting Social Messages');
        return Connection.request(null, 'social', '/api/social/1/stream/' + streamId + '?page=' + page + '&pageSize=' + pageSize, 'GET', tenantId, stateId, authenticationToken, null);
    },

    sendSocialMessage(tenantId, streamId, stateId, request, authenticationToken) {
        Log.info('Sending Social Message');
        return Connection.request(null, 'social', '/api/social/1/stream/' + streamId + '/message', 'POST', tenantId, stateId, authenticationToken, request);
    },

    follow(tenantId, streamId, stateId, isFollowing, authenticationToken) {
        Log.info('Following Social Message');
        return Connection.request(null, 'social', '/api/social/1/stream/' + streamId + '?follow=' + isFollowing.toString(), 'POST', tenantId, stateId, authenticationToken, null);
    },

    getSocialUsers(tenantId, streamId, stateId, name, authenticationToken) {
        Log.info('Following Social Message');
        return Connection.request(null, 'social', '/api/social/1/stream/' + streamId + '/user?name=' + name, 'GET', tenantId, stateId, authenticationToken, null);
    },
};
