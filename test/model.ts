import test from 'ava'; // tslint:disable-line:import-name
import * as mockery from 'mockery';
import * as sinon from 'sinon';

const engine = {
    render: sinon.stub(),
};

mockery.enable({
    useCleanCache: true,
    warnOnUnregistered: false,
});

mockery.registerMock('./engine', engine);
mockery.registerMock('./settings', {
    flow: sinon.stub().returns(true),
    global: sinon.stub().returns(false),
});

import * as Model from '../js/services/model';

const flowKey = 'key1_key2_key3_key4';

test.beforeEach((t) => {
    Model.initializeModel(flowKey);
    engine.render.resetHistory();
});

test.afterEach((t) => {
    Model.deleteFlowModel(flowKey);
});

test.after((t) => {
    mockery.deregisterAll();
    mockery.disable();
});

test.serial('Parse Response', (t) => {
    const response = {
        parentStateId: 'parentStateId',
        invokeType: 'FORWARD',
        waitMessage: 'waitMessage',
        voteResponse: 'vote',
        mapElementInvokeResponses: [
            {
                pageResponse: {
                    label: 'label',
                    attributes: {
                        key: 'value',
                    },
                    pageContainerResponses: [
                        {
                            containerType: 'VERTICAL_FLOW',
                            developerName: 'container-1',
                            id: 'container-1',
                            order: 0,
                            pageContainerResponses: [
                                {
                                    containerType: 'VERTICAL_FLOW',
                                    developerName: 'container-2',
                                    id: 'container-2',
                                    order: 0,
                                    pageContainerResponses: null,
                                },
                            ],
                        },
                    ],
                    pageContainerDataResponses: [
                        {
                            isEditable: true,
                            isEnabled: true,
                            isVisible: true,
                            pageContainerId: 'container-1',
                        },
                        {
                            isEditable: false,
                            isEnabled: false,
                            isVisible: false,
                            pageContainerId: 'container-2',
                        },
                    ],
                    pageComponentResponses: [
                        {
                            componentType: 'INPUT',
                            contentType: 'ContentString',
                            developerName: 'component-1',
                            id: 'component-1',
                            pageContainerId: 'container-1',
                            pageContainerDeveloperName: 'container-1',
                            isVisible: true,
                        },
                    ],
                    pageComponentDataResponses: [
                        {
                            contentValue: 'value',
                            pageComponentId: 'component-1',
                        },
                    ],
                },
                outcomeResponses: [
                    {
                        id: 'outcome-1',
                        pageContainerId: 'container-1',
                    },
                ],
                rootFaults: {
                    fault: 'fault message',
                },
            },
        ],
        preCommitStateValues: 'preCommitStateValues',
        stateValues: 'stateValues',
    };

    Model.parseEngineResponse(response, flowKey);

    const expectedContainer: any = Object.assign(
        {},
        response.mapElementInvokeResponses[0].pageResponse.pageContainerResponses[0],
        response.mapElementInvokeResponses[0].pageResponse.pageContainerDataResponses[0],
    );
    expectedContainer.childCount = 2;
    t.deepEqual(Model.getContainer('container-1', flowKey), expectedContainer);

    const expectedComponent = Object.assign(
        {},
        response.mapElementInvokeResponses[0].pageResponse.pageComponentResponses[0],
        response.mapElementInvokeResponses[0].pageResponse.pageComponentDataResponses[0],
    );
    t.deepEqual(Model.getComponent('component-1', flowKey), expectedComponent);
    t.deepEqual(Model.getComponentByName('component-1', flowKey), expectedComponent);
    t.deepEqual(Model.getComponents(flowKey), { 'component-1': expectedComponent });

    const expectedOutcome = response.mapElementInvokeResponses[0].outcomeResponses[0];
    t.deepEqual(Model.getOutcome('outcome-1', flowKey), expectedOutcome);
    t.deepEqual(Model.getOutcomes('root', flowKey), [expectedOutcome]);
    t.deepEqual(Model.getOutcomes(null, flowKey), [expectedOutcome]);

    t.is(Model.getLabel(flowKey), 'label');
    t.is(Model.getInvokeType(flowKey), 'FORWARD');
    t.is(Model.getWaitMessage(flowKey), 'waitMessage');
    t.is(Model.getPreCommitStateValues(flowKey), 'preCommitStateValues');
    t.is(Model.getStateValues(flowKey), 'stateValues');

    t.deepEqual(Model.getChildren('root', flowKey), [expectedContainer]);
    t.deepEqual(Model.getItem('container-1', flowKey), expectedContainer);
    t.deepEqual(Model.getItem('component-1', flowKey), expectedComponent);
    t.deepEqual(Model.getItem('outcome-1', flowKey), expectedOutcome);

    const expectedNotifications = [
        {
            message: 'fault message',
            position: 'center',
            type: 'danger',
            timeout: '0',
            dismissible: true,
        },
    ];
    t.deepEqual(Model.getNotifications(flowKey, 'center'), expectedNotifications);
});

