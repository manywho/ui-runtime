import test from 'ava'; // tslint:disable-line:import-name
import * as Json from '../js/services/json';

test('Flow Inputs (object)', (t) => {
    const inputs = {
        value: {
            contentType: 'contentType',
            developerName: 'developerName',
        },
    };

    const expected: any = [
        {
            contentType: 'contentType',
            developerName: 'developerName',
        },
    ];

    const actual = Json.generateFlowInputs(inputs);

    t.deepEqual(actual, expected);
});

test('Flow Inputs', (t) => {
    const inputs = [
        {
            simple: 'value',
        },
        {
            object: {
                objectData: ['item'],
                typeElementDeveloperName: 'typeElementDeveloperName',
            },
        },
        {
            list: {
                objectData: ['item', 'item'],
                typeElementDeveloperName: 'typeElementDeveloperName',
            },
        },
        {
            value: {
                contentType: 'contentType',
                developerName: 'developerName',
            },
        },
    ];

    const expected: any = [
        {
            contentType: 'ContentString',
            contentValue: 'value',
            developerName: 'simple',
            objectData: null,
            typeElementDeveloperName: null,
        },
        {
            contentType: 'ContentObject',
            contentValue: null,
            developerName: 'object',
            objectData: ['item'],
            typeElementDeveloperName: 'typeElementDeveloperName',
        },
        {
            contentType: 'ContentList',
            contentValue: null,
            developerName: 'list',
            objectData: ['item', 'item'],
            typeElementDeveloperName: 'typeElementDeveloperName',
        },
        {
            contentType: 'contentType',
            developerName: 'developerName',
        },
    ];

    const actual = Json.generateFlowInputs(inputs);

    t.deepEqual(actual, expected);
});

test('Intialization Request', (t) => {
    const flowId: any = {
        id: 'id',
        versionId: 'versionId',
    };

    const stateId = 'stateId';
    const annotations = 'annotations';
    const inputs = ['inputs'];
    const playerUrl = 'playerUrl';
    const joinUrl = 'joinUrl';
    const mode = 'mode';
    const reportingMode = 'reportingMode';

    const expected: any = {
        flowId,
        stateId,
        annotations,
        inputs,
        playerUrl,
        mode,
        reportingMode,
        joinPlayerUrl: joinUrl,
    };

    const actual = Json.generateInitializationRequest(flowId, stateId, annotations, inputs, playerUrl, joinUrl,
                                                      mode, reportingMode);

    t.deepEqual(actual, expected);
});

test('Intialization Request, optional', (t) => {
    const flowId: any = {
        id: 'id',
    };

    const expected: any = {
        flowId: {
            id: 'id',
            versionId: null,
        },
        stateId: null,
        annotations: null,
        inputs: null,
        playerUrl: null,
        joinPlayerUrl: null,
        mode: '',
        reportingMode: '',
    };

    const actual = Json.generateInitializationRequest(flowId);

    t.deepEqual(actual, expected);
});

test('Invoke Request', (t) => {
    const stateData = {
        id: 'id',
        token: 'token',
        currentMapElementId: 'currentMapElementId',
    };
    const invokeType = 'invokeType';
    const annotations = 'annotations';
    const location = 'location';
    const pageComponentInputResponses = ['pageComponentInputResponses'];
    const selectedOutcomeId = 'selectedOutcomeId';
    const mode = 'mode';
    const selectedMapElementId = 'selectedMapElementId';
    const navigationElementId = 'navigationElementId';
    const selectedNavigationElementId = 'selectedNavigationElementId';

    const expected: any = {
        invokeType,
        stateId: stateData.id,
        stateToken: stateData.token,
        currentMapElementId: stateData.currentMapElementId,
        annotations: annotations || null,
        geoLocation: location || null,
        mapElementInvokeRequest: {
            pageRequest: {
                pageComponentInputResponses: pageComponentInputResponses || null,
            },
            selectedOutcomeId: selectedOutcomeId || null,
        },
        mode: mode || '',
        selectedMapElementId: selectedMapElementId || null,
        navigationElementId: navigationElementId || null,
        selectedNavigationElementId: selectedNavigationElementId || null,
    };

    const actual = Json.generateInvokeRequest(
        stateData, 
        invokeType, 
        selectedOutcomeId, 
        selectedMapElementId, 
        pageComponentInputResponses, 
        navigationElementId, 
        selectedNavigationElementId,
        annotations, 
        location, 
        mode,
    );

    t.deepEqual(actual, expected);
});

