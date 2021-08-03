import test from 'ava'; // tslint:disable-line:import-name
import * as sinon from 'sinon';
import * as mockery from 'mockery';
import * as $ from 'jquery';

const flowKey = 'key1_key2_key3_key4__main';

const react = {
    createElement: sinon.stub(),
};

const ReactDOM = {
    render: sinon.stub(),
    unmountComponentAtNode: sinon.stub(),
};

const ajax = {
    initialize: sinon.stub(),
    invoke: sinon.stub(),
    ping: sinon.stub().resolves({}),
    dispatchObjectDataRequest: sinon.stub(),
    dispatchFileDataRequest: sinon.stub(),
    flowOut: sinon.stub(),
    getNavigation: sinon.stub(),
    join: sinon.stub(),
};

const state = {
    getState: sinon.stub().returns({}),
    setState: sinon.stub(),
    refreshComponents: sinon.stub().returns([]),
    getAuthenticationToken: sinon.stub().returns('authenticationToken'),
    setAuthenticationToken: sinon.stub(),
    getOptions: sinon.stub().returns('options'),
    setComponentLoading: sinon.stub(),
    setComponentError: sinon.stub(),
    getPageComponentInputResponseRequests: sinon.stub(),
    getLocation: sinon.stub(),
    setLocation: sinon.stub(),
    getLogin: sinon.stub().returns('login'),
    setOptions: sinon.stub(),
};

const model = {
    initializeModel: sinon.stub(),
    getComponents: sinon.stub().returns([]),
    getComponent: sinon.stub().returns({}),
    parseEngineSyncResponse: sinon.stub(),
    parseEngineResponse: sinon.stub(),
    getInvokeType: sinon.stub(),
    getSelectedNavigation: sinon.stub(),
    setSelectedNavigation: sinon.stub(),
    getDefaultNavigationId: sinon.stub(),
    getOutcome: sinon.stub(),
    parseNavigationResponse: sinon.stub(),
};

const social = {
    initialize: sinon.stub(),
};

const reactErrorBoundary = {
    withErrorBoundary: sinon.stub().returnsArg(0),
};

(window as any).sessionStorage = {
    getItem: sinon.stub(),
    setItem: sinon.stub(),
    removeItem: sinon.stub(),
};

(window as any)['numbro'] = {
    cultures: sinon.stub().returns({
        'en-US': { languageTag: 'en-US' },
        'en-GB': { languageTag: 'en-GB' },
        'de-DE': { languageTag: 'en-DE' },
        'fr-FR': { languageTag: 'en-FR' },
        'es-ES': { languageTag: 'en-ES' },
        'it-IT': { languageTag: 'en-IT' },
    }),
    culture: sinon.spy(),
};

mockery.enable({
    useCleanCache: true,
    warnOnUnregistered: false,
});

mockery.registerMock('react', react);
mockery.registerMock('react-dom', ReactDOM);
mockery.registerMock('react-error-boundary', reactErrorBoundary);
mockery.registerMock('./ajax', ajax);
mockery.registerMock('./state', state);
mockery.registerMock('./model', model);
mockery.registerMock('./social', social);

import * as Settings from '../js/services/settings';
import * as Engine from '../js/services/engine';
import * as Utils from '../js/services/utils';
import * as Component from '../js/services/component';
import * as Model from '../js/services/model';
import * as State from '../js/services/state';
import * as Collaboration from '../js/services/collaboration';

test.before((t) => {
    Settings.initialize(
        {
            platform: {
                uri: 'https://flow.manywho.com',
            },
        },
        null,
    );

    (window as any).sessionStorage = {
        getItem: sinon.stub(),
        setItem: sinon.stub(),
        removeItem: sinon.stub(),
    };

    sinon.stub(Engine, 'render');
    sinon.stub(Engine, 'join');
    sinon.stub(Utils, 'removeFlow');
});

test.beforeEach((t) => {
    const container = document.createElement('div');
    container.id = 'manywho';
    document.body.appendChild(container);
});

