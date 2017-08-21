import test from 'ava';
import Json from '../js/services/json';

test('Flow Inputs (object)', (t) => {
    const inputs = {
        value: {
            contentType: 'contentType',
            developerName: 'developerName'
        }
    }

    const expected: any = [
        {
            contentType: 'contentType',
            developerName: 'developerName'
        }
    ];

    const actual = Json.generateFlowInputs(inputs);

    t.is(JSON.stringify(actual), JSON.stringify(expected));
});

test('Flow Inputs', (t) => {
    const inputs = [
        {
            simple: 'value',
        },
        {
            object: {
                objectData: ['item'],
                typeElementDeveloperName: 'typeElementDeveloperName'
            }
        },
        {
            list: {
                objectData: ['item', 'item'],
                typeElementDeveloperName: 'typeElementDeveloperName'
            }
        },
        {
            value: {
                contentType: 'contentType',
                developerName: 'developerName'
            }
        }
    ];

    const expected: any = [
        {
            'contentType': 'ContentString',
            'contentValue': 'value',
            'developerName': 'simple',
            'objectData': null,
            'typeElementDeveloperName': null
        },
        {
            'contentType': 'ContentObject',
            'contentValue': null,
            'developerName': 'object',
            'objectData': ['item'],
            'typeElementDeveloperName': 'typeElementDeveloperName'
        },
        {
            'contentType': 'ContentList',
            'contentValue': null,
            'developerName': 'list',
            'objectData': ['item', 'item'],
            'typeElementDeveloperName': 'typeElementDeveloperName'
        },
        {
            contentType: 'contentType',
            developerName: 'developerName'
        }
    ];

    const actual = Json.generateFlowInputs(inputs);

    t.is(JSON.stringify(actual), JSON.stringify(expected));
});

test('Intialization Request', (t) => {
    const flowId: any = {
        id: 'id',
        versionId: 'versionId'
    };

    const stateId = 'stateId';
    const annotations = 'annotations';
    const inputs = 'inputs';
    const playerUrl = 'playerUrl';
    const joinUrl = 'joinUrl';
    const mode = 'mode';
    const reportingMode = 'reportingMode';

    const expected: any = {
        'flowId': flowId,
        'stateId': stateId,
        'annotations': annotations,
        'inputs': inputs,
        'playerUrl': playerUrl,
        'joinPlayerUrl': joinUrl,
        'mode': mode,
        'reportingMode': reportingMode
    };

    const actual = Json.generateInitializationRequest(flowId, stateId, annotations, inputs, playerUrl, joinUrl
    , mode, reportingMode);

    t.is(JSON.stringify(actual), JSON.stringify(expected));
});

test('Intialization Request, optional', (t) => {
    const flowId: any = {
        id: 'id',
    };

    const expected: any = {
        'flowId': {
            id: 'id',
            versionId: null
        },
        'stateId': null,
        'annotations': null,
        'inputs': null,
        'playerUrl': null,
        'joinPlayerUrl': null,
        'mode': '',
        'reportingMode': ''
    };

    const actual = Json.generateInitializationRequest(flowId);

    t.is(JSON.stringify(actual), JSON.stringify(expected));
});

test('Invoke Request', (t) => {
    const stateData = {
        id: 'id',
        token: 'token',
        currentMapElementId: 'currentMapElementId'
    };
    const invokeType = 'invokeType';
    const annotations = 'annotations';
    const location = 'location';
    const pageComponentInputResponses = 'pageComponentInputResponses';
    const selectedOutcomeId = 'selectedOutcomeId';
    const mode = 'mode';
    const selectedMapElementId = 'selectedMapElementId';
    const navigationElementId = 'navigationElementId';
    const selectedNavigationElementId = 'selectedNavigationElementId';

    const expected: any = {
        'stateId': stateData.id,
        'stateToken': stateData.token,
        'currentMapElementId': stateData.currentMapElementId,
        'invokeType': invokeType,
        'annotations': annotations || null,
        'geoLocation': location || null,
        'mapElementInvokeRequest': {
            'pageRequest': {
                'pageComponentInputResponses': pageComponentInputResponses || null
            },
            'selectedOutcomeId': selectedOutcomeId || null
        },
        'mode': mode || '',
        'selectedMapElementId': selectedMapElementId || null,
        'navigationElementId': navigationElementId || null,
        'selectedNavigationElementId': selectedNavigationElementId || null
    };

    const actual = Json.generateInvokeRequest(stateData, invokeType, selectedOutcomeId, selectedMapElementId, pageComponentInputResponses, navigationElementId, selectedNavigationElementId, annotations, location, mode);

    t.is(JSON.stringify(actual), JSON.stringify(expected));
});

