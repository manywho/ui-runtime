import test from 'ava'; // tslint:disable-line:import-name
import * as mockery from 'mockery';
import * as sinon from 'sinon';

const ReactDOM = {
    unmountComponentAtNode: sinon.stub(),
};

mockery.enable({
    useCleanCache: true,
    warnOnUnregistered: false,
});

mockery.registerMock('react-dom', ReactDOM);

import * as Utils from '../js/services/utils';

const flowKey = 'key1_key2_key3_key4';

test('Get Number', (t) => {
    t.is(Utils.getNumber(10), 10);
});

test('Get Number NaN', (t) => {
    t.is(Utils.getNumber('not a number'), 0);
});

test('Parse Query String', (t) => {
    const expected = {
        param1: 'value',
        param2: 'value',
    };
    t.deepEqual(Utils.parseQueryString('param1=value&param2=value'), expected);
});

test('Is Placeholder Objectdata', (t) => {
    const objectData = [
        {
            properties: {
                property1: {
                    contentValue: null,
                },
            },
        },
    ];
    t.is(Utils.isPlaceholderObjectData(objectData), true);
});

test('Is Not Placeholder Objectdata 1', (t) => {
    const objectData = [
        {
            properties: {
                property1: {
                    contentValue: 'value',
                },
            },
        },
    ];
    t.is(Utils.isPlaceholderObjectData(objectData), false);
});

test('Is Not Placeholder Objectdata 2', (t) => {
    const objectData = ['item1', 'item2'];
    t.is(Utils.isPlaceholderObjectData(objectData), false);
});

test('Is Empty Objectdata 1', (t) => {
    const model = {
        objectData: {},
    };
    t.is(Utils.isEmptyObjectData(model), false);
});

test('Is Empty Objectdata 2', (t) => {
    const model = {};
    t.is(Utils.isEmptyObjectData(model), true);
});

test('Is Empty Objectdata 3', (t) => {
    const model = {
        objectDataRequest: {},
        objectData: [
            {},
        ],
    };
    t.is(Utils.isEmptyObjectData(model), true);
});

test('Get ObjectData Property', (t) => {
    const properties = [
        {
            developerName: 'test',
        },
    ];
    const expected = {
        developerName: 'test',
    };
    t.deepEqual(Utils.getObjectDataProperty(properties, 'test'), expected);
});

test('Set ObjectData Property', (t) => {
    const properties = [
        {
            developerName: 'test',
            contentValue: null,
        },
    ];
    const expected = {
        developerName: 'test',
        contentValue: 'value',
    };

    Utils.setObjectDataProperty(properties, 'test', 'value');

    t.deepEqual(Utils.getObjectDataProperty(properties, 'test'), expected);
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

    t.deepEqual(Utils.convertToArray(source), expected);
});

test('Is Equal 1', (t) => {
    t.is(Utils.isEqual(null, null, true), true);
});

test('Is Equal 2', (t) => {
    t.is(Utils.isEqual('value', 'value', false), true);
});

test('Get', (t) => {
    const expected: any = {
        key: 'key',
    };

    const collection = [expected];

    t.deepEqual(Utils.get(collection, 'key', 'key'), expected);
});

test('Get All', (t) => {
    const map: any = {
        item1: {
            id: 'id',
        },
        item2: {
            id: 'id',
        },
    };

    const expected = [
        {
            id: 'id',
        },
        {
            id: 'id',
        },
    ];

    t.deepEqual(Utils.getAll(map, 'id', 'id'), expected);
});

test('Contains', (t) => {
    const expected: any = {
        key: 'key',
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
        prop1: 'value',
    };

    const target = {
        prop2: 'value',
    };

    const expected = {
        prop1: 'value',
        prop2: 'value',
    };

    t.deepEqual(Utils.extend(source, target, false), expected);
});

test('Guid', (t) => {
    t.is(Utils.guid().length, 36);
});

test.cb('Debounce', (t) => {

    const callback = () => {
        t.end();
    };

    const debounced = Utils.debounce(callback, 200, false);

    debounced();
    debounced();
});

test('Remove Flow From DOM', (t) => {
    const container = document.createElement('div');
    container.id = 'manywho';

    const child = document.createElement('div');
    child.id = Utils.getLookUpKey(flowKey);
    container.appendChild(child);

    document.body.appendChild(container);

    Utils.removeFlowFromDOM(flowKey);

    t.true(ReactDOM.unmountComponentAtNode.calledWith(child));
    t.true(container.children.length === 0);
});

test('Extend Objectdata', (t) => {

    const mergedObjectData = [
        {
            developerName: 'property1',
            contentValue: 'value1',
        },
        {
            developerName: 'property2',
            contentValue: 'value2',
        },
        {
            developerName: 'property3',
            objectData: 'objectData1',
        },
    ];

    const objectData = [
        {
            developerName: 'property2',
            contentValue: 'value3',
        },
        {
            developerName: 'property3',
            objectData: 'objectData2',
        },
    ];

    const expected = [
        {
            developerName: 'property1',
            contentValue: 'value1',
        },
        {
            developerName: 'property2',
            contentValue: 'value3',
        },
        {
            developerName: 'property3',
            objectData: 'objectData2',
        },
    ];

    t.deepEqual(Utils.extendObjectData(mergedObjectData, objectData), expected);
});

test('Return a fallback for unknown cultures', (t) => {
    const testCulture = ['en-XX', 'de-XX', 'fr-XX', 'es-XX', 'it-XX', 'xx-XX'];
    const expected = ['en-US', 'de-DE', 'fr-FR', 'es-ES', 'it-IT', 'en-US'];

    testCulture.forEach((culture, i) => {
        const testCultureParts = culture.split('-');
        const fallbackCulture = Utils.fallbackCulture(testCultureParts[0]);
        t.is(fallbackCulture, expected[i]);
    });
});

test('Return the current culture based on navigator language', (t) => {
    const navigatorLanguage = ['en-US', 'en-us', 'bg', 'de-XX', null];
    const supportedCultures = ['en-US', 'de-DE', 'fr-FR', 'es-ES', 'it-IT', 'bg'];
    const expected = ['en-US', 'en-US', 'bg', 'de-DE', 'en-US'];

    navigatorLanguage.forEach((navLang, i) => {
        const currentCulture = Utils.currentCulture(navLang, supportedCultures);
        t.is(currentCulture, expected[i]);
    });
});
