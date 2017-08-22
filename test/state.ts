import test from 'ava';
import State from '../js/services/state';

const flowKey = 'key1_key2_key3_key4';

test.beforeEach(t => {
    State.remove(flowKey);
})

test('Set Component Loading', (t) => {
    const expected = {
        loading: 'loading'
    };
    
    State.setComponentLoading('id', 'loading', flowKey);

    t.deepEqual(State.getComponent('id', flowKey), expected);
});

test('Set Component Error String', (t) => {
    const expected = {
        error: {
            message: 'error message',
            id: 'id'
        }
    };
    
    State.setComponentError('id', 'error message', flowKey);

    t.deepEqual(State.getComponent('id', flowKey), expected);
});

test('Set Component Error Object', (t) => {
    const expected = {
        error: {
            message: 'error message',
            id: 'id'
        }
    };
    
    State.setComponentError('id', { message: 'error message' }, flowKey);

    t.deepEqual(State.getComponent('id', flowKey), expected);
});

test('Set Component Error Remove', (t) => {
    const expected = {
        error: null
    };
    
    State.setComponentError('id', { message: 'error message' }, flowKey);
    State.setComponentError('id', null, flowKey);

    t.deepEqual(State.getComponent('id', flowKey), expected);
});

test('Set Session Data', (t) => {
    const expected = {
        id: 'id',
        url: 'url'
    };
    
    State.setSessionData(expected.id, expected.url, flowKey);
    
    t.deepEqual(State.getSessionData(flowKey), expected);
});

test('Set Login', (t) => {
    State.setLogin('login', flowKey);            
    t.is(State.getLogin(flowKey), 'login');
});

test('Set Options', (t) => {
    State.setOptions('options', flowKey);            
    t.is(State.getOptions(flowKey), 'options');
});

test('Set State', (t) => {
    const expected = {
        id: 'id',
        token: 'token',
        currentMapElementId: 'currentMapElementId'
    };

    State.setState(expected.id, expected.token, expected.currentMapElementId, flowKey);            
    t.deepEqual(State.getState(flowKey), expected);
});

test('Set User Time', (t) => {
    State.setUserTime(flowKey);
    t.not(State.getLocation(flowKey).time, null);
});


test('Input Responses', (t) => {
    const components = {
        'dd5b8fd9-1f25-4e57-a53e-135d94faf7a6': {
            pageComponentId: 'dd5b8fd9-1f25-4e57-a53e-135d94faf7a6',
            contentValue: 'value',
            objectData: 'objectData'
        }
    };

    State.setComponents(components, flowKey);
    
    t.deepEqual(State.getPageComponentInputResponseRequests(flowKey), [components['dd5b8fd9-1f25-4e57-a53e-135d94faf7a6']]);
});
