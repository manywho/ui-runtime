import * as React from 'react';
import ReactDOM from 'react-dom';
import * as $ from 'jquery';
import * as numbro from 'numbro';

import * as Ajax from './ajax';
import * as Authorization from './authorization';
import * as Callbacks from './callbacks';
import * as Collaboration from './collaboration';
import * as Component from './component';
import * as Formatting from './formatting';
import * as Json from './json';
import * as Log from 'loglevel';
import * as Model from './model';
import * as Settings from './settings';
import * as Social from './social';
import * as State from './state';
import * as Tours from './tours';
import * as Utils from './utils';

declare var manywho: any;

function processObjectDataRequests(components, flowKey) {

    if (components) {

        let requestComponents = Utils.convertToArray(components).filter(function (component) {

            if (component.attributes
                && (component.attributes.isExecuteRequestOnRenderDisabled === true || Utils.isEqual(component.attributes.isExecuteRequestOnRenderDisabled, 'true', true)))
                return false;

            return component.objectDataRequest != null || component.fileDataRequest != null;

        });

        return $.when.apply($, requestComponents.map(function (component) {

            if (component.isVisible) {

                let limit = Settings.global('paging.' + component.componentType);
                let paginationSize = parseInt(component.attributes.paginationSize);

                if (!isNaN(paginationSize))
                    limit = paginationSize;

                if (component.fileDataRequest) {

                    return fileDataRequest(component.id, component.fileDataRequest, flowKey, limit);

                }
                else {

                    return objectDataRequest(component.id, component.objectDataRequest, flowKey, limit);

                }

            }

        }));

    }

}

function isAuthorized(response, flowKey) {

    if (!Authorization.isAuthorized(response, flowKey)) {

        return $.Deferred().reject(response).promise();

    }

    return response;

}

function onAuthorizationFailed(response, flowKey, callback) {

    if (State.getSessionData(flowKey) != null) {

        Authorization.authorizeBySession(response.authorizationContext.loginUrl, flowKey, callback);

    } else {

        // Authorization failed, retry
        Authorization.invokeAuthorization(response, flowKey, callback);

    }

}

function loadNavigation(flowKey, stateToken, navigationId, currentMapElementId?) {

    if (navigationId) {

        return Ajax.getNavigation(Utils.extractStateId(flowKey), stateToken, navigationId, Utils.extractTenantId(flowKey))
                .then(function (navigation) {

                    if (navigation) {

                        Model.parseNavigationResponse(navigationId, navigation, flowKey, currentMapElementId);

                    }

                });

    }

    let deferred = $.Deferred();
    deferred.resolve();
    return deferred;

}

function loadExecutionLog(flowKey, authenticationToken) {

    return Ajax.getExecutionLog(Utils.extractTenantId(flowKey), Utils.extractFlowId(flowKey), Utils.extractStateId(flowKey), authenticationToken)
            .then(function (executionLog) {

                if (executionLog) {

                    Model.setExecutionLog(flowKey, executionLog);

                }

            });

}

function notifyError(flowKey, response) {

    if (response && !response.responseText && (response.status === 0 || response.status === 500 || response.status === 504)) {

        Model.addNotification(flowKey, {
            message: Settings.global('errorMessage', flowKey),
            position: 'center',
            type: 'danger',
            timeout: 0,
            dismissible: true
        });

    } else if (response) {

        Model.addNotification(flowKey, {
            message: response.responseText,
            position: 'center',
            type: 'danger',
            timeout: 0,
            dismissible: true
        });

    }

}

function onInitializeFailed(response) {

    let container = document.querySelector(Settings.global('containerSelector', null, '#manywho'));
    container.classList.add('mw-bs');

    let alert = document.createElement('div');
    alert.className = 'alert alert-danger initialize-error';
    alert.innerText = response.statusText;

    container.insertBefore(alert, container.children[0]);

    return response;

}