test.afterEach((t) => {
    ReactDOM.render.resetHistory();
    ReactDOM.unmountComponentAtNode.resetHistory();
    react.createElement.resetHistory();

    (Engine.render as sinon.SinonStub).resetHistory();
    (Engine.join as sinon.SinonStub).resetHistory();
    (Utils.removeFlow as sinon.SinonStub).resetHistory();
    (Engine.render as sinon.SinonStub).resetHistory();

    state.setState.resetHistory();
    model.parseEngineResponse.resetHistory();

    (Object as any).values(state).forEach((value) => {
        value.resetHistory && value.resetHistory();
    });

    document.body.removeChild(document.getElementById('manywho'));
});

test.serial('Initialize', (t) => {
    const initializeResponse = {
        stateId: 'key4',
        stateToken: 'stateToken',
        currentMapElementId: 'currentMapElementId',
        currentStreamId: 'currentStreamId',
        navigationElementReferences: [
            {
                id: 'navigationId',
            },
        ],
    };

    ajax.initialize.callsFake(() => {
        const deferred = $.Deferred();
        deferred.resolve(initializeResponse);
        return deferred;
    });

    const invokeResponse = {
        stateId: 'key4',
        stateToken: 'stateToken',
        currentMapElementId: 'currentMapElementId',
        currentStreamId: 'currentStreamId',
        navigationElementReferences: [
            {
                id: 'navigationId',
            },
        ],
    };

    ajax.invoke.callsFake(() => {
        const deferred = $.Deferred();
        deferred.resolve(invokeResponse);
        return deferred;
    });

    ajax.getNavigation.callsFake(() => {
        const deferred = $.Deferred();
        deferred.resolve({
            developerName: 'Test Navigation',
            isEnabled: true,
            isVisible: true,
            navigationItemDataResponses: [{
                isActive: false,
                isCurrent: true,
                isEnabled: true,
                isVisible: true,
                locationMapElementId: '735487cb-21e2-4467-b560-d725648b6257',
                navigationItemDeveloperName: 'Home',
                navigationItemId: 'c5086605-f34e-4d06-ba9e-83144e990641',
            }],
            navigationItemResponses: [{
                developerName: 'Home',
                id: 'c5086605-f34e-4d06-ba9e-83144e990641',
                label: 'Home',
                navigationItems: null,
                order: 0,
            }],
        });
        return deferred;
    });

    const options = {
        navigationElementId: 'navigationId',
        navigation: {},
    };

    return Engine.initialize('key1', 'key2', 'key3', null, null, 'authenticationToken', options, 'true')
        .always((flowKey) => {
            t.not(flowKey, null);
            t.true(model.initializeModel.calledWith(flowKey));
            /*t.true(state.setState.calledWith(
                flowKey,
                initializeResponse.stateId,
                initializeResponse.stateToken,
                initializeResponse.currentMapElementId,
            ));*/
            t.true(state.setAuthenticationToken.calledWith('authenticationToken', flowKey));
            t.true(model.setSelectedNavigation.calledTwice);
            t.true(model.setSelectedNavigation.firstCall.calledWith(initializeResponse.navigationElementReferences[0].id, flowKey));
            t.true(model.setSelectedNavigation.secondCall.calledWith(options.navigationElementId, flowKey));
            t.true(state.setComponentLoading.calledTwice);
            t.true(state.setComponentLoading.firstCall.calledWith('', { message: '' }, flowKey));
            t.true(state.setComponentLoading.secondCall.calledWith('', null, flowKey));
            t.true(model.parseEngineResponse.calledOnce);
            t.true(state.setState.calledWith(invokeResponse.stateId, invokeResponse.stateToken, invokeResponse.currentMapElementId, flowKey));
            t.true(state.setLocation.calledWith(flowKey));
            t.true(social.initialize.calledWith(flowKey, invokeResponse.currentStreamId));
        });
});

