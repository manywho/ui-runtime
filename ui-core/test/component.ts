import test from 'ava'; // tslint:disable-line:import-name
import * as mockery from 'mockery';
import * as sinon from 'sinon';

const engine = {
    render: sinon.stub(),
    sync: sinon.stub().resolves(),
    move: sinon.stub().resolves(),
    flowOut: sinon.stub(),
};

const collaboration = {
    sync: sinon.stub(),
};

const react = {
    createElement: sinon.stub(),
};

const ReactDOM = {
    render: sinon.stub(),
    unmountComponentAtNode: sinon.stub(),
    ReactCurrentDispatcher: sinon.stub(),
};

const reactErrorBoundary = {
    withErrorBoundary: sinon.stub().returnsArg(0),
};


mockery.enable({
    useCleanCache: true,
    warnOnUnregistered: false,
});

mockery.registerMock('./engine', engine);
mockery.registerMock('./collaboration', collaboration);
mockery.registerMock('react', react);
mockery.registerMock('react-dom', ReactDOM);
mockery.registerMock('react-error-boundary', reactErrorBoundary);

import { ReactNode } from 'react';
import * as Component from '../js/services/component';
import * as Settings from '../js/services/settings';
import * as Utils from '../js/services/utils';

const flowKey = 'key1_key2_key3_key4_key5';

test.beforeEach((t) => {
    engine.render.resetHistory();
    engine.sync.resetHistory();
    engine.move.resetHistory();
    engine.flowOut.resetHistory();
    collaboration.sync.resetHistory();
    react.createElement.resetHistory();
});

test.after((t) => {
    mockery.deregisterAll();
    mockery.disable();
});

test.serial('Register', (t) => {
    const component = () => null;

    Component.register('component-1', component, ['alias-1']);

    t.deepEqual(Component.getByName('component-1'), component);
    t.deepEqual(Component.getByName('alias-1'), component);
});

test.serial('Register Items', (t) => {
    const itemsContainer = () => null;
    const items = () => null;

    Component.register('mw-items-container', itemsContainer, null);
    Component.registerItems('items-1', items);

    t.deepEqual(Component.getByName('items-1'), itemsContainer);
    t.deepEqual(Component.getByName('mw-items-1'), items);
});

test.serial('Register Alias', (t) => {
    const component = () => null;

    Component.register('component-2', component, null);
    Component.registerAlias('alias-2', 'component-2');

    t.deepEqual(Component.getByName('alias-2'), component);
});

test.serial('Register Container', (t) => {
    const mwContainer = () => null;
    const container = () => null;

    Component.register('mw-container', mwContainer, null);
    Component.registerContainer('container-1', container);

    t.deepEqual(Component.getByName('container-1'), mwContainer);
    t.deepEqual(Component.getByName('mw-container-1'), container);
});

test.serial('Get 1', (t) => {
    const component = () => null;

    Component.register('component-1', component, ['alias-1']);

    const model = { componentType: 'component-1' };
    t.deepEqual(Component.get(model), component);
});

test.serial('Get 2', (t) => {
    const component = () => null;

    Component.register('component-1', component, ['alias-1']);

    const model = { componentType: 'alias-1' };
    t.is(Component.get(model), component);
});

test.serial('Get 3', (t) => {
    const mwContainer = () => null;
    const container = () => null;

    Component.register('mw-container', mwContainer, null);
    Component.registerContainer('container-1', container);

    const model = { containerType: 'container-1' };
    t.not(Component.get(model), null);
});

test.serial('Get Child Components', (t) => {
    const component = () => null;

    Component.register('component-1', component, null);

    const model = [
        {
            id: 'id',
            componentType: 'component-1',
            order: 2,
        },
        {
            id: 'id',
            componentType: 'component-1',
            order: 1,
        },
    ];

    const expected = {
        flowKey,
        id: 'id',
        parentId: 'parentId',
        key: 'id',
    };

    t.is(Component.getChildComponents(model, 'parentId', flowKey).length, 2);
    t.deepEqual(react.createElement.args[0][0], component);
    t.deepEqual(react.createElement.args[0][1], expected);
});