function initializeWithAuthorization(callback, tenantId, flowId, flowVersionId, container, options, authenticationToken) {

    let self = this;
    let flowKey = callback.flowKey;
    let stateId = (flowKey) ? Utils.extractStateId(flowKey) : null;
    let navigationId, streamId = null;

    let initializationRequest = Json.generateInitializationRequest(
        { id: flowId, versionId: flowVersionId },
        stateId,
        options.annotations,
        options.inputs,
        Settings.global('playerUrl'),
        Settings.global('joinUrl'),
        options.mode,
        options.reportingMode
    );

    State.setOptions(options, flowKey);

    if (flowKey) {

        State.setComponentLoading(Utils.extractElement(flowKey), { message: Settings.global('localization.initializing') }, flowKey);
        self.render(flowKey);

        authenticationToken = authenticationToken || State.getAuthenticationToken(flowKey);

    }

    return Ajax.initialize(initializationRequest, tenantId, authenticationToken)
        .then(function (response) {

            sessionStorage.setItem('oauth-' + response.stateId, JSON.stringify({
                tenantId: tenantId,
                flowId: flowId,
                flowVersionId: flowVersionId,
                container: container,
                options: options
            }));

            flowKey = Utils.getFlowKey(tenantId, flowId, flowVersionId, response.stateId, container);

            if (options.callbacks != null && options.callbacks.length > 0) {

                options.callbacks.forEach(function (callback) {
                    Callbacks.register(flowKey, callback);
                });

            }

            streamId = response.currentStreamId;

            callback.flowKey = flowKey;

            Model.initializeModel(flowKey);
            Settings.initializeFlow(options, flowKey);
            State.setState(response.stateId, response.stateToken, response.currentMapElementId, flowKey);
            State.setAuthenticationToken(authenticationToken, flowKey);

            if (options.authentication != null && options.authentication.sessionId != null) {

                State.setSessionData(options.authentication.sessionId, options.authentication.sessionUrl, flowKey);

            }

            if (response.navigationElementReferences && response.navigationElementReferences.length > 0) {

                Model.setSelectedNavigation(response.navigationElementReferences[0].id, flowKey);

            }

            if (!Utils.isNullOrWhitespace(options.navigationElementId)) {

                Model.setSelectedNavigation(options.navigationElementId, flowKey);

            }

            Component.appendFlowContainer(flowKey);
            State.setComponentLoading(Utils.extractElement(flowKey), { message: Settings.global('localization.initializing') }, flowKey);
            self.render(flowKey);

            return isAuthorized(response, flowKey);

        }, onInitializeFailed)
        .then(function (response) {

            if (Settings.global('i18n.overrideTimezoneOffset', flowKey))
                State.setUserTime(flowKey);

            Formatting.initialize(flowKey);

            let invokeRequest = Json.generateInvokeRequest(
                State.getState(flowKey),
                'FORWARD',
                null,
                null,
                null,
                navigationId,
                null,
                Settings.flow('annotations', flowKey),
                State.getLocation(flowKey),
                Settings.flow('mode', flowKey)
            );

            return Ajax.invoke(invokeRequest, Utils.extractTenantId(flowKey), State.getAuthenticationToken(flowKey));

        }, function (response) {

            onAuthorizationFailed(response, flowKey, callback);

        })
        .then(function (response) {

            sessionStorage.removeItem('oauth-' + response.stateId);

            self.parseResponse(response, Model.parseEngineResponse, false, flowKey);

            State.setState(response.stateId, response.stateToken, response.currentMapElementId, flowKey);

            if (Settings.flow('collaboration.isEnabled', flowKey)) {
                Collaboration.initialize(flowKey);
                Collaboration.join('Another user', flowKey);
            }

            State.setLocation(flowKey);

            let deferreds = [];

            let navigationId = Model.getSelectedNavigation(flowKey);

            if (!Utils.isNullOrWhitespace(navigationId))
                deferreds.push(loadNavigation(flowKey, response.stateToken, navigationId, response.currentMapElementId));

            if (Settings.isDebugEnabled(flowKey))
                deferreds.push(loadExecutionLog(flowKey, authenticationToken));

            if (streamId)
                Social.initialize(flowKey, response.currentStreamId);

            if (Utils.isEqual(response.invokeType, 'DONE', true))
                Callbacks.execute(flowKey, response.invokeType, null, response.currentMapElementId, [response]);

            return Utils.whenAll(deferreds);

        }, function(response) {

            notifyError(flowKey, response);

        })
        .always(function () {

            self.render(flowKey);
            processObjectDataRequests(Model.getComponents(flowKey), flowKey);

        })
        .then(function() {

            let autoStart = Settings.global('tours.autoStart', flowKey, false);
            let containerSelector = Settings.global('tours.container', flowKey, null);

            if (autoStart)
                if (typeof autoStart === 'string')
                    Tours.start(autoStart, containerSelector, flowKey);
                else if (typeof autoStart === 'boolean')
                    Tours.start(null, containerSelector, flowKey);

        })
        .always(function() {

            State.setComponentLoading(Utils.extractElement(flowKey), null, flowKey);
            self.render(flowKey);

            })
            .then(function() {

            return flowKey;

            });

}