test.serial.cb('Initialize Failed', (t) => {
    ajax.initialize.callsFake(() => {
        const deferred = $.Deferred();
        deferred.reject({
            statusText: 'error',
        });
        return deferred;
    });

    const options = {
        navigationElementId: 'navigationId',
        navigation: {},
    };

    Engine.initialize('tenantId', 'flowId', 'flowVersionId', null, null, null, options, null)
        .always(() => {
            t.not(document.querySelector('.alert'), null);
            t.end();
        });
});

test.serial('Move', (t) => {
    const invokeResponse = {
        stateId: 'key4',
        stateToken: 'stateToken',
        currentMapElementId: 'currentMapElementId',
        currentStreamId: 'currentStreamId',
        navigationElementReferences: [
            {
                id: 'navigationId',
            },
        ],
        mapElementInvokeResponses: [
            {
                outcomeResponses: null,
            },
        ],
    };

    ajax.invoke.callsFake(() => {
        const deferred = $.Deferred();
        deferred.resolve(invokeResponse);
        return deferred;
    });

    ajax.getNavigation.callsFake(() => {
        const deferred = $.Deferred();
        deferred.resolve({
            developerName: 'Test Navigation',
            isEnabled: true,
            isVisible: true,
            navigationItemDataResponses: [{
                isActive: false,
                isCurrent: true,
                isEnabled: true,
                isVisible: true,
                locationMapElementId: '735487cb-21e2-4467-b560-d725648b6257',
                navigationItemDeveloperName: 'Home',
                navigationItemId: 'c5086605-f34e-4d06-ba9e-83144e990641',
            }],
            navigationItemResponses: [{
                developerName: 'Home',
                id: 'c5086605-f34e-4d06-ba9e-83144e990641',
                label: 'Home',
                navigationItems: null,
                order: 0,
            }],
        });
        return deferred;
    });

    model.getDefaultNavigationId.returns('navigationId');
    model.getOutcome.returns({ id: 'outcome' });

    const options = {
        navigationElementId: 'navigationId',
    };

    const outcome = {
        id: 'outcome',
    };

    return Engine.move(outcome, flowKey)
        .always((flowKey) => {
            t.not(flowKey, null);
            /*t.true(state.setState.firstCall.calledWith(
                flowKey,
                invokeResponse.stateId,
                invokeResponse.stateToken,
                invokeResponse.currentMapElementId,
            ));*/
            t.true(state.setComponentLoading.calledTwice);
            t.true(state.setComponentLoading.firstCall.calledWith('', { message: '' }, flowKey));
            t.true(state.setComponentLoading.secondCall.calledWith('', null, flowKey));
            t.is(model.parseEngineResponse.callCount, 1);
            t.true(state.setState.calledWith(invokeResponse.stateId, invokeResponse.stateToken, invokeResponse.currentMapElementId, flowKey));
            t.true(state.setLocation.calledWith(flowKey));
        });
});

test.serial('Join', (t) => {
    (Engine.join as sinon.SinonStub).restore();

    const invokeResponse = {
        stateId: 'key4',
        stateToken: 'stateToken',
        currentMapElementId: 'currentMapElementId',
        currentStreamId: 'currentStreamId',
        navigationElementReferences: [
            {
                id: 'navigationId',
            },
        ],
        mapElementInvokeResponses: [
            {
                outcomeResponses: null,
            },
        ],
    };

    ajax.join.callsFake(() => {
        const deferred = $.Deferred();
        deferred.resolve(invokeResponse);
        return deferred;
    });

    ajax.getNavigation.callsFake(() => {
        const deferred = $.Deferred();
        deferred.resolve({
            developerName: 'Test Navigation',
            isEnabled: true,
            isVisible: true,
            navigationItemDataResponses: [{
                isActive: false,
                isCurrent: true,
                isEnabled: true,
                isVisible: true,
                locationMapElementId: '735487cb-21e2-4467-b560-d725648b6257',
                navigationItemDeveloperName: 'Home',
                navigationItemId: 'c5086605-f34e-4d06-ba9e-83144e990641',
            }],
            navigationItemResponses: [{
                developerName: 'Home',
                id: 'c5086605-f34e-4d06-ba9e-83144e990641',
                label: 'Home',
                navigationItems: null,
                order: 0,
            }],
        });
        return deferred;
    });

    model.getDefaultNavigationId.returns('navigationId');
    model.getOutcome.returns({ id: 'outcome' });

    const options = {
        navigationElementId: 'navigationId',
    };

    const outcome = {
        id: 'outcome',
    };

    return Engine.join('Key1', 'Key2', 'Key3', 'main', 'key4', 'authenticationToken', options)
        .always((flowKey) => {
            t.not(flowKey, null);
            sinon.stub(Engine, 'join');
        });
});

