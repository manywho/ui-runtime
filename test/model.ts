import test from 'ava';
import * as mockery from 'mockery'
import * as sinon from 'sinon';

const engine = {
    default: {
        render: sinon.stub()
    }
};

mockery.enable({ 
    useCleanCache: true,
    warnOnUnregistered: false 
});

mockery.registerMock('./engine', engine);

import Model from '../js/services/model';

const flowKey = 'key1_key2_key3_key4';

test.beforeEach(t => {
    Model.initializeModel(flowKey);
    engine.default.render.resetHistory();
});

test.afterEach(t => {
    Model.deleteFlowModel(flowKey);
});

test.after(t => {
    mockery.deregisterAll();
    mockery.disable();
})

test('Notifications', (t) => {
    const notification = { message: 'hello', position: 'center' };
    Model.addNotification(flowKey, notification);

    t.is(Model.getNotifications(flowKey, 'right').length, 0);
    t.is(Model.getNotifications(flowKey, 'center').length, 1);
    t.deepEqual(Model.getNotifications(flowKey, 'center')[0], notification);

    Model.removeNotification(flowKey, notification);

    t.is(Model.getNotifications(flowKey, 'center').length, 0);
    t.is(engine.default.render.callCount, 2);
});

test('Selected Navigation', (t) => {
    Model.setSelectedNavigation('navigationId', flowKey);
    t.is(Model.getSelectedNavigation(flowKey), 'navigationId');
});

test('Is Container', (t) => {
    t.is(Model.isContainer({ containerType: 'vertical' }), true);
});

test('Attributes', (t) => {
    Model.setAttributes(flowKey, 'attributes');
    t.is(Model.getAttributes(flowKey), 'attributes');
});

test('Modal', (t) => {
    Model.setModal(flowKey, 'modal');
    t.is(Model.getModal(flowKey), 'modal');
    t.is(engine.default.render.callCount, 1);
});

test('Execution Log', (t) => {
    Model.setExecutionLog(flowKey, 'executionlog');
    t.is(Model.getExecutionLog(flowKey), 'executionlog');
});

test('Parse Navigation Response', (t) => {
    const response = {
        culture: 'culture',
        developerName: 'developerName',
        label: 'label',
        tags: 'tags',
        isVisible: true,
        isEnabled: true,
        navigationItemResponses: [
            {
                id: 'item1',
                locationMapElementId: 'currentMapElementId'
            }
        ],
        navigationItemDataResponses: [
            {
                navigationItemId: 'item1',
                isCurrent: false
            }
        ]
    };

    const expected = {
        culture: 'culture',
        developerName: 'developerName',
        label: 'label',
        tags: 'tags',
        isVisible: true,
        isEnabled: true,
        items: {
            item1: {
                id: 'item1',
                isCurrent: true,
                locationMapElementId: 'currentMapElementId',
                navigationItemId: 'item1'
            }
        }
    };

    Model.parseNavigationResponse('id', response, flowKey, 'currentMapElementId');
    t.deepEqual(Model.getNavigation('id', flowKey), expected);
});