function joinWithAuthorization(callback, flowKey) {

    flowKey = flowKey || callback.flowKey;

    let self = this;
    let authenticationToken = State.getAuthenticationToken(flowKey);
    let state = State.getState(flowKey);
    let isAuthenticated = false;

    State.setComponentLoading(Utils.extractElement(flowKey), { message: Settings.global('localization.joining') }, flowKey);
    self.render(flowKey);

    if (Settings.global('i18n.overrideTimezoneOffset', flowKey))
        State.setUserTime(flowKey);

    Formatting.initialize(flowKey);

    return Ajax.join(state.id, Utils.extractTenantId(flowKey), authenticationToken)
        .then(function (response) {

            return isAuthorized(response, flowKey);

        }, onInitializeFailed)
        .then(function (response) {

            isAuthenticated = true;
            sessionStorage.removeItem('oauth-' + response.stateId);

            Model.initializeModel(flowKey);
            self.parseResponse(response, Model.parseEngineResponse, false, flowKey);

            State.setState(response.stateId, response.stateToken, response.currentMapElementId, flowKey);

            if (!Collaboration.isInitialized(flowKey) && Settings.flow('collaboration.isEnabled', flowKey)) {
                Collaboration.initialize(flowKey);
                Collaboration.join('Another user', flowKey);
            }

            State.setLocation(flowKey);

            let deferreds = [];

            if (response.navigationElementReferences && response.navigationElementReferences.length > 0) {

                Model.setSelectedNavigation(response.navigationElementReferences[0].id, flowKey);
                deferreds.push(loadNavigation(flowKey, response.stateToken, response.navigationElementReferences[0].id, response.currentMapElementId));

            }

            if (Settings.isDebugEnabled(flowKey)) {

                deferreds.push(loadExecutionLog(flowKey, authenticationToken));

            }

            if (response.currentStreamId) {

                Social.initialize(flowKey, response.currentStreamId);

            }

            return Utils.whenAll(deferreds);

        }, function (response) {

            onAuthorizationFailed(response, flowKey, callback);

        })
        .always(function () {

            self.render(flowKey);
            return processObjectDataRequests(Model.getComponents(flowKey), flowKey);

        })
        .always(function () {

            if (isAuthenticated) {

                State.setComponentLoading(Utils.extractElement(flowKey), null, flowKey);
                self.render(flowKey);

            }

        })
        .then(function() {

            return flowKey;

        });

}