test('Invoke Request, optional', (t) => {
    const stateData = {
        id: 'id',
        token: 'token',
        currentMapElementId: 'currentMapElementId',
    };
    const invokeType = 'invokeType';

    const expected: any = {
        invokeType,
        stateId: stateData.id,
        stateToken: stateData.token,
        currentMapElementId: stateData.currentMapElementId,
        annotations: null,
        geoLocation: null,
        mapElementInvokeRequest: {
            pageRequest: {
                pageComponentInputResponses: null,
            },
            selectedOutcomeId: null,
        },
        mode: '',
        selectedMapElementId: null,
        navigationElementId: null,
        selectedNavigationElementId: null,
    };

    const actual = Json.generateInvokeRequest(stateData, invokeType);

    t.deepEqual(actual, expected);
});

test('Navigate Request', (t) => {
    const stateData = {
        id: 'id',
        token: 'token',
        currentMapElementId: 'currentMapElementId',
    };
    const navigationId = 'navigationId';
    const navigationElementId = 'navigationElementId';
    const mapElementId = 'mapElementId';
    const pageComponentInputResponses = ['pageComponentInputResponses'];
    const annotations = 'annotations';
    const location = 'location';

    const expected: any = {
        stateId: stateData.id,
        stateToken: stateData.token,
        currentMapElementId: stateData.currentMapElementId,
        invokeType: 'NAVIGATE',
        navigationElementId: navigationId,
        selectedMapElementId: mapElementId,
        selectedNavigationItemId: navigationElementId,
        annotations: annotations || null,
        geoLocation: location || null,
        mapElementInvokeRequest: {
            pageRequest: {
                pageComponentInputResponses: pageComponentInputResponses || null,
            },
            selectedOutcomeId: null,
        },
    };

    const actual = Json.generateNavigateRequest(
        stateData, 
        navigationId, 
        navigationElementId, 
        mapElementId,
        pageComponentInputResponses, 
        annotations, 
        location,
    );

    t.deepEqual(actual, expected);
});

test('Navigate Request, optional', (t) => {
    const stateData = {
        id: 'id',
        token: 'token',
        currentMapElementId: 'currentMapElementId',
    };
    const navigationId = 'navigationId';
    const navigationElementId = 'navigationElementId';
    const mapElementId = 'mapElementId';

    const expected: any = {
        stateId: stateData.id,
        stateToken: stateData.token,
        currentMapElementId: stateData.currentMapElementId,
        invokeType: 'NAVIGATE',
        navigationElementId: navigationId,
        selectedMapElementId: mapElementId,
        selectedNavigationItemId: navigationElementId,
        annotations: null,
        geoLocation: null,
        mapElementInvokeRequest: {
            pageRequest: {
                pageComponentInputResponses: null,
            },
            selectedOutcomeId: null,
        },
    };

    const actual = Json.generateNavigateRequest(stateData, navigationId, navigationElementId, mapElementId);

    t.deepEqual(actual, expected);
});

test('Session Request', (t) => {
    const sessionId = 'sessionToken';
    const sessionUrl = 'sessionUrl';
    const loginUrl = 'loginUrl';
    const username = 'username';
    const password = 'password';
    const token = 'token';

    const expected: any = {
        sessionUrl,
        loginUrl,
        username,
        password,
        token,
        sessionToken: sessionId,
    };

    const actual = Json.generateSessionRequest(sessionId, sessionUrl, loginUrl, username, password, token);

    t.deepEqual(actual, expected);
});

test('Session Request, optional', (t) => {
    const sessionId = 'sessionToken';
    const sessionUrl = 'sessionUrl';
    const loginUrl = 'loginUrl';

    const expected: any = {
        loginUrl,
        sessionUrl,
        sessionToken: sessionId,
        username: null,
        password: null,
        token: null,
    };

    const actual = Json.generateSessionRequest(sessionId, sessionUrl, loginUrl);

    t.deepEqual(actual, expected);
});
