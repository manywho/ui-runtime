import * as React from 'react';
import * as ReactDOM from 'react-dom';
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
import * as Validation from './validation';

declare var manywho: any;
declare var window: any;

function processObjectDataRequests(components, flowKey) {

    if (components) {

        const requestComponents = Utils.convertToArray(components).filter((component) => {

            if (component.attributes
                && (component.attributes.isExecuteRequestOnRenderDisabled === true 
                    || Utils.isEqual(component.attributes.isExecuteRequestOnRenderDisabled, 'true', true)))
                return false;

            return component.objectDataRequest != null || component.fileDataRequest != null;

        });

        return $.when.apply($, requestComponents.map((component) => {

            if (component.isVisible) {

                let limit = Settings.global('paging.' + component.componentType);
                const paginationSize = parseInt(component.attributes.paginationSize, 10);

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
    if (flowKey)
        if (State.getSessionData(flowKey) != null)
            Authorization.authorizeBySession(response.authorizationContext.loginUrl, flowKey, callback);
        else
            // Authorization failed, retry
            Authorization.invokeAuthorization(response, flowKey, callback);
}

function loadNavigation(flowKey, stateToken, navigationId, currentMapElementId?) {

    if (navigationId) {

        return Ajax.getNavigation(Utils.extractStateId(flowKey), stateToken, navigationId, Utils.extractTenantId(flowKey))
                .then((navigation) => {

                    if (navigation) {

                        Model.parseNavigationResponse(navigationId, navigation, flowKey, currentMapElementId);

                    }

                });

    }

    const deferred = $.Deferred();
    deferred.resolve();
    return deferred;

}

function loadExecutionLog(flowKey, authenticationToken) {

    return Ajax.getExecutionLog(Utils.extractTenantId(flowKey), Utils.extractFlowId(flowKey), Utils.extractStateId(flowKey), authenticationToken)
            .then((executionLog) => {

                if (executionLog) {

                    Model.setExecutionLog(flowKey, executionLog);

                }

            });

}

function notifyError(flowKey, response) {
    if (flowKey)
        if (response && !response.responseText && (response.status === 0 || response.status === 500 || response.status === 504))
            Model.addNotification(flowKey, {
                message: Settings.global('errorMessage', flowKey),
                position: 'center',
                type: 'danger',
                timeout: 0,
                dismissible: true,
            });
        else if (response)
            Model.addNotification(flowKey, {
                message: response.responseText,
                position: 'center',
                type: 'danger',
                timeout: 0,
                dismissible: true,
            });
}

function onInitializeFailed(response) {

    const container = document.querySelector(Settings.global('containerSelector', null, '#manywho'));
    container.classList.add('mw-bs');

    const alert = document.createElement('div');
    alert.className = 'alert alert-danger initialize-error';
    alert.innerText = response.responseText || response.statusText;

    container.insertBefore(alert, container.children[0]);

    return null;
}

function initializeWithAuthorization(callback, tenantId, flowId, flowVersionId, container, options, authenticationToken) {

    let flowKey = callback.flowKey;
    const stateId = (flowKey) ? Utils.extractStateId(flowKey) : null;
    let streamId = null;

    const initializationRequest = Json.generateInitializationRequest(
        { id: flowId, versionId: flowVersionId },
        stateId,
        options.annotations,
        options.inputs,
        Settings.global('playerUrl'),
        Settings.global('joinUrl'),
        options.mode,
        options.reportingMode,
    );

    State.setOptions(options, flowKey);

    if (flowKey) {

        State.setComponentLoading(Utils.extractElement(flowKey), { message: Settings.global('localization.initializing') }, flowKey);
        render(flowKey);

        authenticationToken = authenticationToken || State.getAuthenticationToken(flowKey);

    }

    return Ajax.initialize(initializationRequest, tenantId, authenticationToken)
        .then((response) => {

            window.sessionStorage.setItem('oauth-' + response.stateId, JSON.stringify({
                tenantId,
                flowId,
                flowVersionId,
                container,
                options,
            }));

            flowKey = Utils.getFlowKey(tenantId, flowId, flowVersionId, response.stateId, container);

            if (options.callbacks != null && options.callbacks.length > 0) {

                options.callbacks.forEach((callback) => {
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
            render(flowKey);

            return isAuthorized(response, flowKey);

        }, 
              onInitializeFailed) // This should only ever be called when the ajax request itself returns an error response
        .then((response) => {

            if (Settings.global('i18n.overrideTimezoneOffset', flowKey))
                State.setUserTime(flowKey);

            Formatting.initialize(flowKey);

            const invokeRequest = Json.generateInvokeRequest(
                State.getState(flowKey),
                'FORWARD',
                null,
                null,
                null,
                null,
                null,
                Settings.flow('annotations', flowKey),
                State.getLocation(flowKey),
                Settings.flow('mode', flowKey),
            );

            return Ajax.invoke(invokeRequest, Utils.extractTenantId(flowKey), State.getAuthenticationToken(flowKey));

        },
              response => onAuthorizationFailed(response, flowKey, callback))

        .then((response) => {

            window.sessionStorage.removeItem('oauth-' + response.stateId);

            parseResponse(response, Model.parseEngineResponse, 'initialize', flowKey);

            State.setState(response.stateId, response.stateToken, response.currentMapElementId, flowKey);

            if (Settings.flow('collaboration.isEnabled', flowKey)) {
                Collaboration.initialize(flowKey);
                Collaboration.join('Another user', flowKey);
            }

            State.setLocation(flowKey);

            const deferreds = [];

            const navigationId = Model.getSelectedNavigation(flowKey);

            if (!Utils.isNullOrWhitespace(navigationId))
                deferreds.push(loadNavigation(flowKey, response.stateToken, navigationId, response.currentMapElementId));

            if (Settings.isDebugEnabled(flowKey))
                deferreds.push(loadExecutionLog(flowKey, authenticationToken));

            if (streamId)
                Social.initialize(flowKey, response.currentStreamId);

            if (Utils.isEqual(response.invokeType, 'DONE', true))
                Callbacks.execute(flowKey, response.invokeType, null, response.currentMapElementId, [response]);

            return Utils.whenAll(deferreds);

        },                                                       
              response => notifyError(flowKey, response))
        .always(() => {

            if (flowKey) {
                render(flowKey);
                processObjectDataRequests(Model.getComponents(flowKey), flowKey);
            }

        })
        .then(() => {

            const autoStart = Settings.global('tours.autoStart', flowKey, false);
            const containerSelector = Settings.global('tours.container', flowKey, null);

            if (autoStart)
                if (typeof autoStart === 'string')
                    Tours.start(autoStart, containerSelector, flowKey);
                else if (typeof autoStart === 'boolean')
                    Tours.start(null, containerSelector, flowKey);

        })
        .always(() => {

            if (flowKey) {
                State.setComponentLoading(Utils.extractElement(flowKey), null, flowKey);
                render(flowKey);
            }

        })
        .then(() => flowKey);

}

function joinWithAuthorization(callback, flowKey) {

    flowKey = flowKey || callback.flowKey;

    const authenticationToken = State.getAuthenticationToken(flowKey);
    const state = State.getState(flowKey);
    let isAuthenticated = false;

    State.setComponentLoading(Utils.extractElement(flowKey), { message: Settings.global('localization.joining') }, flowKey);
    render(flowKey);

    if (Settings.global('i18n.overrideTimezoneOffset', flowKey))
        State.setUserTime(flowKey);

    Formatting.initialize(flowKey);

    return Ajax.join(state.id, Utils.extractTenantId(flowKey), authenticationToken)
        .then((response) => {

            return isAuthorized(response, flowKey);

        },    onInitializeFailed)
        .then((response) => {

            isAuthenticated = true;
            window.sessionStorage.removeItem('oauth-' + response.stateId);

            Model.initializeModel(flowKey);
            parseResponse(response, Model.parseEngineResponse, 'join', flowKey);

            State.setState(response.stateId, response.stateToken, response.currentMapElementId, flowKey);

            if (!Collaboration.isInitialized(flowKey) && Settings.flow('collaboration.isEnabled', flowKey)) {
                Collaboration.initialize(flowKey);
                Collaboration.join('Another user', flowKey);
            }

            State.setLocation(flowKey);

            const deferreds = [];

            if (response.navigationElementReferences && response.navigationElementReferences.length > 0) {

                Model.setSelectedNavigation(response.navigationElementReferences[0].id, flowKey);
                deferreds.push(
                    loadNavigation(flowKey, response.stateToken, response.navigationElementReferences[0].id, response.currentMapElementId),
                );

            }

            if (Settings.isDebugEnabled(flowKey)) {

                deferreds.push(loadExecutionLog(flowKey, authenticationToken));

            }

            if (response.currentStreamId) {

                Social.initialize(flowKey, response.currentStreamId);

            }

            return Utils.whenAll(deferreds);

        }, 
              (response) => {

                  onAuthorizationFailed(response, flowKey, callback);

              })
        .always(() => {

            render(flowKey);
            return processObjectDataRequests(Model.getComponents(flowKey), flowKey);

        })
        .always(() => {

            if (isAuthenticated) {

                State.setComponentLoading(Utils.extractElement(flowKey), null, flowKey);
                render(flowKey);

            }

        })
        .then(() => flowKey);

}

function moveWithAuthorization(callback, invokeRequest, flowKey) {

    flowKey = callback.flowKey || flowKey;

    const authenticationToken = State.getAuthenticationToken(flowKey);
    let moveResponse = null;
    let outcome = null;
    const selectedOutcomeId = invokeRequest.mapElementInvokeRequest.selectedOutcomeId;

    if (selectedOutcomeId)
        outcome = Model.getOutcome(invokeRequest.mapElementInvokeRequest.selectedOutcomeId, flowKey);

    if (Settings.global('history', flowKey)) {

        Model.setHistorySelectedOutcome(invokeRequest.mapElementInvokeRequest.selectedOutcomeId, invokeRequest.invokeType, flowKey);

    }

    return Ajax.invoke(invokeRequest, Utils.extractTenantId(flowKey), authenticationToken)
        .then((response) => {

            return isAuthorized(response, flowKey);

        },    (response) => {

            notifyError(flowKey, response);

        })
        .then((response) => {

            moveResponse = response;

            parseResponse(response, Model.parseEngineResponse, 'move', flowKey);

            State.setState(response.stateId, response.stateToken, response.currentMapElementId, flowKey);
            State.setLocation(flowKey);

            if (response.mapElementInvokeResponses[0].outcomeResponses)
                outcome = response.mapElementInvokeResponses[0].outcomeResponses.find(outcome => outcome.id === selectedOutcomeId);

            if (Collaboration.isInitialized(flowKey) && (!outcome || !outcome.isOut)) {

                Collaboration.move(flowKey);

            }

            return response;

        },    (response) => {

            if (response) {

                Authorization.invokeAuthorization(response, flowKey, callback);

            }

        })
        .then((response) => {

            const selectedNavigationId = Model.getSelectedNavigation(flowKey);

            const deferreds = [];

            if (!Utils.isNullOrWhitespace(selectedNavigationId))
                deferreds.push(loadNavigation(flowKey, moveResponse.stateToken, selectedNavigationId));

            if (Settings.isDebugEnabled(flowKey))
                deferreds.push(loadExecutionLog(flowKey, authenticationToken));

            return Utils.whenAll(deferreds);

        })
        .always(() => {

            if ((outcome && !outcome.isOut) || !outcome) {

                render(flowKey);

            }

            Component.focusInput(flowKey);
            Component.scrollToTop(flowKey);

        })
        .always(() => {

            State.setComponentLoading(Utils.extractElement(flowKey), null, flowKey);

            if ((outcome && !outcome.isOut) || !outcome) {

                render(flowKey);

            }
        })
        .always(() => {

            return processObjectDataRequests(Model.getComponents(flowKey), flowKey);

        })
        .then(() => {

            if (moveResponse) {

                Callbacks.execute(flowKey, moveResponse.invokeType, null, moveResponse.currentMapElementId, [moveResponse]);
                moveResponse = null;
            }

        })
        .then(() => {
            Tours.refresh();
        })
        .always(() => {

            const lookUpKey = Utils.getLookUpKey(flowKey);
            const container = document.getElementById(lookUpKey);

            if (container) {
                const scroller = container.querySelector('.main-scroller');
                if (scroller)
                    scroller.scrollTop = 0;
            }

        })
        .then(() => flowKey);

}
/**
 * Intialize a new state of a flow (or join an existing state if the `stateId` is specified). If the user is not 
 * authenticated and the flow requires authentication a login dialog will be displayed or the user will be redirected to an OAUTH2 or SAML url.
 * The flow will then be rendered into the DOm
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

    options = options || {};
    isInitializing = (isInitializing) ? ((isInitializing as string).toLowerCase() === 'true') : false;

    if (authenticationToken) authenticationToken = decodeURI(authenticationToken);

    if (!tenantId && (!stateId || (!flowId && !flowVersionId))) {

        Log.error('tenantId & stateId, or tenatntId & flowId & flowVersionId must be specified');
        return;

    }

    if (options.theme && manywho.theming)
        manywho.theming.apply(options.theme);

    const storedConfig = window.sessionStorage.getItem('oauth-' + stateId);
    let config = (stateId) ? !Utils.isNullOrWhitespace(storedConfig) && JSON.parse(storedConfig) : null;
    if (!config) {

        config = { tenantId, flowId, flowVersionId, container, options };

    }

    if (window.navigator.language) {
        const language = window.navigator.language.split('-');
        if (language.length === 2)
            // Upper case the culture suffix here as safari will report them as lowercase and numbro requires uppercase
            window.numbro.culture(language[0] + '-' + language[1].toUpperCase());
    }


    if (stateId && !isInitializing) {

        join(config.tenantId, config.flowId, config.flowVersionId, config.container, stateId, authenticationToken, config.options);

    }
    else {

        return initializeWithAuthorization.call(
            this,
            {
                execute: initializeWithAuthorization.bind(this),
                args: [config.tenantId, config.flowId, config.flowVersionId, config.container, config.options, authenticationToken || null],
                name: 'initialize',
                type: 'done',
                context: this,
            },
            config.tenantId,
            config.flowId,
            config.flowVersionId,
            config.container,
            config.options,
            authenticationToken,
        );

    }

};

/**
 * Invoke with a `FORWARD` down a specified outcome
 */
export const move = (outcome: any, flowKey: string)  => {

    if (outcome
        && Utils.isEqual(outcome.pageActionBindingType, 'SAVE', true)
        && Settings.global('validation.isEnabled', flowKey)) {

        const isValid = State.isAllValid(flowKey);
        if (!isValid) {
            render(flowKey);

            requestAnimationFrame(() => {
                Validation.scrollToInvalidElement(flowKey);
                Validation.addNotification(flowKey);
            });

            const deferred = $.Deferred();
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
        Settings.flow('mode', flowKey),
    );

    return moveWithAuthorization.call(
        this,
        {
            execute: joinWithAuthorization,
            context: this,
            args: [flowKey],
            name: 'invoke',
            type: 'done',
        },
        invokeRequest,
        flowKey,
    );

};

/**
 * Flow out to another flow, remove this flow from the DOM then re-render the new flow
 */
export const flowOut = (outcome: any, flowKey: string) => {

    const tenantId = Utils.extractTenantId(flowKey);
    const authenticationToken = State.getAuthenticationToken(flowKey);

    return Ajax.flowOut(Utils.extractStateId(flowKey), tenantId, outcome.id, authenticationToken)
            .then((response) => {

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

    const invokeRequest = Json.generateInvokeRequest(
        State.getState(flowKey),
        'SYNC',
        null,
        null,
        State.getPageComponentInputResponseRequests(flowKey),
        null,
        null,
        Settings.flow('annotations', flowKey),
        State.getLocation(flowKey),
        Settings.flow('mode', flowKey),
    );

    State.setComponentLoading(Utils.extractElement(flowKey), { message: Settings.global('localization.syncing') }, flowKey);
    render(flowKey);

    return Ajax.invoke(invokeRequest, Utils.extractTenantId(flowKey), State.getAuthenticationToken(flowKey))
        .then((response) => {

            if (Utils.isEqual(response.invokeType, 'wait', true)) {

                // The engine is currently busy (processing a parallel request on this state), try again
                setTimeout(() => { sync(flowKey); }, 100);

            }
            else {

                parseResponse(response, Model.parseEngineSyncResponse, 'sync', flowKey);
                return processObjectDataRequests(Model.getComponents(flowKey), flowKey);

            }

        })
        .always(() => {
            State.setComponentLoading(Utils.extractElement(flowKey), null, flowKey);
        })
        .always(() => {
            render(flowKey);
        });

};

/**
 * Move the state to a specific map element as defined by a navigation item specified in the flow
 */
export const navigate = (navigationId: string, navigationElementId: string, mapElementId: string, flowKey: string): JQueryDeferred<any> => {

    State.setComponentLoading('main', { message: Settings.global('localization.navigating') }, flowKey);
    render(flowKey);

    const invokeRequest = Json.generateNavigateRequest(
        State.getState(flowKey),
        navigationId,
        navigationElementId,
        mapElementId,
        State.getPageComponentInputResponseRequests(flowKey),
        Settings.flow('annotations', flowKey),
        State.getLocation(flowKey),
    );

    return moveWithAuthorization.call(
        this,
        {
            execute: moveWithAuthorization,
            context: this,
            args: [invokeRequest, flowKey],
            name: 'invoke',
            type: 'done',
        },
        invokeRequest,
        flowKey,
    );

};

/**
 * Join an existing state and render it into a new container
 */
export const join = (
    tenantId: string,
    flowId: string, 
    flowVersionId: string, 
    container: string, 
    stateId: string, 
    authenticationToken: 
    string, 
    options: any,
): JQueryDeferred<any> => {

    const flowKey = Utils.getFlowKey(tenantId, flowId, flowVersionId, stateId, container);

    if (options && options.authentication != null && options.authentication.sessionId != null) {

        State.setSessionData(options.authentication.sessionId, options.authentication.sessionUrl, flowKey);

    }

    if (options && options.callbacks != null && options.callbacks.length > 0) {

        options.callbacks.forEach((callback) => {
            Callbacks.register(flowKey, callback);
        });

    }

    Model.initializeModel(flowKey);
    Settings.initializeFlow(options, flowKey);

    State.setAuthenticationToken(authenticationToken, flowKey);
    State.setState(stateId, null, null, flowKey);
    State.setOptions(options, flowKey);

    Component.appendFlowContainer(flowKey);

    window.sessionStorage.setItem('oauth-' + stateId, JSON.stringify({
        tenantId,
        flowId,
        flowVersionId,
        container,
        options,
    }));

    return joinWithAuthorization.call(
        this,
        {
            execute: joinWithAuthorization.bind(this),
            args: [flowKey],
            name: 'invoke',
            type: 'done',
            context: this,
        },
        flowKey,
    );

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
export const objectDataRequest = (
    id: string, 
    request: any, 
    flowKey: string,
    limit: number, 
    search?: string, 
    orderBy?: string,
    orderByDirection?: string, 
    page?: number,
) => {

    State.setComponentLoading(id, { message: Settings.global('localization.loading') }, flowKey);
    render(flowKey);

    return Ajax.dispatchObjectDataRequest(
        request, Utils.extractTenantId(flowKey), 
        Utils.extractStateId(flowKey), 
        State.getAuthenticationToken(flowKey),
        limit, 
        search, 
        orderBy, 
        orderByDirection, 
        page,
    )
        .then((response) => {

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
export const fileDataRequest = (
    id: string, 
    request: any, 
    flowKey: string, 
    limit: number, 
    search?: string, 
    orderBy?: string, 
    orderByDirection?: string, 
    page?: number,
) => {

    State.setComponentLoading(id, { message: Settings.global('localization.loading') }, flowKey);
    render(flowKey);

    return Ajax.dispatchFileDataRequest(
        request, 
        Utils.extractTenantId(flowKey), 
        Utils.extractStateId(flowKey), 
        State.getAuthenticationToken(flowKey), 
        limit, 
        search, 
        orderBy,
        orderByDirection,
        page,
    )
        .then((response) => {

            const component = Model.getComponent(id, flowKey);
            component.objectData = response.objectData;
            component.fileDataRequest.hasMoreResults = response.hasMoreResults;

        })
        .fail((xhr, status, error) => {

            State.setComponentError(id, error, flowKey);
            return error;

        })
        .always((error) => {

            State.setComponentLoading(id, null, flowKey);
            render(flowKey);

            if (error)
                return error;
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
 * Parse the platform response using the `responseParser` and update the local state. If the response status is WAIT or STATUS 
 * then kickoff an `Engine.ping`
 */
export const parseResponse = (
    response: any, 
    responseParser: (model: any, response: any, flowKey: string) => void, 
    invokeType: string, 
    flowKey: string,
) => {

    responseParser.call(Model, response, flowKey);

    State.setState(response.stateId, response.stateToken, response.currentMapElementId, flowKey);
    State.refreshComponents(Model.getComponents(flowKey), invokeType, flowKey);

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

        const state = State.getState(flowKey);

        return Ajax.ping(Utils.extractTenantId(flowKey), state.id, state.token, State.getAuthenticationToken(flowKey))
            .then((response) => {

                if (response) {
                    const options = State.getOptions(flowKey);

                    join(Utils.extractTenantId(flowKey),
                         Utils.extractFlowId(flowKey),
                         Utils.extractFlowVersionId(flowKey),
                         Utils.extractElement(flowKey),
                         state.id,
                         State.getAuthenticationToken(flowKey),
                         options);

                }
                else {

                    setTimeout(() => { ping(flowKey); }, 10000);

                }

            });

    }

};

/**
 * Re-render the flow by calling `ReactDOM.render`
 */
export const render = (flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    let container = document.getElementById(lookUpKey);

    if (Utils.isEqual(Utils.extractElement(flowKey), 'modal-standalone', true)) {

        container = document.querySelector(Settings.global('containerSelector', flowKey, '#manywho'));

    }

    const login = State.getLogin(flowKey);

    if (login)
        ReactDOM.render(React.createElement(Component.getByName('mw-login'), { 
            flowKey, 
            api: 'run',
            callback: login.callback,
            stateId: login.stateId,
            directoryName: login.directoryName, 
            loginUrl: login.loginUrl,
        }),             container);
    else
        ReactDOM.render(React.createElement(Component.getByName(Utils.extractElement(flowKey)), { flowKey, container }), container);
};