function moveWithAuthorization(callback, invokeRequest, flowKey) {

    flowKey = callback.flowKey || flowKey;

    let self = this;
    let authenticationToken = State.getAuthenticationToken(flowKey);
    let moveResponse = null;
    let outcome = null;
    let selectedOutcomeId = invokeRequest.mapElementInvokeRequest.selectedOutcomeId;

    if (selectedOutcomeId)
        outcome = Model.getOutcome(invokeRequest.mapElementInvokeRequest.selectedOutcomeId, flowKey);

    if (Settings.global('history', flowKey)) {

        Model.setHistorySelectedOutcome(invokeRequest.mapElementInvokeRequest.selectedOutcomeId, invokeRequest.invokeType, flowKey);

    }

    return Ajax.invoke(invokeRequest, Utils.extractTenantId(flowKey), authenticationToken)
        .then(function (response) {

            return isAuthorized(response, flowKey);

        }, function(response) {

            notifyError(flowKey, response);

        })
        .then(function (response) {

            moveResponse = response;

            self.parseResponse(response, Model.parseEngineResponse, true, flowKey);

            State.setState(response.stateId, response.stateToken, response.currentMapElementId, flowKey);
            State.setLocation(flowKey);

            if (response.mapElementInvokeResponses[0].outcomeResponses) {

                outcome = response.mapElementInvokeResponses[0].outcomeResponses.filter(function (outcome) {

                    return outcome.id === selectedOutcomeId;

                })[0];

            }

            if (Collaboration.isInitialized(flowKey) && (!outcome || !outcome.isOut)) {

                Collaboration.move(flowKey);

            }

            return response;

        }, function (response) {

            if (response) {

                Authorization.invokeAuthorization(response, flowKey, callback);

            }

        })
        .then(function (response) {

            let selectedNavigationId = Model.getSelectedNavigation(flowKey);

            let deferreds = [];

            if (!Utils.isNullOrWhitespace(selectedNavigationId))
                deferreds.push(loadNavigation(flowKey, moveResponse.stateToken, selectedNavigationId));

            if (Settings.isDebugEnabled(flowKey))
                deferreds.push(loadExecutionLog(flowKey, authenticationToken));

            return Utils.whenAll(deferreds);

        })
        .always(function () {

            if ((outcome && !outcome.isOut) || !outcome) {

                self.render(flowKey);

            }

            Component.focusInput(flowKey);
            Component.scrollToTop(flowKey);

        })
        .always(function() {

            State.setComponentLoading(Utils.extractElement(flowKey), null, flowKey);

            if ((outcome && !outcome.isOut) || !outcome) {

                self.render(flowKey);

            }
        })
        .always(function () {

            return processObjectDataRequests(Model.getComponents(flowKey), flowKey);

        })
        .then(function() {

            if (moveResponse) {

                Callbacks.execute(flowKey, moveResponse.invokeType, null, moveResponse.currentMapElementId, [moveResponse]);
                moveResponse = null;
            }

        })
        .then(function() {
            Tours.refresh();
        })
        .always(function() {

            let lookUpKey = Utils.getLookUpKey(flowKey);
            let container = document.getElementById(lookUpKey);

            if (container) {
                let scroller = container.querySelector('.main-scroller');
                if (scroller)
                    scroller.scrollTop = 0;
            }

        });

}
/**
 * Intialize a new state of a flow (or join an existing state if the `stateId` is specified). If the user is not authenticated and the flow requires authentication a login
 * dialog will be displayed or the user will be redirected to an OAUTH2 or SAML url.
 * The flow will then be rendered into the DOm
 */
export const initialize = (tenantId: string, flowId: string, flowVersionId: string, container: string, stateId: string, authenticationToken: string, options: any, isInitializing: string | boolean) => {

    options = options || {};
    isInitializing = (isInitializing) ? ((isInitializing as string).toLowerCase() === 'true') : false;

    if (authenticationToken) authenticationToken = decodeURI(authenticationToken);

    if (!tenantId && (!stateId || (!flowId && !flowVersionId))) {

        Log.error('tenantId & stateId, or tenatntId & flowId & flowVersionId must be specified');
        return;

    }

    if (options.theme && manywho.theming)
        manywho.theming.apply(options.theme);

    let storedConfig = sessionStorage.getItem('oauth-' + stateId);
    let config = (stateId) ? !Utils.isNullOrWhitespace(storedConfig) && JSON.parse(storedConfig) : null;
    if (!config) {

        config = { tenantId: tenantId, flowId: flowId, flowVersionId: flowVersionId, container: container, options: options };

    }

    if (window.navigator.language) {
        let language = window.navigator.language.split('-');
        if (language.length === 2)
            // Upper case the culture suffix here as safari will report them as lowercase and numbro requires uppercase
            numbro.culture(language[0] + '-' + language[1].toUpperCase());
    }


    if (stateId && !isInitializing) {

        join(config.tenantId, config.flowId, config.flowVersionId, config.container, stateId, authenticationToken, config.options);

    }
    else {

        return initializeWithAuthorization.call(this,
        {
            execute: initializeWithAuthorization.bind(this),
            args: [config.tenantId, config.flowId, config.flowVersionId, config.container, config.options, authenticationToken || null],
            name: 'initialize',
            type: 'done'
        },
        config.tenantId,
        config.flowId,
        config.flowVersionId,
        config.container,
        config.options,
        authenticationToken);

    }

};

