import test from 'ava';
import * as mockery from 'mockery';
import * as sinon from 'sinon';

const engine = {
    default: {
        render: sinon.stub(),
        sync: sinon.stub().resolves(),
        move: sinon.stub().resolves(),
        flowOut: sinon.stub()
    }
};

const collaboration = {
    default: {
        sync: sinon.stub()
    }
};

const react = {
    createElement: sinon.stub()
};

mockery.enable({
    useCleanCache: true,
    warnOnUnregistered: false
});

mockery.registerMock('./engine', engine);
mockery.registerMock('./collaboration', collaboration);
mockery.registerMock('react', react);

import Component from '../js/services/component';
import * as Settings from '../js/services/settings';
import Utils from '../js/services/utils';

const flowKey = 'key1_key2_key3_key4';

test.beforeEach(t => {
    engine.default.render.resetHistory();
    engine.default.sync.resetHistory();
    engine.default.move.resetHistory();
    engine.default.flowOut.resetHistory();
    collaboration.default.sync.resetHistory();
    react.createElement.resetHistory();
});

test.after(t => {
    mockery.deregisterAll();
    mockery.disable();
});

test('Register', (t) => {
    Component.register('component-1', 'component-1', ['alias-1']);
    t.is(Component.getByName('component-1'), 'component-1');
    t.is(Component.getByName('alias-1'), 'component-1');
});

test('Register Items', (t) => {
    Component.register('mw-items-container', 'mw-items-container', null);
    Component.registerItems('items-1', 'items-1');
    t.is(Component.getByName('items-1'), 'mw-items-container');
    t.is(Component.getByName('mw-items-1'), 'items-1');
});

test('Register Alias', (t) => {
    Component.register('component-2', 'component-2', null);
    Component.registerAlias('alias-2', 'component-2');
    t.is(Component.getByName('alias-2'), 'component-2');
});

test('Register Container', (t) => {
    Component.register('mw-container', 'mw-container', null);
    Component.registerContainer('container-1', 'container-1');
    t.is(Component.getByName('container-1'), 'mw-container');
    t.is(Component.getByName('mw-container-1'), 'container-1');
});

test('Get 1', (t) => {
    Component.register('component-1', 'component-1', ['alias-1']);
    const component = { componentType: 'component-1' };
    t.is(Component.get(component), 'component-1');
});

test('Get 2', (t) => {
    Component.register('component-1', 'component-1', ['alias-1']);
    const component = { componentType: 'alias-1' };
    t.is(Component.get(component), 'component-1');
});

test('Get Child Components', (t) => {
    Component.register('component-1', 'component-1', null);

    const model = [
        {
            id: 'id',
            componentType:'component-1',
            order: 2
        },
        {
            id: 'id',
            componentType:'component-1',
            order: 1
        }
    ];

    const expected = {
        id: 'id',
        parentId: 'parentId',
        flowKey: flowKey,
        key: 'id'
    }

    t.is(Component.getChildComponents(model, 'parentId', flowKey).length, 2);
    t.is(react.createElement.args[0][0], 'component-1');
    t.deepEqual(react.createElement.args[0][1], expected);
});

test('Get Outcomes', (t) => {
    Component.register('outcome', 'outcome-1', null);
    
    const model = [
        {
            id: 'id1',
            order: 1
        },
        {
            id: 'id2',
            order: 2
        }
    ];

    const expected = {
        id: 'id1',
        flowKey: flowKey,
        key: 'id1'
    }

    t.is(Component.getOutcomes(model, flowKey).length, 2);
    t.is(react.createElement.args[0][0], 'outcome-1');
    t.deepEqual(react.createElement.args[0][1], expected);
});

test.cb.serial('Handle Event', (t) => {
    const model = {
        hasEvents: true
    };

    const component = {
        forceUpdate: function() { t.pass(); }
    };

    const callback = function() {
        t.is(engine.default.render.callCount, 1, 'Engine Render Count');
        t.is(engine.default.sync.callCount, 1, 'Engine Sync Count');
        t.is(collaboration.default.sync.callCount, 1, 'Collaboration Sync Count');
        t.end();
    };

    Component.handleEvent(component, model, flowKey, callback);
});

