/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.ajax = class Ajax {

    static dispatchDataRequest(url, eventPrefix, request, tenantId, authenticationToken, limit, search, orderBy, orderByDirection, page) {

        request.listFilter = request.listFilter || {};
        request.listFilter.search = search || null;

        request.listFilter.limit = limit;
        if (limit == null || limit === undefined)
            request.listFilter.limit = manywho.settings.global('paging.files');

        if (orderBy)
            request.listFilter.orderByPropertyDeveloperName = orderBy;

        if (orderByDirection)
            request.listFilter.orderByDirectionType = orderByDirection;

        if (page > 0)
            request.listFilter.offset = (page - 1) * request.listFilter.limit;

        return manywho.connection.request(null, eventPrefix, url, 'POST', tenantId, null, authenticationToken, request);
    }

    static login(loginUrl, username, password, sessionId, sessionUrl, stateId, tenantId) {

        manywho.log.info('Logging into Flow State: \n    Id: ' + stateId);

        const request = {
            username: username,
            password: password,
            token: null,
            sessionToken: sessionId,
            sessionUrl: sessionUrl,
            loginUrl: loginUrl
        };

        return manywho.connection.request(null, 'login', '/api/run/1/authentication/' + stateId, 'POST', tenantId, null, null, request);
    }

    static initialize(engineInitializationRequest, tenantId, authenticationToken) {
        manywho.log.info('Initializing Flow: \n    Id: ' + engineInitializationRequest.flowId.id + '\n    Version Id: ' + engineInitializationRequest.flowId.versionId);
        return manywho.connection.request(null, 'initialization', '/api/run/1', 'POST', tenantId, null, authenticationToken, engineInitializationRequest);
    }

    static flowOut(stateId, tenantId, selectedOutcomeId, authenticationToken) {
        return manywho.connection.request(null, 'flowOut', '/api/run/1/state/out/' + stateId + '/' + selectedOutcomeId, 'POST', tenantId, stateId, authenticationToken, null);
    }

    static join(stateId, tenantId, authenticationToken) {
        manywho.log.info('Joining State: ' + stateId);
        return manywho.connection.request(null, 'join', '/api/run/1/state/' + stateId, 'GET', tenantId, stateId, authenticationToken);
    }

    static invoke(engineInvokeRequest, tenantId, authenticationToken) {
        manywho.log.info('Invoking State: ' + engineInvokeRequest.stateId);
        return manywho.connection.request(null, 'invoke', '/api/run/1/state/' + engineInvokeRequest.stateId, 'POST', tenantId, engineInvokeRequest.stateId, authenticationToken, engineInvokeRequest);
    }

    static getNavigation(stateId, stateToken, navigationElementId, tenantId, authenticationToken) {
        const request = { 'stateId': stateId, 'stateToken': stateToken, 'navigationElementId': navigationElementId };
        return manywho.connection.request(null, 'navigation', '/api/run/1/navigation/' + stateId, 'POST', tenantId, stateId, authenticationToken, request);
    }

    static getFlowByName(flowName, tenantId, authenticationToken) {
        return manywho.connection.request(null, 'getFlowByName', '/api/run/1/flow/name/' + flowName, 'GET', tenantId, null, authenticationToken, null);
    }

    static dispatchObjectDataRequest(request, tenantId, authenticationToken, limit, search, orderBy, orderByDirection, page) {
        manywho.log.info('Dispatching object data request');
        return manywho.ajax.dispatchDataRequest('/api/service/1/data', 'objectData', request, tenantId, authenticationToken, limit, search, orderBy, orderByDirection, page);
    }

    static dispatchFileDataRequest(request, tenantId, authenticationToken, limit, search, orderBy, orderByDirection, page) {
        manywho.log.info('Dispatching object data request');
        return manywho.ajax.dispatchDataRequest('/api/service/1/file', 'fileData', request, tenantId, authenticationToken, limit, search, orderBy, orderByDirection, page);
    }

    static uploadFile(formData, tenantId, authenticationToken, onProgress) {
        return manywho.connection.upload(null, 'fileData', '/api/service/1/file/content', formData, tenantId, authenticationToken, onProgress);
    }

    static uploadSocialFile(formData, streamId, tenantId, authenticationToken, onProgress) {
        return manywho.connection.upload(null, 'fileData', '/api/social/1/stream/' + streamId + '/file', formData, tenantId, authenticationToken, onProgress);
    }

    static sessionAuthentication(tenantId, stateId, request, authenticationToken) {
        manywho.log.info('Authenticating using session ID');
        return manywho.connection.request(null, 'sessionAuthentication', '/api/run/1/authentication/' + stateId, 'POST', tenantId, stateId, authenticationToken, request);
    }

    static ping(tenantId, stateId, stateToken, authenticationToken) {
        manywho.log.info('Pinging for changes');
        return manywho.connection.request(null, 'ping', '/api/run/1/state/' + stateId + '/ping/' + stateToken, 'GET', tenantId, stateId, authenticationToken, null);
    }

    static getExecutionLog(tenantId, flowId, stateId, authenticationToken) {
        manywho.log.info('Getting Execution Log');
        return manywho.connection.request(null, 'log', '/api/log/' + flowId + '/' + stateId, 'GET', tenantId, stateId, authenticationToken, null);
    }

    static getSocialMe(tenantId, streamId, stateId, authenticationToken) {
        manywho.log.info('Getting Social User, Me');
        return manywho.connection.request(null, 'social', '/api/social/1/stream/' + streamId + '/user/me', 'GET', tenantId, stateId, authenticationToken, null);
    }

    static getSocialFollowers(tenantId, streamId, stateId, authenticationToken) {
        manywho.log.info('Getting Social Followers');
        return manywho.connection.request(null, 'social', '/api/social/1/stream/' + streamId + '/follower', 'GET', tenantId, stateId, authenticationToken, null);
    }

    static getSocialMessages(tenantId, streamId, stateId, page, pageSize, authenticationToken) {
        manywho.log.info('Getting Social Messages');
        return manywho.connection.request(null, 'social', '/api/social/1/stream/' + streamId + '?page=' + page + '&pageSize=' + pageSize, 'GET', tenantId, stateId, authenticationToken, null);
    }

    static sendSocialMessage(tenantId, streamId, stateId, request, authenticationToken) {
        manywho.log.info('Sending Social Message');
        return manywho.connection.request(null, 'social', '/api/social/1/stream/' + streamId + '/message', 'POST', tenantId, stateId, authenticationToken, request);
    }

    static follow(tenantId, streamId, stateId, isFollowing, authenticationToken) {
        manywho.log.info('Following Social Message');
        return manywho.connection.request(null, 'social', '/api/social/1/stream/' + streamId + '?follow=' + isFollowing.toString(), 'POST', tenantId, stateId, authenticationToken, null);
    }

    static getSocialUsers(tenantId, streamId, stateId, name, authenticationToken) {
        manywho.log.info('Following Social Message');
        return manywho.connection.request(null, 'social', '/api/social/1/stream/' + streamId + '/user?name=' + name, 'GET', tenantId, stateId, authenticationToken, null);
    }
};