/**
 * Invoke with a `FORWARD` down a specified outcome
 */
export const move = (outcome: any, flowKey: string)  => {

    if (outcome
        && Utils.isEqual(outcome.pageActionBindingType, 'SAVE', true)
        && Settings.global('validation.isEnabled', flowKey)) {

        let isValid = State.isAllValid(flowKey);
        if (!isValid) {
            render(flowKey);
            let deferred = $.Deferred();
            deferred.fail(null);
            return deferred;
        }
    }

    if (outcome && !outcome.isOut) {
        State.setComponentLoading(Utils.extractElement(flowKey), { message: Settings.global('localization.executing') }, flowKey);
        render(flowKey);
    }

    const invokeRequest = Json.generateInvokeRequest(
        State.getState(flowKey),
        'FORWARD',
        outcome.id,
        null,
        State.getPageComponentInputResponseRequests(flowKey),
        Model.getDefaultNavigationId(flowKey),
        null,
        Settings.flow('annotations', flowKey),
        State.getLocation(flowKey),
        Settings.flow('mode', flowKey)
    );

    return moveWithAuthorization.call(this,
        {
            execute: moveWithAuthorization,
            context: this,
            args: [invokeRequest, flowKey],
            name: 'invoke',
            type: 'done'
        },
        invokeRequest,
        flowKey);

};

/**
 * Flow out to another flow, remove this flow from the DOM then re-render the new flow
 */
export const flowOut = (outcome: any, flowKey: string) => {

    const tenantId = Utils.extractTenantId(flowKey);
    const authenticationToken = State.getAuthenticationToken(flowKey);

    return Ajax.flowOut(Utils.extractStateId(flowKey), tenantId, outcome.id, authenticationToken)
            .then(response => {

                const options = State.getOptions(flowKey);
                const subFlowKey = Utils.getFlowKey(tenantId, null, null, response.stateId, Utils.extractElement(flowKey));

                Collaboration.flowOut(flowKey, response.stateId, subFlowKey);

                Utils.removeFlow(flowKey);

                join(tenantId, null, null, 'main', response.stateId, authenticationToken, options);

            });

};

/**
 * Re-join the parent state and remove this flow from the DOM
 */
export const returnToParent = (flowKey: string, parentStateId: string) => {

    const tenantId = Utils.extractTenantId(flowKey);
    const authenticationToken = State.getAuthenticationToken(flowKey);

    const options = State.getOptions(flowKey);

    State.setComponentLoading(Utils.extractElement(flowKey), null, flowKey);
    render(flowKey);

    Collaboration.returnToParent(flowKey, parentStateId);

    Utils.removeFlow(flowKey);

    return join(tenantId, null, null, 'main', parentStateId, authenticationToken, options);

};

/**
 * Invoke a `SYNC` with the platform to get the latest version of the state then re-render
 */
export const sync = (flowKey: string) => {

    let invokeRequest = Json.generateInvokeRequest(
        State.getState(flowKey),
        'SYNC',
        null,
        null,
        State.getPageComponentInputResponseRequests(flowKey),
        null,
        null,
        Settings.flow('annotations', flowKey),
        State.getLocation(flowKey),
        Settings.flow('mode', flowKey)
    );

    State.setComponentLoading(Utils.extractElement(flowKey), { message: Settings.global('localization.syncing') }, flowKey);
    render(flowKey);

    return Ajax.invoke(invokeRequest, Utils.extractTenantId(flowKey), State.getAuthenticationToken(flowKey))
        .then(response => {

            if (Utils.isEqual(response.invokeType, 'wait', true)) {

                // The engine is currently busy (processing a parallel request on this state), try again
                setTimeout(function () { sync(flowKey); }, 100);

            }
            else {

                parseResponse(response, Model.parseEngineSyncResponse, true, flowKey);
                return processObjectDataRequests(Model.getComponents(flowKey), flowKey);

            }

        })
        .always(function() {
            State.setComponentLoading(Utils.extractElement(flowKey), null, flowKey);
        })
        .always(function() {
            render(flowKey);
        });

};