test.serial('Auto focus gets applied to text input', (t) => {
    const response = {
        parentStateId: 'parentStateId',
        invokeType: 'FORWARD',
        waitMessage: 'waitMessage',
        voteResponse: 'vote',
        mapElementInvokeResponses: [
            {
                pageResponse: {
                    label: 'label',
                    attributes: {
                        key: 'value',
                    },
                    pageContainerResponses: [
                        {
                            containerType: 'VERTICAL_FLOW',
                            developerName: 'main container',
                            id: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            order: 0,
                            pageContainerResponses: null,
                        },
                    ],
                    pageContainerDataResponses: [
                        {
                            isEditable: true,
                            isEnabled: true,
                            isVisible: true,
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                        },
                    ],
                    pageComponentResponses: [
                        {
                            componentType: 'INPUT',
                            contentType: 'ContentString',
                            developerName: 'component-1',
                            id: 'component-1',
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            pageContainerDeveloperName: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            isVisible: true,
                        },
                        {
                            componentType: 'INPUT',
                            contentType: 'ContentString',
                            developerName: 'component-2',
                            id: 'component-2',
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            pageContainerDeveloperName: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            isVisible: true,
                        },
                        {
                            componentType: 'INPUT',
                            contentType: 'ContentString',
                            developerName: 'component-3',
                            id: 'component-3',
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            pageContainerDeveloperName: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            isVisible: true,
                        },
                    ],
                    pageComponentDataResponses: [
                        {
                            contentValue: 'value',
                            pageComponentId: 'component-1',
                        },
                    ],
                },
                outcomeResponses: [
                    {
                        id: 'outcome-1',
                        pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                    },
                ],
                rootFaults: {
                    fault: 'fault message',
                },
            },
        ],
        preCommitStateValues: 'preCommitStateValues',
        stateValues: 'stateValues',
    };

    Model.parseEngineResponse(response, flowKey);

    t.is(Model.getComponentByName('component-1', flowKey).autoFocus, true);
    t.is(Model.getComponentByName('component-2', flowKey).autoFocus, false);
    t.is(Model.getComponentByName('component-3', flowKey).autoFocus, false);
});