test.serial('Get Outcomes', (t) => {
    const outcome = () => null;

    Component.register('outcome', outcome, null);

    const model = [
        {
            id: 'id1',
            order: 1,
        },
        {
            id: 'id2',
            order: 2,
        },
    ];

    const expected = {
        flowKey,
        id: 'id1',
        key: 'id1',
    };

    t.is(Component.getOutcomes(model, flowKey).length, 2);
    t.deepEqual(react.createElement.args[0][0], outcome);
    t.deepEqual(react.createElement.args[0][1], expected);
});

test.serial('Handle Event', async (t) => {
    const model = {
        hasEvents: true,
    };

    const component = {
        forceUpdate: sinon.stub(),
        setState: () => {},
        render: (): ReactNode => null,
        props: null,
        state: null,
        context: null,
        refs: null,
    };

    const callback = () => {
        t.is(engine.render.callCount, 1, 'Engine Render Count');
        t.is(engine.sync.callCount, 1, 'Engine Sync Count');
        t.is(collaboration.sync.callCount, 1, 'Collaboration Sync Count');
    };

    await Component.handleEvent(component as React.Component, model, flowKey, callback);
});

test.serial('Get Selected Rows 1', (t) => {
    t.is(Component.getSelectedRows(null, null).length, 0);
});

test.serial('Get Selected Rows 2', (t) => {
    const model = {
        objectData: [
            {
                internalId: 'id1',
            },
            {
                internalId: 'id2',
            },
        ],
    };

    const ids = ['id1', 'id2'];

    const expected = [
        {
            internalId: 'id1',
            isSelected: true,
        },
        {
            internalId: 'id2',
            isSelected: true,
        },
    ];

    t.deepEqual(Component.getSelectedRows(model, ids), expected);
});

test.serial('Get Display Columns 1', (t) => {
    t.is(Component.getDisplayColumns(null), null);
});

test.serial('Get Display Columns 2', (t) => {
    const columns = [
        {
            properties: [
                {
                    developerName: 'isDisplayValue',
                    contentValue: 'false',
                },
            ],
        },
    ];
    t.deepEqual(Component.getDisplayColumns(columns), []);
});

test.serial('Get Display Columns 3', (t) => {
    const columns = [
        {
            properties: [
                {
                    developerName: 'isDisplayValue',
                    contentValue: 'true',
                },
            ],
        },
    ];
    t.not(Component.getDisplayColumns(columns), null);
    t.is(Component.getDisplayColumns(columns).length, 1);
});

test.serial('Get Display Columns 4', (t) => {
    const columns = [
        {
            isDisplayValue: true,
        },
    ];
    t.not(Component.getDisplayColumns(columns), null);
    t.is(Component.getDisplayColumns(columns).length, 1);
});

test.serial('Append Flow Container', (t) => {
    const lookUpKey = Utils.getLookUpKey(`${flowKey}_modal`);

    const container = document.createElement('div');
    container.id = 'manywho';
    document.body.appendChild(container);

    Component.appendFlowContainer(`${flowKey}_modal`);

    const flowContainer = document.getElementById(lookUpKey);
    t.not(flowContainer, null);
    t.true(flowContainer.classList.contains('modal-container'));
});

test.serial('Append Flow Container Modal', (t) => {
    const modalFlowKey = `${flowKey}_modal-standalone`;

    const container = document.createElement('div');
    container.id = 'manywho';
    document.body.appendChild(container);

    Component.appendFlowContainer(modalFlowKey);

    t.not(document.getElementById('manywho'), null);
});

test.serial('Focus Input', (t) => {
    (window as any).innerWidth = 800;

    Settings.initializeFlow(
        {
            autoFocusInput: true,
        },
        flowKey,
    );

    const root = document.createElement('div');
    root.classList.add('main');

    const container = document.createElement('div');
    container.classList.add('mw-input');

    const input = document.createElement('input');
    input.id = 'focused';
    input.type = 'text';

    container.appendChild(input);
    root.appendChild(container);
    document.body.appendChild(root);

    Component.focusInput(flowKey);

    t.pass();
});