test.serial('Render', (t) => {
    const container = document.createElement('div');
    container.id = Utils.getLookUpKey(flowKey);
    document.querySelector('#manywho').appendChild(container);

    (Engine.render as sinon.SinonStub).restore();

    Engine.render(flowKey);

    t.true(ReactDOM.render.calledOnce);
    t.true(react.createElement.calledOnce);
    t.deepEqual(react.createElement.args[0][0], Component.getByName('main'));

    sinon.stub(Engine, 'render');
});

test.serial('Render Login', (t) => {
    const container = document.createElement('div');
    container.id = Utils.getLookUpKey(flowKey);
    document.querySelector('#manywho').appendChild(container);

    (Engine.render as sinon.SinonStub).restore();

    Engine.render(flowKey);

    t.true(ReactDOM.render.calledOnce);
    t.true(react.createElement.calledOnce);
    t.deepEqual(react.createElement.args[0][0], Component.getByName('mw-login'));

    sinon.stub(Engine, 'render');
});

test.serial('Don\'t render if there is no container', (t) => {
    (Engine.render as sinon.SinonStub).restore();

    Engine.render(flowKey);

    t.false(ReactDOM.render.calledOnce);

    sinon.stub(Engine, 'render');
});

test.serial('Ping', (t) => {
    model.getInvokeType.returns('WAIT');

    return Engine.ping(flowKey)
        .then(() => {
            t.true((Engine.join as sinon.SinonStub).calledWith('key1', 'key2', 'key3', '', undefined, 'authenticationToken', 'options'));
        });
});

test.serial('Parse Response', (t) => {
    const response = {
        stateId: 'stateId',
        stateToken: 'stateToken',
        currentMapElementId: 'currentMapElementId',
        invokeType: 'WAIT',
    };

    const parser = (data, flowKey) => {
        t.deepEqual(data, response);
    };

    const ping = sinon.stub(Engine, 'ping');

    Engine.parseResponse(response, parser, response.invokeType, flowKey);

    t.true(state.setState.calledWith(response.stateId, response.stateToken, response.currentMapElementId));
    t.true(state.refreshComponents.calledWith([], flowKey));
    t.true(ping.calledOnce);
});

test.serial('Toggle Debug', (t) => {
    Settings.initializeFlow({}, flowKey);

    Engine.toggleDebug(flowKey);
    t.true(Settings.isDebugEnabled(flowKey));
    t.true((Engine.render as sinon.SinonStub).calledOnce);

    Engine.toggleDebug(flowKey);
    t.false(Settings.isDebugEnabled(flowKey));
    t.true((Engine.render as sinon.SinonStub).calledTwice);
});

test.serial('FileDataRequest Success', (t) => {
    ajax.dispatchFileDataRequest.callsFake(() => {
        const deferred =  $.Deferred();
        deferred.resolve({
            objectData: 'objectData',
            hasMoreResults: true,
        });
        return deferred;
    });

    model.getComponent.returns({
        objectData: null,
        fileDataRequest: {},
    });

    return Engine.fileDataRequest('id', 'request', flowKey, 10, 'search', 'orderBy', 'orderByDirection', 1)
        .then(() => {
            t.true((Engine.render as sinon.SinonStub).calledTwice);
            t.true(state.setComponentError.calledWith('id', null, flowKey));
            t.true(state.setComponentLoading.firstCall.calledWith('id', { message: '' }, flowKey));
            t.true(state.setComponentLoading.secondCall.calledWith('id', null, flowKey));
        });
});