/**
 * Move the state to a specific map element as defined by a navigation item specified in the flow
 */
export const navigate = (navigationId: string, navigationElementId: string, mapElementId: string, flowKey: string): JQueryDeferred<any> => {

    State.setComponentLoading('main', { message: Settings.global('localization.navigating') }, flowKey);
    render(flowKey);

    let invokeRequest = Json.generateNavigateRequest(
        State.getState(flowKey),
        navigationId,
        navigationElementId,
        mapElementId,
        State.getPageComponentInputResponseRequests(flowKey),
        Settings.flow('annotations', flowKey),
        State.getLocation(flowKey)
    );

    return moveWithAuthorization.call(this,
        {
            execute: moveWithAuthorization,
            context: this,
            args: [invokeRequest, flowKey],
            name: 'invoke',
            type: 'done'
        },
        invokeRequest,
        flowKey);

};

/**
 * Join an existing state and render it into a new container
 */
export const join = (tenantId: string, flowId: string, flowVersionId: string, container: string, stateId: string, authenticationToken: string, options: any): JQueryDeferred<any> => {

    let flowKey = Utils.getFlowKey(tenantId, flowId, flowVersionId, stateId, container);

    if (options && options.authentication != null && options.authentication.sessionId != null) {

        State.setSessionData(options.authentication.sessionId, options.authentication.sessionUrl, flowKey);

    }

    if (options && options.callbacks != null && options.callbacks.length > 0) {

        options.callbacks.forEach(function (callback) {
            Callbacks.register(flowKey, callback);
        });

    }

    Model.initializeModel(flowKey);
    Settings.initializeFlow(options, flowKey);

    State.setAuthenticationToken(authenticationToken, flowKey);
    State.setState(stateId, null, null, flowKey);
    State.setOptions(options, flowKey);

    Component.appendFlowContainer(flowKey);

    sessionStorage.setItem('oauth-' + stateId, JSON.stringify({
        tenantId: tenantId,
        flowId: flowId,
        flowVersionId: flowVersionId,
        container: container,
        options: options
    }));

    return joinWithAuthorization.call(this,
        {
            execute: joinWithAuthorization.bind(this),
            args: [flowKey],
            name: 'invoke',
            type: 'done'
        },
        flowKey);

};

/**
 * Set the components loading status, execute the objectdata request, update the components local state with the response then re-render
 * @param id The id of the component this objectdata request is being requested by
 * @param limit Number of results to return
 * @param search Search string to apply to the list filter
 * @param orderBy Property name to order results by
 * @param orderByDirection ASC or DESC
 * @param page Page offset for the list filter
 */
export const objectDataRequest = (id: string, request: any, flowKey: string, limit: number, search?: string, orderBy?: string, orderByDirection?: string, page?: number) => {

    State.setComponentLoading(id, { message: Settings.global('localization.loading') }, flowKey);
    render(flowKey);

    return Ajax.dispatchObjectDataRequest(request, Utils.extractTenantId(flowKey), Utils.extractStateId(flowKey), State.getAuthenticationToken(flowKey), limit, search, orderBy, orderByDirection, page)
        .then(response => {

            const component = Model.getComponent(id, flowKey);
            component.objectData = response.objectData;
            component.objectDataRequest.hasMoreResults = response.hasMoreResults;
            State.setComponentError(id, null, flowKey);

        })
        .fail((xhr, status, error) => {

            State.setComponentError(id, error, flowKey);

        })
        .always(() => {

            State.setComponentLoading(id, null, flowKey);
            render(flowKey);

        });

};