test.serial('Auto focus gets applied to datetime input', (t) => {
    const response = {
        parentStateId: 'parentStateId',
        invokeType: 'FORWARD',
        waitMessage: 'waitMessage',
        voteResponse: 'vote',
        mapElementInvokeResponses: [
            {
                pageResponse: {
                    label: 'label',
                    attributes: {
                        key: 'value',
                    },
                    pageContainerResponses: [
                        {
                            containerType: 'VERTICAL_FLOW',
                            developerName: 'main container',
                            id: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            order: 0,
                            pageContainerResponses: null,
                        },
                    ],
                    pageContainerDataResponses: [
                        {
                            isEditable: true,
                            isEnabled: true,
                            isVisible: true,
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                        },
                    ],
                    pageComponentResponses: [
                        {
                            componentType: 'INPUT_DATETIME',
                            contentType: 'ContentString',
                            developerName: 'component-1',
                            id: 'component-1',
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            pageContainerDeveloperName: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            isVisible: true,
                        },
                        {
                            componentType: 'INPUT',
                            contentType: 'ContentString',
                            developerName: 'component-2',
                            id: 'component-2',
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            pageContainerDeveloperName: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            isVisible: true,
                        },
                        {
                            componentType: 'INPUT',
                            contentType: 'ContentString',
                            developerName: 'component-3',
                            id: 'component-3',
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            pageContainerDeveloperName: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            isVisible: true,
                        },
                    ],
                    pageComponentDataResponses: [
                        {
                            contentValue: 'value',
                            pageComponentId: 'component-1',
                        },
                    ],
                },
                outcomeResponses: [
                    {
                        id: 'outcome-1',
                        pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                    },
                ],
                rootFaults: {
                    fault: 'fault message',
                },
            },
        ],
        preCommitStateValues: 'preCommitStateValues',
        stateValues: 'stateValues',
    };

    Model.parseEngineResponse(response, flowKey);

    t.is(Model.getComponentByName('component-1', flowKey).autoFocus, true);
    t.is(Model.getComponentByName('component-2', flowKey).autoFocus, false);
    t.is(Model.getComponentByName('component-3', flowKey).autoFocus, false);
});

test.serial('Auto focus gets applied to number input', (t) => {
    const response = {
        parentStateId: 'parentStateId',
        invokeType: 'FORWARD',
        waitMessage: 'waitMessage',
        voteResponse: 'vote',
        mapElementInvokeResponses: [
            {
                pageResponse: {
                    label: 'label',
                    attributes: {
                        key: 'value',
                    },
                    pageContainerResponses: [
                        {
                            containerType: 'VERTICAL_FLOW',
                            developerName: 'main container',
                            id: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            order: 0,
                            pageContainerResponses: null,
                        },
                    ],
                    pageContainerDataResponses: [
                        {
                            isEditable: true,
                            isEnabled: true,
                            isVisible: true,
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                        },
                    ],
                    pageComponentResponses: [
                        {
                            componentType: 'INPUT_NUMBER',
                            contentType: 'ContentString',
                            developerName: 'component-1',
                            id: 'component-1',
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            pageContainerDeveloperName: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            isVisible: true,
                        },
                        {
                            componentType: 'INPUT',
                            contentType: 'ContentString',
                            developerName: 'component-2',
                            id: 'component-2',
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            pageContainerDeveloperName: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            isVisible: true,
                        },
                        {
                            componentType: 'INPUT',
                            contentType: 'ContentString',
                            developerName: 'component-3',
                            id: 'component-3',
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            pageContainerDeveloperName: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            isVisible: true,
                        },
                    ],
                    pageComponentDataResponses: [
                        {
                            contentValue: 'value',
                            pageComponentId: 'component-1',
                        },
                    ],
                },
                outcomeResponses: [
                    {
                        id: 'outcome-1',
                        pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                    },
                ],
                rootFaults: {
                    fault: 'fault message',
                },
            },
        ],
        preCommitStateValues: 'preCommitStateValues',
        stateValues: 'stateValues',
    };

    Model.parseEngineResponse(response, flowKey);

    t.is(Model.getComponentByName('component-1', flowKey).autoFocus, true);
    t.is(Model.getComponentByName('component-2', flowKey).autoFocus, false);
    t.is(Model.getComponentByName('component-3', flowKey).autoFocus, false);
});

