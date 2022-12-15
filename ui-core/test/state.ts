import test from 'ava';
import * as mockery from 'mockery';
import moment from 'moment';
import * as sinon from 'sinon';

const validation = {
    validate: sinon.stub(),
};

const model = {
    getComponents: sinon.stub().returns({
        id: {},
    }),
    getComponent: sinon.stub().returns({
        isRequired: true,
    }),
};

const collaboration = {
    push: sinon.stub(),
};

mockery.enable({
    useCleanCache: true,
    warnOnUnregistered: false,
});

mockery.registerMock('./model', model);
mockery.registerMock('./validation', validation);
mockery.registerMock('./collaboration', collaboration);

import * as Settings from '../js/services/settings';
import * as State from '../js/services/state';

const flowKey = 'key1_key2_key3_key4';

test.beforeEach(() => {
    State.remove(flowKey);
    validation.validate.resetHistory();
    model.getComponents.resetHistory();
    model.getComponent.resetHistory();
    collaboration.push.resetHistory();
});

test.after(() => {
    mockery.deregisterAll();
    mockery.disable();
});

test.serial('Set Component Loading', (t) => {
    const expected = {
        loading: {
            message: 'loading',
        },
    };

    State.setComponentLoading('id', expected.loading, flowKey);

    t.deepEqual(State.getComponent('id', flowKey), expected);
});

test.serial('Set Component Error String', (t) => {
    const expected = {
        error: {
            id: 'id',
            message: 'error message',
        },
    };

    State.setComponentError('id', 'error message', flowKey);

    t.deepEqual(State.getComponent('id', flowKey), expected);
});

test.serial('Set Component Error Object', (t) => {
    const expected = {
        error: {
            message: 'error message',
            id: 'id',
        },
    };

    State.setComponentError('id', { message: 'error message' }, flowKey);

    t.deepEqual(State.getComponent('id', flowKey), expected);
});

test.serial('Set Component Error Remove', (t) => {
    const expected = {
        error: null,
    };

    State.setComponentError('id', { message: 'error message' }, flowKey);
    State.setComponentError('id', null, flowKey);

    t.deepEqual(State.getComponent('id', flowKey), expected);
});

test.serial('Set Session Data', (t) => {
    const expected = {
        id: 'id',
        url: 'url',
    };

    State.setSessionData(expected.id, expected.url, flowKey);

    t.deepEqual(State.getSessionData(flowKey), expected);
});

test.serial('Set Login', (t) => {
    State.setLogin('login', flowKey);
    t.is(State.getLogin(flowKey), 'login');
});

test.serial('Set Options', (t) => {
    State.setOptions('options', flowKey);
    t.is(State.getOptions(flowKey), 'options');
});

test.serial('Set State', (t) => {
    const expected = {
        id: 'id',
        token: 'token',
        currentMapElementId: 'currentMapElementId',
    };

    State.setState(expected.id, expected.token, expected.currentMapElementId, flowKey);
    t.deepEqual(State.getState(flowKey), expected);
});

test.serial('Set User Time', (t) => {
    State.setUserTime(flowKey);
    t.not(State.getLocation(flowKey).time, null);
});

test.serial('Set User Time With Offset', (t) => {
    t.plan(2);

    Settings.initialize(
        {
            i18n: {
                timezoneOffset: -8,
            },
        },
        null,
    );

    State.setUserTime(flowKey);

    t.not(State.getLocation(flowKey).time, null);

    t.not(State.getLocation(flowKey).time.indexOf('-08:00'), -1);
});

test.serial('Input Responses', (t) => {
    const components = {
        'dd5b8fd9-1f25-4e57-a53e-135d94faf7a6': {
            pageComponentId: 'dd5b8fd9-1f25-4e57-a53e-135d94faf7a6',
            contentValue: 'value',
            objectData: [],
        },
    };

    State.setComponents(components, flowKey);

    t.deepEqual(State.getPageComponentInputResponseRequests(flowKey), [
        components['dd5b8fd9-1f25-4e57-a53e-135d94faf7a6'],
    ]);
});

test.serial('Set Location', (t) => {
    Settings.initialize(
        {
            trackLocation: true,
            i18n: {
                timezoneOffset: null,
            },
        },
        null,
    );

    const expected = {
        latitude: 1,
        longitude: 2,
        accuracy: 3,
        altitude: 4,
        altitudeAccuracy: 5,
        heading: 6,
        speed: 7,
        time: moment().format(),
    };

    (window.navigator.geolocation as any) = {
        getCurrentPosition: (callback) => {
            callback({ coords: expected });
        },
    };

    State.setLocation(flowKey);

    t.deepEqual(State.getLocation(flowKey), expected);
});

test.serial('Refresh Components', (t) => {
    const id = '73d2bbeb-c45e-44af-bd14-163c83fdbd83';
    const models = {};
    models[id] = {
        objectData: [
            {
                id: 'item1',
                isSelected: true,
            },
            {
                id: 'item2',
                isSelected: false,
            },
        ],
        contentValue: 'value',
    };

    const expected = {};
    expected[id] = {
        contentValue: 'value',
        objectData: [
            {
                id: 'item1',
                isSelected: true,
            },
        ],
    };

    State.refreshComponents(models, flowKey);
    t.deepEqual(State.getComponents(flowKey), expected);
});

test.serial('Set Component with client-side validation disabled', (t) => {
    // Mock the validate() method guarded by 'validation.isEnabled' as if disabled.
    validation.validate.returns({
        isValid: true,
        validationMessage: null,
    });

    const models = {
        id: {
            isValid: false,
        },
    };
    State.refreshComponents(models, flowKey);

    const values = {
        contentValue: 'value',
        objectData: [],
    };
    State.setComponent('id', values, flowKey, true);

    const expected = {
        contentValue: 'value',
        isValid: true,
        objectData: [],
        validationMessage: null,
    };

    t.deepEqual(State.getComponent('id', flowKey), expected);
    t.is(collaboration.push.callCount, 1);

    validation.validate.resetBehavior();
});

test.serial('Set Component with client-side validation enabled', (t) => {
    // Mock the validate() method guarded by 'validation.isEnabled' as if enabled.
    validation.validate.returns({
        isValid: false,
        validationMessage: 'not valid',
    });

    const models = {
        id: {
            isValid: false,
        },
    };
    State.refreshComponents(models, flowKey);

    const values = {
        contentValue: 'value',
        objectData: [],
    };
    State.setComponent('id', values, flowKey, true);

    const expected = {
        contentValue: 'value',
        isValid: false,
        objectData: [],
        validationMessage: 'not valid',
    };

    t.deepEqual(State.getComponent('id', flowKey), expected);
    t.is(collaboration.push.callCount, 1);

    validation.validate.resetBehavior();
});

test.serial('Validation', (t) => {
    validation.validate.returns({
        isValid: false,
        validationMessage: 'message',
    });

    const models = {
        id: {},
    };
    State.refreshComponents(models, flowKey);

    const expected = {
        contentValue: null,
        objectData: null,
        isValid: false,
        validationMessage: 'message',
    };

    t.is(State.isAllValid(flowKey), false);
    t.deepEqual(State.getComponent('id', flowKey), expected);
});
