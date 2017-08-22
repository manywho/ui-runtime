import test from 'ava';
import Utils from '../js/services/utils';

const flowKey = 'key1_key2_key3_key4';

test('Get Number', (t) => {
    t.is(Utils.getNumber(10), 10);
});

test('Get Number NaN', (t) => {
    t.is(Utils.getNumber('not a number'), 10);
});

test('Parse Query String', (t) => {
    const expected = {
        param1: 'value',
        param2: 'value'
    };
    t.deepEqual(Utils.parseQueryString('param1=value&param2=value'), expected);
});

test('Is Placeholder Objectdata', (t) => {
    const objectData = [
        {
            properties: {
                property1: {
                    contentValue: null
                }
            }
        }
    ]
    t.is(Utils.isPlaceholderObjectData(null), true);
});

test('Is Empty Objectdata 1', (t) => {
    const model = {
        objectData: {}
    }
    t.is(Utils.isEmptyObjectData(model), false);
});

test('Is Empty Objectdata 2', (t) => {
    const model = {}
    t.is(Utils.isEmptyObjectData(model), true);
});

test('Is Empty Objectdata 3', (t) => {
    const model = {
        objectDataRequest: {},
        objectData: [
            {}
        ]
    }
    t.is(Utils.isEmptyObjectData(model), true);
});

test('Get ObjectData Property', (t) => {
    const properties = [
        {
            developerName: 'test'
        }
    ];
    const expected = {
        developerName: 'test'
    };
    t.is(Utils.getObjectDataProperty(properties, 'test'), expected);
});

test('Set ObjectData Property', (t) => {
    const properties = [
        {
            developerName: 'test',
            contentValue: null
        }
    ];
    const expected = {
        developerName: 'test',
        contentValue: 'value'
    };

    Utils.setObjectDataProperty(properties, 'test', 'value');

    t.is(Utils.getObjectDataProperty(properties, 'test'), expected);
});

test('Is Small Screen', (t) => {
    window.resizeTo(100, 100);
    
    const div = document.createElement('div');
    div.id = Utils.getLookUpKey(flowKey);

    document.body.appendChild(div);

    t.is(Utils.isSmallScreen(flowKey), true);
});

test('Is Embedded', (t) => {
    document.documentElement.classList.add('manywho');

    t.is(Utils.isEmbedded(), false);
});

test('Convert To Array', (t) => {
    const source = {
        property1: 'value1',
        property2: 'value2',
    };

    const expected = ['value1', 'value2'];

    t.is(Utils.convertToArray(source), expected);
});

test('Is Equal 1', (t) => {
    t.is(Utils.isEqual(null, null, true), true);
});

test('Is Equal 2', (t) => {
    t.is(Utils.isEqual('value', 'value', false), true);
});

test('Replace Browser Url', (t) => {
    window.history.replaceState(null, '', `${window.location.origin}?param1=value1&param2=value2`);
    Utils.parseQueryString({
        stateToken: 'statetoken'
    });

    t.is(window.location, null);
});

test('Get', (t) => {
    const expected: any = {
        key: 'key'
    };

    const collection = [expected];

    t.deepEqual(Utils.get(collection, 'key', 'key'), expected);
});

test('Get All', (t) => {
    const map: any = {
        item1: {
            id: 'id'
        },
        item2: {
            id: 'id'
        }
    }

    const expected = [
        {
            id: 'id'
        },
        {
            id: 'id'
        }
    ]

    t.deepEqual(Utils.getAll(map, 'id', 'id'), expected);
});

test('Contains', (t) => {
    const expected: any = {
        key: 'key'
    };

    const collection = [expected];

    t.is(Utils.contains(collection, 'key', 'key'), true);
});

test('Remove Loading Indicator', (t) => {
    const indicator = document.createElement('div');
    indicator.id = 'indicator';

    document.body.appendChild(indicator);

    Utils.removeLoadingIndicator('indicator');

    t.is(document.getElementById('inidicator'), null);
});

test('Extend', (t) => {
    const source = {
        prop1: 'value'
    };

    const target = {
        prop2: 'value'
    };

    const expected = {
        prop1: 'value',
        prop2: 'value'
    };

    t.deepEqual(Utils.extend(source, target, false), expected);
});

test('Guid', (t) => {
    t.is(Utils.guid().length, 36);
});