test.serial('Auto focus gets applied to textarea', (t) => {
    const response = {
        parentStateId: 'parentStateId',
        invokeType: 'FORWARD',
        waitMessage: 'waitMessage',
        voteResponse: 'vote',
        mapElementInvokeResponses: [
            {
                pageResponse: {
                    label: 'label',
                    attributes: {
                        key: 'value',
                    },
                    pageContainerResponses: [
                        {
                            containerType: 'VERTICAL_FLOW',
                            developerName: 'main container',
                            id: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            order: 0,
                            pageContainerResponses: null,
                        },
                    ],
                    pageContainerDataResponses: [
                        {
                            isEditable: true,
                            isEnabled: true,
                            isVisible: true,
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                        },
                    ],
                    pageComponentResponses: [
                        {
                            componentType: 'TEXTAREA',
                            contentType: 'ContentString',
                            developerName: 'component-1',
                            id: 'component-1',
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            pageContainerDeveloperName: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            isVisible: true,
                        },
                        {
                            componentType: 'INPUT',
                            contentType: 'ContentString',
                            developerName: 'component-2',
                            id: 'component-2',
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            pageContainerDeveloperName: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            isVisible: true,
                        },
                        {
                            componentType: 'INPUT',
                            contentType: 'ContentString',
                            developerName: 'component-3',
                            id: 'component-3',
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            pageContainerDeveloperName: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            isVisible: true,
                        },
                    ],
                    pageComponentDataResponses: [
                        {
                            contentValue: 'value',
                            pageComponentId: 'component-1',
                        },
                    ],
                },
                outcomeResponses: [
                    {
                        id: 'outcome-1',
                        pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                    },
                ],
                rootFaults: {
                    fault: 'fault message',
                },
            },
        ],
        preCommitStateValues: 'preCommitStateValues',
        stateValues: 'stateValues',
    };

    Model.parseEngineResponse(response, flowKey);

    t.is(Model.getComponentByName('component-1', flowKey).autoFocus, true);
    t.is(Model.getComponentByName('component-2', flowKey).autoFocus, false);
    t.is(Model.getComponentByName('component-3', flowKey).autoFocus, false);
});

test.serial('Auto focus ignores non input elements', (t) => {
    const response = {
        parentStateId: 'parentStateId',
        invokeType: 'FORWARD',
        waitMessage: 'waitMessage',
        voteResponse: 'vote',
        mapElementInvokeResponses: [
            {
                pageResponse: {
                    label: 'label',
                    attributes: {
                        key: 'value',
                    },
                    pageContainerResponses: [
                        {
                            containerType: 'VERTICAL_FLOW',
                            developerName: 'main container',
                            id: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            order: 0,
                            pageContainerResponses: null,
                        },
                    ],
                    pageContainerDataResponses: [
                        {
                            isEditable: true,
                            isEnabled: true,
                            isVisible: true,
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                        },
                    ],
                    pageComponentResponses: [
                        {
                            componentType: 'TABLE',
                            contentType: 'ContentString',
                            developerName: 'component-1',
                            id: 'component-1',
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            pageContainerDeveloperName: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            isVisible: true,
                        },
                        {
                            componentType: 'INPUT',
                            contentType: 'ContentString',
                            developerName: 'component-2',
                            id: 'component-2',
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            pageContainerDeveloperName: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            isVisible: true,
                        },
                        {
                            componentType: 'INPUT',
                            contentType: 'ContentString',
                            developerName: 'component-3',
                            id: 'component-3',
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            pageContainerDeveloperName: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            isVisible: true,
                        },
                    ],
                    pageComponentDataResponses: [
                        {
                            contentValue: 'value',
                            pageComponentId: 'component-1',
                        },
                    ],
                },
                outcomeResponses: [
                    {
                        id: 'outcome-1',
                        pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                    },
                ],
                rootFaults: {
                    fault: 'fault message',
                },
            },
        ],
        preCommitStateValues: 'preCommitStateValues',
        stateValues: 'stateValues',
    };

    Model.parseEngineResponse(response, flowKey);

    t.is(Model.getComponentByName('component-1', flowKey).autoFocus, undefined);
    t.is(Model.getComponentByName('component-2', flowKey).autoFocus, true);
    t.is(Model.getComponentByName('component-3', flowKey).autoFocus, false);
});