test('Get Selected Rows 1', (t) => {
    t.is(Component.getSelectedRows(null, null).length, 0);
});

test('Get Selected Rows 1', (t) => {
    t.is(Component.getSelectedRows(null, null).length, 0);
});

test('Get Selected Rows 2', (t) => {
    const model = {
        objectData: [
            {
                externalId: 'id1'
            },
            {
                externalId: 'id2'
            }
        ]
    };

    const ids = ['id1', 'id2'];

    const expected = [
        {
            externalId: 'id1',
            isSelected: true
        },
        {
            externalId: 'id2',
            isSelected: true
        }
    ]

    t.deepEqual(Component.getSelectedRows(model, ids), expected);
});

test('Get Display Columns 1', (t) => {
    t.is(Component.getDisplayColumns(null), null);
});

test('Get Display Columns 2', (t) => {
    const columns = [
        {
            properties: [
                {
                    developerName: 'isDisplayValue',
                    contentValue: 'false'
                }
            ]
        }
    ];
    t.deepEqual(Component.getDisplayColumns(columns), []);
});

test('Get Display Columns 3', (t) => {
    const columns = [
        {
            properties: [
                {
                    developerName: 'isDisplayValue',
                    contentValue: 'true'
                }
            ]
        }
    ];
    t.not(Component.getDisplayColumns(columns), null);
    t.is(Component.getDisplayColumns(columns).length, 1);
});

test('Get Display Columns 4', (t) => {
    const columns = [
        {
            isDisplayValue: true
        }
    ];
    t.not(Component.getDisplayColumns(columns), null);
    t.is(Component.getDisplayColumns(columns).length, 1);
});

test('Append Flow Container', (t) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);

    const container = document.createElement('div');
    container.id = 'manywho';
    document.body.appendChild(container);

    Component.appendFlowContainer(flowKey);

    t.not(document.getElementById(Utils.getLookUpKey(flowKey)), null);
});

test.failing('Focus Input', (t) => {
    (window as any).innerWidth = 800;

    Settings.initializeFlow({
        autoFocusInput: true
    }, flowKey);

    const root = document.createElement('div');
    root.classList.add('main');

    const container = document.createElement('div');
    root.classList.add('mw-input');

    const input = document.createElement('input');
    input.id = 'focused';
    input.type = 'text';

    container.appendChild(input);
    root.appendChild(container);
    document.body.appendChild(root);

    Component.focusInput(flowKey);

    t.is(document.activeElement, null);
});

test('Scroll To Top', (t) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    const container = document.createElement('div');
    container.id = lookUpKey;
    Component.scrollToTop(flowKey);
    t.pass();
});

test.serial('On Outcome 1', async (t) => {
    const outcome = {
        isOut: true
    }

    return Component.onOutcome(outcome, null, flowKey)
        .then(() => {
            t.is(engine.default.move.callCount, 1, 'Move');
            t.is(engine.default.flowOut.callCount, 1, 'Flow Out');
        });
});

test.serial('On Outcome 2', async (t) => {
    const outcome = {
        isOut: false
    }

    return Component.onOutcome(outcome, null, flowKey)
        .then(() => {
            t.is(engine.default.move.callCount, 1, 'Move');
            t.is(engine.default.flowOut.callCount, 0, 'Flow Out');
        });
});

test('On Outcome 3', async (t) => {
    const outcome = {
        attributes: {
            uri: 'https://manywho.com'
        }
    };

    const spy = sinon.spy(window, 'open');

    Component.onOutcome(outcome, null, flowKey);

    t.is(spy.withArgs(outcome.attributes.uri, '_blank').calledOnce, true);

    spy.restore();
});

test('On Outcome 3', async (t) => {
    const outcome = {
        attributes: {
            uriTypeElementPropertyId: 'id'
        }
    };

    const objectData = [{
        properties: [
            {
                typeElementPropertyId: 'id',
                contentValue: 'https://manywho.com'
            }
        ]
    }];

    const spy = sinon.spy(window, 'open');

    Component.onOutcome(outcome, objectData, flowKey);

    t.is(spy.withArgs(objectData[0].properties[0].contentValue, '_blank').calledOnce, true);

    spy.restore();
});