test.serial('FileDataRequest Fail', async (t) => {
    ajax.dispatchFileDataRequest.callsFake(() => {
        const deferred = $.Deferred();
        deferred.reject('xhr', 'status', 'error');
        return deferred;
    });

    model.getComponent.returns({
        objectData: null,
        fileDataRequest: {},
    });

    return Engine.fileDataRequest('id', 'request', flowKey, 10, 'search', 'orderBy', 'orderByDirection', 1).catch(() => {
        t.true((Engine.render as sinon.SinonStub).calledTwice);
        t.true(state.setComponentError.calledWith('id', 'error', flowKey));
        t.true(state.setComponentLoading.firstCall.calledWith('id', { message: '' }, flowKey));
        t.true(state.setComponentLoading.secondCall.calledWith('id', null, flowKey));
    });
});

test.serial('FileDataRequest Fail extended error response', async (t) => {
    ajax.dispatchFileDataRequest.callsFake(() => {
        const deferred = $.Deferred();
        deferred.reject({ responseJSON: { message: 'API error message returned' } }, 'status', '');
        return deferred;
    });

    model.getComponent.returns({
        objectData: null,
        fileDataRequest: {},
    });

    return Engine.fileDataRequest('id', 'request', flowKey, 10, 'search', 'orderBy', 'orderByDirection', 1).catch(() => {
        t.true((Engine.render as sinon.SinonStub).calledTwice);
        t.true(state.setComponentError.calledWith('id', 'API error message returned', flowKey));
        t.true(state.setComponentLoading.firstCall.calledWith('id', { message: '' }, flowKey));
        t.true(state.setComponentLoading.secondCall.calledWith('id', null, flowKey));
    });
});

test.serial('ObjectDataRequest Success', (t) => {
    ajax.dispatchObjectDataRequest.callsFake(() => {
        const deferred =  $.Deferred();
        deferred.resolve({
            objectData: 'objectData',
            hasMoreResults: true,
        });
        return deferred;
    });

    model.getComponent.returns({
        objectData: null,
        objectDataRequest: {},
    });

    return Engine.objectDataRequest('id', 'request', flowKey, 10, 'search', 'orderBy', 'orderByDirection', 1)
        .then(() => {
            t.true((Engine.render as sinon.SinonStub).calledTwice);
            t.true(state.setComponentError.calledWith('id', null, flowKey));
            t.true(state.setComponentLoading.firstCall.calledWith('id', { message: '' }, flowKey));
            t.true(state.setComponentLoading.secondCall.calledWith('id', null, flowKey));
        });
});

test.serial('ObjectDataRequest Fail', async (t) => {
    ajax.dispatchObjectDataRequest.callsFake(() => {
        const deferred =  $.Deferred();
        deferred.reject('xhr', 'status', 'error');
        return deferred;
    });

    model.getComponent.returns({
        objectData: null,
        objectDataRequest: {},
    });

    return Engine.objectDataRequest('id', 'request', flowKey, 10, 'search', 'orderBy', 'orderByDirection', 1).catch(() => {
        t.true((Engine.render as sinon.SinonStub).calledTwice);
        t.true(state.setComponentError.calledWith('id', 'error', flowKey));
        t.true(state.setComponentLoading.firstCall.calledWith('id', { message: '' }, flowKey));
        t.true(state.setComponentLoading.secondCall.calledWith('id', null, flowKey));
    });
});

test.serial('ObjectDataRequest Fail extended error response', async (t) => {
    ajax.dispatchObjectDataRequest.callsFake(() => {
        const deferred =  $.Deferred();
        deferred.reject({ responseJSON: { message: 'API error message returned' } }, 'status', '');
        return deferred;
    });

    model.getComponent.returns({
        objectData: null,
        objectDataRequest: {},
    });

    return Engine.objectDataRequest('id', 'request', flowKey, 10, 'search', 'orderBy', 'orderByDirection', 1).catch(() => {
        t.true((Engine.render as sinon.SinonStub).calledTwice);
        t.true(state.setComponentError.calledWith('id', 'API error message returned', flowKey));
        t.true(state.setComponentLoading.firstCall.calledWith('id', { message: '' }, flowKey));
        t.true(state.setComponentLoading.secondCall.calledWith('id', null, flowKey));
    });
});