test.serial('Auto focus gets applied to elements nested in child containers', (t) => {
    const response = {
        parentStateId: 'parentStateId',
        invokeType: 'FORWARD',
        waitMessage: 'waitMessage',
        voteResponse: 'vote',
        mapElementInvokeResponses: [
            {
                pageResponse: {
                    label: 'label',
                    attributes: {
                        key: 'value',
                    },
                    pageContainerResponses: [
                        {
                            containerType: 'VERTICAL_FLOW',
                            developerName: 'main container',
                            id: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            order: 0,
                            pageContainerResponses: [
                                {
                                    containerType: 'VERTICAL_FLOW',
                                    developerName: 'container-2',
                                    id: 'container-2',
                                    order: 0,
                                    pageContainerResponses: null,
                                    parent: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                                },
                            ],
                        },
                    ],
                    pageContainerDataResponses: [
                        {
                            isEditable: true,
                            isEnabled: true,
                            isVisible: true,
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                        },
                        {
                            isEditable: true,
                            isEnabled: true,
                            isVisible: true,
                            pageContainerId: 'container-2',
                        },
                    ],
                    pageComponentResponses: [
                        {
                            componentType: 'INPUT',
                            contentType: 'ContentString',
                            developerName: 'component-1',
                            id: 'component-1',
                            pageContainerId: 'container-2',
                            pageContainerDeveloperName: 'container-2',
                            isVisible: true,
                        },
                        {
                            componentType: 'INPUT',
                            contentType: 'ContentString',
                            developerName: 'component-2',
                            id: 'component-2',
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            pageContainerDeveloperName: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            isVisible: true,
                        },
                        {
                            componentType: 'INPUT',
                            contentType: 'ContentString',
                            developerName: 'component-3',
                            id: 'component-3',
                            pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            pageContainerDeveloperName: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                            isVisible: true,
                        },
                    ],
                    pageComponentDataResponses: [
                        {
                            contentValue: 'value',
                            pageComponentId: 'component-1',
                        },
                    ],
                },
                outcomeResponses: [
                    {
                        id: 'outcome-1',
                        pageContainerId: 'ffd48fa6-2017-4d38-9f48-b896993bb874',
                    },
                ],
                rootFaults: {
                    fault: 'fault message',
                },
            },
        ],
        preCommitStateValues: 'preCommitStateValues',
        stateValues: 'stateValues',
    };

    Model.parseEngineResponse(response, flowKey);

    t.is(Model.getComponentByName('component-1', flowKey).autoFocus, true);
    t.is(Model.getComponentByName('component-2', flowKey).autoFocus, false);
    t.is(Model.getComponentByName('component-3', flowKey).autoFocus, false);
});

test.serial('Notifications', (t) => {
    (Model.getNotifications(flowKey, 'center') || []).forEach(notification => Model.removeNotification(flowKey, notification));
    engine.render.resetHistory();

    const notification = {
        message: 'fault message',
        position: 'center',
        type: 'danger',
        timeout: 0,
        dismissible: true,
    };
    Model.addNotification(flowKey, notification);

    t.is(Model.getNotifications(flowKey, 'right').length, 0);
    t.is(Model.getNotifications(flowKey, 'center').length, 1);
    t.deepEqual(Model.getNotifications(flowKey, 'center')[0], notification);

    Model.removeNotification(flowKey, notification);

    t.is(Model.getNotifications(flowKey, 'center').length, 0);
    t.is(engine.render.callCount, 2);
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
    t.is(engine.render.callCount, 1);
});

test('Execution Log', (t) => {
    Model.setExecutionLog(flowKey, 'executionlog');
    t.is(Model.getExecutionLog(flowKey), 'executionlog');
});

test.serial('Parse Navigation Response', (t) => {
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
                locationMapElementId: 'currentMapElementId',
            },
        ],
        navigationItemDataResponses: [
            {
                navigationItemId: 'item1',
                isCurrent: false,
            },
        ],
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
                navigationItemId: 'item1',
            },
        },
    };

    Model.parseNavigationResponse('id', response, flowKey, 'currentMapElementId');
    t.deepEqual(Model.getNavigation('id', flowKey), expected);
    t.is(Model.getDefaultNavigationId(flowKey), 'id');
});