test.serial('Scroll To Top', (t) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    const container = document.createElement('div');
    container.id = lookUpKey;
    Component.scrollToTop(flowKey);
    t.pass();
});

test.serial('On Outcome 1', async (t) => {
    const outcome = {
        isOut: true,
    };

    return Component.onOutcome(outcome, null, flowKey)
        .then(() => {
            t.is(engine.move.callCount, 1, 'Move');
            t.is(engine.flowOut.callCount, 1, 'Flow Out');
        });
});

test.serial('On Outcome 2', async (t) => {
    const outcome = {
        isOut: false,
    };

    return Component.onOutcome(outcome, null, flowKey)
        .then(() => {
            t.is(engine.move.callCount, 1, 'Move');
            t.is(engine.flowOut.callCount, 0, 'Flow Out');
        });
});

test.serial('On Outcome 3', async (t) => {
    const outcome = {
        attributes: {
            uri: 'https://manywho.com',
        },
    };

    const spy = sinon.spy(window, 'open');

    Component.onOutcome(outcome, null, flowKey);

    t.is(spy.withArgs(outcome.attributes.uri, '_blank').calledOnce, true);

    spy.restore();
});

test.serial('On Outcome 4', async (t) => {
    const outcome = {
        attributes: {
            uriTypeElementPropertyId: 'id',
        },
    };

    const objectData = [{
        properties: [
            {
                typeElementPropertyId: 'id',
                contentValue: 'https://manywho.com',
            },
        ],
    }];

    const spy = sinon.spy(window, 'open');

    Component.onOutcome(outcome, objectData, flowKey);

    t.is(spy.withArgs(objectData[0].properties[0].contentValue, '_blank').calledOnce, true);

    spy.restore();
});

test.serial('getPagesize from attribute (number)', (t) => {
    const model = {
        objectDataRequest: null,
        componentType: 'comp-type',
        attributes: {
            pagination: 'true',
            paginationSize: 2,
        },
    };
    const result = Component.getPageSize(model, flowKey);

    t.is(result, 2);
});

test.serial('getPagesize from attribute (string)', (t) => {
    const model = {
        objectDataRequest: null,
        componentType: 'comp-type',
        attributes: {
            pagination: 'true',
            paginationSize: '12',
        },
    };
    const result = Component.getPageSize(model, flowKey);

    t.is(result, 12);
});

test.serial('getPagesize from list filter', (t) => {
    const model = {
        objectDataRequest: {
            listFilter: {
                limit: 5,
            },
        },
        componentType: 'comp-type',
        attributes: {},
    };
    const result = Component.getPageSize(model, flowKey);

    t.is(result, 5);
});

test.serial('getPagesize from component type', (t) => {
    const model = {
        objectDataRequest: null,
        componentType: 'TILES',
        attributes: {},
    };
    const result = Component.getPageSize(model, flowKey);

    t.is(result, 20); // settings.ts > globals.paging.tiles = 20
});

test.serial('getPagesize attributes priority', (t) => {
    const model = {
        objectDataRequest: {
            listFilter: {
                limit: 30,
            },
        },
        componentType: 'TILES',
        attributes: {
            pagination: 'true',
            paginationSize: '40',
        },
    };
    const result = Component.getPageSize(model, flowKey);

    t.is(result, 40);
});

test.serial('getPagesize list filter priority', (t) => {
    const model = {
        objectDataRequest: {
            listFilter: {
                limit: 30,
            },
        },
        componentType: 'TILES',
        attributes: {},
    };
    const result = Component.getPageSize(model, flowKey);

    t.is(result, 30);
});

test.serial('getPagesize default', (t) => {
    const model = {
        objectDataRequest: null,
        componentType: 'comp-type',
        attributes: {},
    };
    const result = Component.getPageSize(model, flowKey);

    t.is(result, 10); // services/component.ts > DEFAULT_PAGE_LIMIT
});
