import * as React from 'react';
import ReactDOM from 'react-dom';
import * as $ from 'jquery';

import '../lib/jquery.plugins';

import Ajax from './ajax';
import Authorization from './authorization';
import Callbacks from './callbacks';
import Collaboration from './collaboration';
import Component from './component';
import Formatting from './formatting';
import Json from './json';
import Log from './log';
import Model from './model';
import Settings from './settings';
import Social from './social';
import State from './state';
import Tours from './tours';
import Utils from './utils';

declare var manywho: any;
declare var numbro: any;

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

                    return exports.default.fileDataRequest(component.id, component.fileDataRequest, flowKey, limit);

                }
                else {

                    return exports.default.objectDataRequest(component.id, component.objectDataRequest, flowKey, limit);

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
            timeout: '0',
            dismissible: true
        });

    } else if (response) {

        Model.addNotification(flowKey, {
            message: response.responseText,
            position: 'center',
            type: 'danger',
            timeout: '0',
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

            Collaboration.initialize(Settings.flow('collaboration.isEnabled', flowKey), flowKey);
            Collaboration.join('Another user', flowKey);

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

            if (!Collaboration.isInitialized(flowKey)) {

                Collaboration.initialize(Settings.flow('collaboration.isEnabled', flowKey), flowKey);
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

export default {

    initialize: function(tenantId, flowId, flowVersionId, container, stateId, authenticationToken, options, isInitializing) {

        options = options || {};
        isInitializing = (isInitializing) ? (isInitializing.toLowerCase() === 'true') : false;

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

            this.join(config.tenantId, config.flowId, config.flowVersionId, config.container, stateId, authenticationToken, config.options);

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

    },

    move: function(outcome, flowKey) {

        if (outcome
            && Utils.isEqual(outcome.pageActionBindingType, 'SAVE', true)
            && Settings.global('validation.isEnabled', flowKey)) {

            let isValid = State.isAllValid(flowKey);
            if (!isValid) {
                exports.default.render(flowKey);
                let deferred = $.Deferred();
                deferred.fail(null);
                return deferred;
            }
        }

        if (outcome && !outcome.isOut) {
            State.setComponentLoading(Utils.extractElement(flowKey), { message: Settings.global('localization.executing') }, flowKey);
            this.render(flowKey);
        }

        let invokeRequest = Json.generateInvokeRequest(
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

    },

    flowOut: function(outcome, flowKey) {

        let tenantId = Utils.extractTenantId(flowKey);
        let authenticationToken = State.getAuthenticationToken(flowKey);

        return Ajax.flowOut(Utils.extractStateId(flowKey), tenantId, outcome.id, authenticationToken)
                .then(function(response) {

                    let options = State.getOptions(flowKey);

                    let subFlowKey = Utils.getFlowKey(tenantId, null, null, response.stateId, Utils.extractElement(flowKey));

                    Collaboration.flowOut(flowKey, response.stateId, subFlowKey);

                    Utils.removeFlow(flowKey);

                    exports.default.join(tenantId, null, null, 'main', response.stateId, authenticationToken, options);

                });

    },

    returnToParent: function(flowKey, parentStateId) {

        let tenantId = Utils.extractTenantId(flowKey);
        let authenticationToken = State.getAuthenticationToken(flowKey);

        let options = State.getOptions(flowKey);

        State.setComponentLoading(Utils.extractElement(flowKey), null, flowKey);
        this.render(flowKey);

        Collaboration.returnToParent(flowKey, parentStateId);

        Utils.removeFlow(flowKey);

        exports.default.join(tenantId, null, null, 'main', parentStateId, authenticationToken, options);

    },

    sync: function(flowKey) {

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
        let self = this;

        State.setComponentLoading(Utils.extractElement(flowKey), { message: Settings.global('localization.syncing') }, flowKey);
        this.render(flowKey);

        return Ajax.invoke(invokeRequest, Utils.extractTenantId(flowKey), State.getAuthenticationToken(flowKey))
            .then(function (response) {

                if (Utils.isEqual(response.invokeType, 'wait', true)) {

                    // The engine is currently busy (processing a parallel request on this state), try again
                    setTimeout(function () { self.sync(flowKey); }, 100);

                }
                else {

                    self.parseResponse(response, Model.parseEngineSyncResponse, true, flowKey);
                    return processObjectDataRequests(Model.getComponents(flowKey), flowKey);

                }

            })
            .always(function() {
                State.setComponentLoading(Utils.extractElement(flowKey), null, flowKey);
            })
            .always(function() {
                exports.default.render(flowKey);
            });

    },

    navigate: function(navigationId, navigationElementId, mapElementId, flowKey) {

        State.setComponentLoading('main', { message: Settings.global('localization.navigating') }, flowKey);
        this.render(flowKey);

        let invokeRequest = Json.generateNavigateRequest(
            State.getState(flowKey),
            navigationId,
            navigationElementId,
            mapElementId,
            State.getPageComponentInputResponseRequests(flowKey),
            Settings.flow('annotations', flowKey),
            State.getLocation(flowKey)
        );

        moveWithAuthorization.call(this,
            {
                execute: moveWithAuthorization,
                context: this,
                args: [invokeRequest, flowKey],
                name: 'invoke',
                type: 'done'
            },
            invokeRequest,
            flowKey);

    },

    join: function (tenantId, flowId, flowVersionId, container, stateId, authenticationToken, options) {

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

    },

    objectDataRequest: function(id, request, flowKey, limit, search, orderBy, orderByDirection, page) {

        let self = this;

        State.setComponentLoading(id, { message: Settings.global('localization.loading') }, flowKey);
        self.render(flowKey);

        return Ajax.dispatchObjectDataRequest(request, Utils.extractTenantId(flowKey), Utils.extractStateId(flowKey), State.getAuthenticationToken(flowKey), limit, search, orderBy, orderByDirection, page)
            .then(function (response) {

                let component = Model.getComponent(id, flowKey);
                component.objectData = response.objectData;
                component.objectDataRequest.hasMoreResults = response.hasMoreResults;
                State.setComponentError(id, null, flowKey);

            })
            .fail(function (xhr, status, error) {

                State.setComponentError(id, error, flowKey);

            })
            .always(function () {

                State.setComponentLoading(id, null, flowKey);
                self.render(flowKey);

            });

    },

    fileDataRequest: function (id, request, flowKey, limit, search, orderBy, orderByDirection, page) {

        let self = this;

        State.setComponentLoading(id, { message: Settings.global('localization.loading') }, flowKey);
        self.render(flowKey);

        return Ajax.dispatchFileDataRequest(request, Utils.extractTenantId(flowKey), Utils.extractStateId(flowKey), State.getAuthenticationToken(flowKey), limit, search, orderBy, orderByDirection, page)
            .then(function (response) {

                let component = Model.getComponent(id, flowKey);
                component.objectData = response.objectData;
                component.fileDataRequest.hasMoreResults = response.hasMoreResults;

            })
            .fail(function (xhr, status, error) {

                State.setComponentError(id, error, flowKey);

            })
            .always(function () {

                State.setComponentLoading(id, null, flowKey);
                self.render(flowKey);

            });

    },

    toggleDebug: function(flowKey) {

        Settings.isDebugEnabled(flowKey, !Settings.isDebugEnabled(flowKey));
        this.render(flowKey);

    },

    parseResponse: function(response, responseParser, validate, flowKey) {

        responseParser.call(Model, response, flowKey);

        State.setState(response.stateId, response.stateToken, response.currentMapElementId, flowKey);
        State.refreshComponents(Model.getComponents(flowKey), validate, flowKey);

        if (Settings.flow('replaceUrl', flowKey)) {
            Utils.replaceBrowserUrl(response);
        }

        if (Utils.isEqual(response.invokeType, 'wait', true) ||
            Utils.isEqual(response.invokeType, 'status', true)) {

            exports.default.ping(flowKey);
        }

    },

    ping: function (flowKey) {

        if (Utils.isEqual(Model.getInvokeType(flowKey), 'wait', true) ||
            Utils.isEqual(Model.getInvokeType(flowKey), 'status', true)) {

            let state = State.getState(flowKey);
            let self = this;

            Ajax.ping(Utils.extractTenantId(flowKey), state.id, state.token, State.getAuthenticationToken(flowKey))
                .then(function (response) {

                    if (response) {
                        let options = State.getOptions(flowKey);

                        self.join(Utils.extractTenantId(flowKey),
                                    Utils.extractFlowId(flowKey),
                                    Utils.extractFlowVersionId(flowKey),
                                    Utils.extractElement(flowKey),
                                    state.id,
                                    State.getAuthenticationToken(flowKey),
                                    options);

                    }
                    else {

                        setTimeout(function () { self.ping(flowKey); }, 10000);

                    }

                });

        }

    },

    render: function (flowKey) {

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

    }
};