test.serial('Sync', (t) => {
    ajax.invoke.callsFake(() => {
        const deferred =  $.Deferred();
        deferred.resolve({
            invokeType: 'FORWARD',
        });
        return deferred;
    });

    model.getComponents.returns([
        {
            componentType: 'comp-type',
            attributes: {
                isExecuteRequestOnRenderDisabled: true,
            },
        },
        {
            componentType: 'comp-type',
            attributes: {
                paginationSize: 10,
            },
            objectDataRequest: {},
            isVisible: true,
        },
        {
            componentType: 'comp-type',
            attributes: {
                paginationSize: 10,
            },
            fileDataRequest: {},
            isVisible: true,
        },
    ]);

    const objectDataRequest = sinon.stub(Engine, 'objectDataRequest').resolves(null);

    return Engine.sync(flowKey)
        .always(() => {
            t.true(model.parseEngineSyncResponse.calledOnce);
            t.true((Engine.render as sinon.SinonStub).calledTwice);
            t.true(state.setComponentLoading.firstCall.calledWith('', { message: '' }, flowKey));
            t.true(state.setComponentLoading.secondCall.calledWith('', null, flowKey));
            t.true(objectDataRequest.calledOnce);

            objectDataRequest.restore();
        });
});

test.serial('Return To Parent', (t) => {
    sinon.stub(Collaboration, 'returnToParent');

    Engine.returnToParent(flowKey, 'parentStateId');

    t.true(state.setComponentLoading.calledWith('', null, flowKey));
    t.true((Engine.render as sinon.SinonStub).calledOnce);
    t.true((Collaboration.returnToParent as sinon.SinonStub).calledWith(flowKey, 'parentStateId'));
    t.true((Engine.join as sinon.SinonStub).calledWith('key1', null, null, 'main', 'parentStateId', 'authenticationToken', 'options'));
});

test.serial('Flow Out', (t) => {
    sinon.stub(Collaboration, 'flowOut');

    ajax.flowOut.callsFake(() => {
        const deferred =  $.Deferred();
        deferred.resolve({
            stateId: 'stateId',
        });
        return deferred;
    });

    return Engine.flowOut({}, flowKey)
        .then(() => {
            t.true((Collaboration.flowOut as sinon.SinonStub).calledWith(flowKey, 'stateId', 'key1___stateId_'));
            t.true((Engine.join as sinon.SinonStub).calledWith('key1', null, null, 'main', 'stateId', 'authenticationToken', 'options'));
        });
});

test('Check Locale with undefined navigator.language', (t) => {
    // force specific language
    Object.defineProperty(window.navigator, 'language', { value: null, configurable: true });
    const spy = window['numbro'].culture;

    Engine.checkLocale();

    t.is(spy.called, true);
    t.is(spy.calledWith('en-US'), true);
    spy.reset();
});

test('Check Locale with supported navigator.language', (t) => {
    // force specific language
    Object.defineProperty(window.navigator, 'language', { value: 'en-GB', configurable: true });
    const spy = window['numbro'].culture;

    Engine.checkLocale();

    t.is(spy.called, true);
    t.is(spy.calledWith('en-GB'), true);
    spy.reset();
});

test('Check Locale with un-supported navigator.language variant', (t) => {
    // force specific language
    Object.defineProperty(window.navigator, 'language', { value: 'de-XX', configurable: true });
    const spy = window['numbro'].culture;

    Engine.checkLocale();

    t.is(spy.called, true);
    t.is(spy.calledWith('de-DE'), true);
    spy.reset();
});

test('Check Locale with navigator.language as en-CA', (t) => {
    // force specific language
    Object.defineProperty(window.navigator, 'language', { value: 'en-CA', configurable: true });
    const spy = window['numbro'].culture;

    Engine.checkLocale();

    t.is(spy.called, true);
    t.is(spy.calledWith('en-CA'), true);
    spy.reset();
});