test('Set Components', (t) => {
    const containers = [
        {
            id: 'container-id',
        },
    ];

    Model.setContainers(flowKey, containers, null, null);

    const components = [
        {
            attributes: {
                key: 'value',
            },
            id: 'id',
            pageContainerId: 'container-id',
            contentType: null,
        },
    ];

    const componentsData = [
        {
            pageComponentId: 'id',
            contentValue: 'value',
        },
    ];

    Model.setComponents(flowKey, components, componentsData);

    const expected = {
        attributes: {
            key: 'value',
        },
        id: 'id',
        pageComponentId: 'id',
        pageContainerId: 'container-id',
        contentType: 'CONTENTSTRING',
        contentValue: 'value',
    };

    t.deepEqual(Model.getComponent('id', flowKey), expected);
});

test('Set History', (t) => {
    const response = {
        mapElementInvokeResponses: [
            {
                developerName: 'response',
                mapElementId: 'id',
                pageResponse: {
                    label: 'label',
                    pageComponentDataResponses: [
                        {
                            content: 'content',
                        },
                    ],
                },
                outcomeResponses: [
                    {
                        developerName: 'outcome',
                        id: 'outcome-id',
                        label: 'outcome',
                        order: 1,
                    },
                ],
            },
        ],
    };

    const expected = [{
        name: response.mapElementInvokeResponses[0].developerName,
        id: response.mapElementInvokeResponses[0].mapElementId,
        label: response.mapElementInvokeResponses[0].pageResponse.label,
        content: response.mapElementInvokeResponses[0].pageResponse.pageComponentDataResponses[0].content,
        outcomes: [
            {
                name: 'outcome',
                id: 'outcome-id',
                label: 'outcome',
                order: 1,
            },
        ],
    }];

    Model.setHistory(response, flowKey);
    t.deepEqual(Model.getHistory(flowKey), expected);
});

test('Pop History', (t) => {
    const response = {
        mapElementInvokeResponses: [
            {
                developerName: 'response',
                mapElementId: 'id',
                pageResponse: {
                    label: 'label',
                    pageComponentDataResponses: [
                        {
                            content: 'content',
                        },
                    ],
                },
                outcomeResponses: [
                    {
                        developerName: 'outcome',
                        id: 'outcome-id',
                        label: 'outcome',
                        order: 1,
                    },
                ],
            },
        ],
    };

    Model.setHistory(response, flowKey);
    Model.popHistory('id-1', flowKey);

    t.deepEqual(Model.getHistory(flowKey), []);
});

test('Set History Selected Outcome', (t) => {
    const expected = {
        selectedOutcome: 'outcome',
    };

    Model.setHistorySelectedOutcome('outcome', 'invokeType', flowKey);
    const actual = Model.getHistory(flowKey);
    t.deepEqual(actual[-1], expected);
});

test('Set map element is fired when invoke response is parsed', (t) => {
    const invokeResponse = {
        invokeType: 'test',
        mapElementInvokeResponses: [{
            pageResponse: { label: 'test1' },
            label: 'test2',
            developerName: 'test3',
            mapElementId: 'test4',
        }],
    };

    Model.parseEngineResponse(invokeResponse, flowKey);

    t.deepEqual(Model.getMapElement(flowKey), {
        name: invokeResponse.mapElementInvokeResponses[0].label,
        id: invokeResponse.mapElementInvokeResponses[0].mapElementId,
    });

});

test('We use the developerName if the invoke response has no label', (t) => {
    const invokeResponse = {
        invokeType: 'test',
        mapElementInvokeResponses: [{
            pageResponse: { label: 'test1' },
            label: null,
            developerName: 'test3',
            mapElementId: 'test4',
        }],
    };

    Model.parseEngineResponse(invokeResponse, flowKey);

    t.deepEqual(Model.getMapElement(flowKey), {
        name: invokeResponse.mapElementInvokeResponses[0].developerName,
        id: invokeResponse.mapElementInvokeResponses[0].mapElementId,
    });

});