/**
 * Set the components loading status, execute a file data request, update the components local state with the response then re-render
 * @param id The id of the component this filedata request is being requested by
 * @param limit Number of results to return
 * @param search Search string to apply to the list filter
 * @param orderBy Property name to order results by
 * @param orderByDirection ASC or DESC
 * @param page Page offset for the list filter
 */
export const fileDataRequest = (id: string, request: any, flowKey: string, limit: number, search?: string, orderBy?: string, orderByDirection?: string, page?: number) => {

    State.setComponentLoading(id, { message: Settings.global('localization.loading') }, flowKey);
    render(flowKey);

    return Ajax.dispatchFileDataRequest(request, Utils.extractTenantId(flowKey), Utils.extractStateId(flowKey), State.getAuthenticationToken(flowKey), limit, search, orderBy, orderByDirection, page)
        .then(response => {

            const component = Model.getComponent(id, flowKey);
            component.objectData = response.objectData;
            component.fileDataRequest.hasMoreResults = response.hasMoreResults;

        })
        .fail((xhr, status, error) => {

            State.setComponentError(id, error, flowKey);

        })
        .always(() => {

            State.setComponentLoading(id, null, flowKey);
            render(flowKey);

        });

};

/**
 * Toggle the debug setting and re-render
 */
export const toggleDebug = (flowKey: string) => {

    Settings.isDebugEnabled(flowKey, !Settings.isDebugEnabled(flowKey));
    render(flowKey);

};

/**
 * Parse the platform response using the `responseParser` and update the local state. If the response status is WAIT or STATUS then kickoff an `Engine.ping`
 */
export const parseResponse = (response: any, responseParser: (model: any, response: any, flowKey: string) => void, validate: boolean, flowKey: string) => {

    responseParser.call(Model, response, flowKey);

    State.setState(response.stateId, response.stateToken, response.currentMapElementId, flowKey);
    State.refreshComponents(Model.getComponents(flowKey), validate, flowKey);

    if (Settings.flow('replaceUrl', flowKey)) {
        Utils.replaceBrowserUrl(response);
    }

    if (Utils.isEqual(response.invokeType, 'wait', true) ||
        Utils.isEqual(response.invokeType, 'status', true)) {

        ping(flowKey);
    }

};

/**
 * Call `Ajax.ping` on a success re-join the flow with `Engine.join` otherwise set a timeout and call `ping` again in 10 seconds
 */
export const ping = (flowKey: string) => {

    if (Utils.isEqual(Model.getInvokeType(flowKey), 'wait', true) ||
        Utils.isEqual(Model.getInvokeType(flowKey), 'status', true)) {

        let state = State.getState(flowKey);

        Ajax.ping(Utils.extractTenantId(flowKey), state.id, state.token, State.getAuthenticationToken(flowKey))
            .then(function (response) {

                if (response) {
                    let options = State.getOptions(flowKey);

                    join(Utils.extractTenantId(flowKey),
                                Utils.extractFlowId(flowKey),
                                Utils.extractFlowVersionId(flowKey),
                                Utils.extractElement(flowKey),
                                state.id,
                                State.getAuthenticationToken(flowKey),
                                options);

                }
                else {

                    setTimeout(function () { ping(flowKey); }, 10000);

                }

            });

    }

};

/**
 * Re-render the flow by calling `ReactDOM.render`
 */
export const render = (flowKey: string) => {

    let lookUpKey = Utils.getLookUpKey(flowKey);

    let container = document.getElementById(lookUpKey);

    if (Utils.isEqual(Utils.extractElement(flowKey), 'modal-standalone', true)) {

        container = document.querySelector(Settings.global('containerSelector', flowKey, '#manywho'));

    }

    let login = State.getLogin(flowKey);

    if (login) {

        ReactDOM.render(React.createElement(Component.getByName('mw-login'), { flowKey: flowKey, api: 'run', callback: login.callback, stateId: login.stateId, directoryName: login.directoryName, loginUrl: login.loginUrl}), container);

    } else {

        ReactDOM.render(React.createElement(Component.getByName(Utils.extractElement(flowKey)), {flowKey: flowKey, container: container}), container);

    }

};