test('Invoke Request, optional', (t) => {
    const stateData = {
        id: 'id',
        token: 'token',
        currentMapElementId: 'currentMapElementId'
    };
    const invokeType = 'invokeType';

    const expected: any = {
        'stateId': stateData.id,
        'stateToken': stateData.token,
        'currentMapElementId': stateData.currentMapElementId,
        'invokeType': invokeType,
        'annotations': null,
        'geoLocation': null,
        'mapElementInvokeRequest': {
            'pageRequest': {
                'pageComponentInputResponses': null
            },
            'selectedOutcomeId': null
        },
        'mode': '',
        'selectedMapElementId': null,
        'navigationElementId': null,
        'selectedNavigationElementId': null
    };

    const actual = Json.generateInvokeRequest(stateData, invokeType);

    t.is(JSON.stringify(actual), JSON.stringify(expected));
});

test('Navigate Request', (t) => {
    const stateData = {
        id: 'id',
        token: 'token',
        currentMapElementId: 'currentMapElementId'
    };
    const navigationId = 'navigationId';
    const navigationElementId = 'navigationElementId';
    const mapElementId = 'mapElementId';
    const pageComponentInputResponses = 'pageComponentInputResponses';
    const annotations = 'annotations';
    const location = 'location';

    const expected: any = {
        'stateId': stateData.id,
        'stateToken': stateData.token,
        'currentMapElementId': stateData.currentMapElementId,
        'invokeType': 'NAVIGATE',
        'navigationElementId': navigationId,
        'selectedMapElementId': mapElementId,
        'selectedNavigationItemId': navigationElementId,
        'annotations': annotations || null,
        'geoLocation': location || null,
        'mapElementInvokeRequest': {
            'pageRequest': {
                'pageComponentInputResponses': pageComponentInputResponses || null
            },
            'selectedOutcomeId': null
        }
    };

    const actual = Json.generateNavigateRequest(stateData, navigationId, navigationElementId, mapElementId, pageComponentInputResponses, annotations, location);

    t.is(JSON.stringify(actual), JSON.stringify(expected));
});

test('Navigate Request, optional', (t) => {
    const stateData = {
        id: 'id',
        token: 'token',
        currentMapElementId: 'currentMapElementId'
    };
    const navigationId = 'navigationId';
    const navigationElementId = 'navigationElementId';
    const mapElementId = 'mapElementId';
      
    

    const expected: any = {
        'stateId': stateData.id,
        'stateToken': stateData.token,
        'currentMapElementId': stateData.currentMapElementId,
        'invokeType': 'NAVIGATE',
        'navigationElementId': navigationId,
        'selectedMapElementId': mapElementId,
        'selectedNavigationItemId': navigationElementId,
        'annotations': null,
        'geoLocation': null,
        'mapElementInvokeRequest': {
            'pageRequest': {
                'pageComponentInputResponses': null
            },
            'selectedOutcomeId': null
        }
    };

    const actual = Json.generateNavigateRequest(stateData, navigationId, navigationElementId, mapElementId);

    t.is(JSON.stringify(actual), JSON.stringify(expected));
});

test('Session Request', (t) => {
    const sessionId = 'sessionToken';
    const sessionUrl = 'sessionUrl';
    const loginUrl = 'loginUrl';
    const username = 'username';
    const password = 'password';
    const token = 'token';

    const expected: any = {
        'sessionToken': sessionId,
        'sessionUrl': sessionUrl,
        'loginUrl': loginUrl,
        'username': username,
        'password': password,
        'token': token
    };

    const actual = Json.generateSessionRequest(sessionId, sessionUrl, loginUrl, username, password, token);

    t.is(JSON.stringify(actual), JSON.stringify(expected));
});

test('Session Request, optional', (t) => {
    const sessionId = 'sessionToken';
    const sessionUrl = 'sessionUrl';
    const loginUrl = 'loginUrl';

    const expected: any = {
        'sessionToken': sessionId,
        'sessionUrl': sessionUrl,
        'loginUrl': loginUrl,
        'username': null,
        'password': null,
        'token': null
    };

    const actual = Json.generateSessionRequest(sessionId, sessionUrl, loginUrl);

    t.is(JSON.stringify(actual), JSON.stringify(expected));
});