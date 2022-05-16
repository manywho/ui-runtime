import { executeOperation } from '../../js/services/Operation';
import { IState } from '../../js/interfaces/IModels';
import { StateInit, getStateValue } from '../../js/models/State';

declare let manywho: any;

const snapshot = {
    getValue(v) {
        return v.expectedReturn;
    },
    metadata: {
        typeElements: [
            {
                id: 'type-element-id',
                properties: [
                    {
                        id: 'property-id',
                    },
                ],
            },
        ],
    },
};

let state:IState = null;

describe('Operation service', () => {

    beforeEach(() => {
        const initialState:IState = {
            currentMapElementId: null,
            id: null,
            token: null,
            values: {},
        };

        state = StateInit(initialState);
    });

    test('No operation resolves', () => {
        expect.assertions(1);
        return expect(executeOperation({}, state, snapshot)).resolves.toEqual(state);
    });

    test('Invalid command for toReference returns original state', () => {

        const operation = {
            valueElementToReferenceId: {
                command: 'UNSUPPORTED',
            },
        };
        expect.assertions(1);
        return expect(executeOperation(operation, state, snapshot)).resolves.toEqual(state);
    });

    test('Invalid command for toApply returns original state', () => {

        const operation = {
            valueElementToApplyId: {
                command: 'UNSUPPORTED',
            },
        };
        expect.assertions(1);
        return expect(executeOperation(operation, state, snapshot)).resolves.toEqual(state);
    });

    test('Commands SET_EQUAL and VALUE_OF checking assignment', () => {

        const operation = {
            valueElementToApplyId: {
                command: 'SET_EQUAL',
                id: 'apply',
                typeElementPropertyId: null,
                expectedReturn: {
                    contentValue: 'No',
                },
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'VALUE_OF',
                id: 'reference',
                typeElementPropertyId: null,
                expectedReturn: {
                    contentValue: 'Yes',
                },
            },
            valueElementToReferenceTypeElementId: null,
        };
        expect.assertions(4);

        return executeOperation(operation, state, snapshot).then((ret) => {
            expect(ret).toEqual(state);
            // Get the newly applied value
            const applied = getStateValue({ id: 'apply', typeElementPropertyId: null });
            expect(applied).toEqual({ contentValue: 'Yes' });

            // OK with an empty state - better check with a dirty state using the same Id's
            operation.valueElementToReferenceId.expectedReturn = { contentValue: 'Reapplied Yes' };
            return executeOperation(operation, state, snapshot).then((ret2) => {
                expect(ret2).toEqual(state);
                // Get the newly applied value
                const applied2 = getStateValue({ id: 'apply', typeElementPropertyId: null });
                expect(applied2).toEqual({ contentValue: 'Reapplied Yes' });
            });

        });
    });

    test('Commands ADD and VALUE_OF to insert a new list item', async () => {
        const mockSnapShot = {
            getValue: jest.fn(),
            metadata: {
                typeElements: [
                    {
                        id: 'type-element-id',
                        properties: [
                            {
                                id: 'property-id',
                            },
                        ],
                    },
                ],
            },
        };

        mockSnapShot.getValue.mockImplementationOnce(() => ({
            contentType: 'ContentObject',
            typeElementId: 'type-element-id',
            objectData: [
                {
                    internalId: 'internal-1',
                    externalId: null,
                    developerName: 'newItem',
                    properties: [
                        {
                            typeElementPropertyId: 'property-id',
                            contentType: 'ContentString',
                            developerName: 'new property',
                            contentValue: 'new item',
                            defaultContentValue: null,
                        },
                    ],
                },
            ],
            id: 'reference',
        })).mockImplementationOnce(() => ({
            contentType: 'ContentList',
            objectData: null,
            typeElementId: 'type-element-id',
            id: 'apply',
        }));

        const operation = {
            valueElementToApplyId: {
                command: 'ADD',
                id: 'apply',
                typeElementPropertyId: null,
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'VALUE_OF',
                id: 'reference',
                typeElementPropertyId: null,
            },
            valueElementToReferenceTypeElementId: null,
        };

        await executeOperation(operation, state, mockSnapShot);
        const appliedValue = getStateValue({ id: 'apply', typeElementPropertyId: null });
        expect(appliedValue.objectData.length).toEqual(1);
    });

    test('Commands ADD and VALUE_OF to add together two number values', async () => {
        const mockSnapShot = {
            getValue: jest.fn(),
            metadata: {},
        };

        mockSnapShot.getValue.mockImplementationOnce(() => ({
            contentType: 'ContentNumber',
            contentValue: 5,
            id: 'reference',
        })).mockImplementationOnce(() => ({
            contentType: 'ContentNumber',
            contentValue: 10,
            id: 'apply',
        }));

        const operation = {
            valueElementToApplyId: {
                command: 'ADD',
                id: 'apply',
                typeElementPropertyId: null,
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'VALUE_OF',
                id: 'reference',
                typeElementPropertyId: null,
            },
            valueElementToReferenceTypeElementId: null,
        };

        await executeOperation(operation, state, mockSnapShot);
        const appliedValue = getStateValue({ id: 'apply', typeElementPropertyId: null });
        expect(appliedValue.contentValue).toEqual(15);
    });

    test('Commands ADD and VALUE_OF to add together two number values when one value is null', async () => {
        const mockSnapShot = {
            getValue: jest.fn(),
            metadata: {},
        };

        mockSnapShot.getValue.mockImplementationOnce(() => ({
            contentType: 'ContentNumber',
            contentValue: null,
            id: 'reference',
        })).mockImplementationOnce(() => ({
            contentType: 'ContentNumber',
            contentValue: 10,
            id: 'apply',
        }));

        const operation = {
            valueElementToApplyId: {
                command: 'ADD',
                id: 'apply',
                typeElementPropertyId: null,
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'VALUE_OF',
                id: 'reference',
                typeElementPropertyId: null,
            },
            valueElementToReferenceTypeElementId: null,
        };

        await executeOperation(operation, state, mockSnapShot);
        const appliedValue = getStateValue({ id: 'apply', typeElementPropertyId: null });
        expect(appliedValue.contentValue).toEqual(10);
    });

    test('Commands ADD and VALUE_OF to add together two number values when one value is 0', async () => {
        const mockSnapShot = {
            getValue: jest.fn(),
            metadata: {},
        };

        mockSnapShot.getValue.mockImplementationOnce(() => ({
            contentType: 'ContentNumber',
            contentValue: 0,
            id: 'reference',
        })).mockImplementationOnce(() => ({
            contentType: 'ContentNumber',
            contentValue: 10,
            id: 'apply',
        }));

        const operation = {
            valueElementToApplyId: {
                command: 'ADD',
                id: 'apply',
                typeElementPropertyId: null,
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'VALUE_OF',
                id: 'reference',
                typeElementPropertyId: null,
            },
            valueElementToReferenceTypeElementId: null,
        };

        await executeOperation(operation, state, mockSnapShot);
        const appliedValue = getStateValue({ id: 'apply', typeElementPropertyId: null });
        expect(appliedValue.contentValue).toEqual(10);
    });

    test('Commands ADD and VALUE_OF to add together two number values when one value is "0"', async () => {
        const mockSnapShot = {
            getValue: jest.fn(),
            metadata: {},
        };

        mockSnapShot.getValue.mockImplementationOnce(() => ({
            contentType: 'ContentNumber',
            contentValue: '0',
            id: 'reference',
        })).mockImplementationOnce(() => ({
            contentType: 'ContentNumber',
            contentValue: '10',
            id: 'apply',
        }));

        const operation = {
            valueElementToApplyId: {
                command: 'ADD',
                id: 'apply',
                typeElementPropertyId: null,
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'VALUE_OF',
                id: 'reference',
                typeElementPropertyId: null,
            },
            valueElementToReferenceTypeElementId: null,
        };

        await executeOperation(operation, state, mockSnapShot);
        const appliedValue = getStateValue({ id: 'apply', typeElementPropertyId: null });
        expect(appliedValue.contentValue).toEqual(10);
    });

    test('Commands ADD and VALUE_OF to concatenate two string values', async () => {
        const mockSnapShot = {
            getValue: jest.fn(),
            metadata: {},
        };

        mockSnapShot.getValue.mockImplementationOnce(() => ({
            contentType: 'ContentString',
            contentValue: 'foo',
            id: 'reference',
        })).mockImplementationOnce(() => ({
            contentType: 'ContentString',
            contentValue: 'bar',
            id: 'apply',
        }));

        const operation = {
            valueElementToApplyId: {
                command: 'ADD',
                id: 'apply',
                typeElementPropertyId: null,
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'VALUE_OF',
                id: 'reference',
                typeElementPropertyId: null,
            },
            valueElementToReferenceTypeElementId: null,
        };

        await executeOperation(operation, state, mockSnapShot);
        const appliedValue = getStateValue({ id: 'apply', typeElementPropertyId: null });
        expect(appliedValue.contentValue).toEqual('barfoo');
    });

    test('Commands ADD and VALUE_OF does not insert a new duplicate list item', async () => {

        const mockSnapShot = {
            getValue: jest.fn(),
            metadata: {
                typeElements: [
                    {
                        id: 'type-element-id',
                        properties: [
                            {
                                id: 'property-id',
                            },
                        ],
                    },
                ],
            },
        };

        mockSnapShot.getValue.mockImplementationOnce(() => ({
            contentType: 'ContentObject',
            typeElementId: 'type-element-id',
            objectData: [
                {
                    internalId: 'internal-1',
                    externalId: null,
                    developerName: 'newItem',
                    properties: [
                        {
                            typeElementPropertyId: 'property-id',
                            contentType: 'ContentString',
                            developerName: 'new property',
                            contentValue: 'new item',
                            defaultContentValue: null,
                        },
                    ],
                },
            ],
            id: 'reference',
        })).mockImplementationOnce(() => ({
            contentType: 'ContentList',
            objectData: null,
            typeElementId: 'type-element-id',
            id: 'apply',
        }));

        const operation = {
            valueElementToApplyId: {
                command: 'ADD',
                id: 'apply',
                typeElementPropertyId: null,
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'VALUE_OF',
                id: 'reference',
                typeElementPropertyId: null,
            },
            valueElementToReferenceTypeElementId: null,
        };

        await executeOperation(operation, state, mockSnapShot);
        const appliedValue = getStateValue({ id: 'apply', typeElementPropertyId: null });

        expect(appliedValue.objectData.length).toEqual(1);
        expect(appliedValue.objectData[0].developerName).toEqual('newItem');
        expect(appliedValue.objectData[0].properties[0].contentValue).toEqual('new item');
        expect(appliedValue.objectData[0].internalId).not.toEqual('internal-1'); // New guid()

        mockSnapShot.getValue.mockImplementationOnce(() => ({
            contentType: 'ContentObject',
            typeElementId: 'type-element-id',
            objectData: [
                {
                    internalId: appliedValue.objectData[0].internalId, // Same internalId
                    externalId: null,
                    developerName: 'newItem',
                    properties: [
                        {
                            typeElementPropertyId: 'property-id',
                            contentType: 'ContentString',
                            developerName: 'new property',
                            contentValue: 'new item',
                            defaultContentValue: null,
                        },
                    ],
                },
            ],
            id: 'reference2',
        })).mockImplementationOnce(() => ({
            contentType: 'ContentList',
            objectData: null,
            typeElementId: 'type-element-id',
            id: 'apply',
        }));

        const operation2 = {
            valueElementToApplyId: {
                command: 'ADD',
                id: 'apply',
                typeElementPropertyId: null,
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'VALUE_OF',
                id: 'reference2',
                typeElementPropertyId: null,
            },
            valueElementToReferenceTypeElementId: null,
        };

        await executeOperation(operation2, state, mockSnapShot);

        const appliedValueTwo = getStateValue({ id: 'apply', typeElementPropertyId: null });

        expect(appliedValueTwo.objectData.length).toEqual(1);
        expect(appliedValueTwo.objectData[0].developerName).toEqual('newItem');
        expect(appliedValueTwo.objectData[0].properties[0].contentValue).toEqual('new item');
        expect(appliedValueTwo.objectData[0].internalId).toEqual(appliedValue.objectData[0].internalId); // guid not changed
    });

    test('Command REMOVE deletes a list item', () => {

        const operation = {
            valueElementToApplyId: {
                command: 'REMOVE',
                id: 'apply',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: [
                        {
                            contentValue: 1,
                            externalId: 'externalId-1',
                        },
                        {
                            contentValue: 2,
                            externalId: 'externalId-2',
                        },
                        {
                            contentValue: 3,
                            externalId: 'externalId-3',
                        },
                    ],
                    typeElementId: 'type-element-id',
                },
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'VALUE_OF',
                id: 'reference',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: [
                        {
                            externalId: 'externalId-2',
                        },
                    ],
                },
            },
            valueElementToReferenceTypeElementId: null,
        };
        expect.assertions(6);

        return executeOperation(operation, state, snapshot).then((ret) => {
            expect(ret).toEqual(state);
            // Get the newly applied value
            const applied = getStateValue({ id: 'apply', typeElementPropertyId: null });
            expect(applied.objectData.length).toEqual(2);
            expect(applied.objectData[0].contentValue).toEqual(1);
            expect(applied.objectData[0].externalId).toEqual('externalId-1');
            expect(applied.objectData[1].contentValue).toEqual(3);
            expect(applied.objectData[1].externalId).toEqual('externalId-3');
        });
    });

    test('Command REMOVE ignores non-matching id', () => {

        const operation = {
            valueElementToApplyId: {
                command: 'REMOVE',
                id: 'apply',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: [
                        {
                            contentValue: 1,
                            externalId: 'externalId-1',
                        },
                        {
                            contentValue: 2,
                            externalId: 'externalId-2',
                        },
                        {
                            contentValue: 3,
                            externalId: 'externalId-3',
                        },
                    ],
                    typeElementId: 'type-element-id',
                },
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'VALUE_OF',
                id: 'reference',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: [
                        {
                            externalId: 'externalId-4',
                        },
                    ],
                },
            },
            valueElementToReferenceTypeElementId: null,
        };
        expect.assertions(8);

        return executeOperation(operation, state, snapshot).then((ret) => {
            expect(ret).toEqual(state);
            // Get the newly applied value
            const applied = getStateValue({ id: 'apply', typeElementPropertyId: null });
            expect(applied.objectData.length).toEqual(3);
            expect(applied.objectData[0].contentValue).toEqual(1);
            expect(applied.objectData[0].externalId).toEqual('externalId-1');
            expect(applied.objectData[1].contentValue).toEqual(2);
            expect(applied.objectData[1].externalId).toEqual('externalId-2');
            expect(applied.objectData[2].contentValue).toEqual(3);
            expect(applied.objectData[2].externalId).toEqual('externalId-3');
        });
    });

    test('Command REMOVE operates correctly on an empty list', () => {

        const operation = {
            valueElementToApplyId: {
                command: 'REMOVE',
                id: 'apply',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: null,
                    typeElementId: 'type-element-id',
                },
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'VALUE_OF',
                id: 'reference',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: [
                        {
                            externalId: 'externalId-4',
                        },
                    ],
                },
            },
            valueElementToReferenceTypeElementId: null,
        };
        expect.assertions(2);

        return executeOperation(operation, state, snapshot).then((ret) => {
            expect(ret).toEqual(state);
            // Get the newly applied value
            const applied = getStateValue({ id: 'apply', typeElementPropertyId: null });
            expect(applied.objectData.length).toEqual(0);
        });
    });

    test('Command NEW creates a new value based on the Type of the applied value', () => {

        const operation = {
            valueElementToApplyId: {
                command: 'NEW',
                id: 'apply',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: null,
                    typeElementId: 'type-element-id',
                },
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: null,
                id: null,
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: null,
                },
            },
            valueElementToReferenceTypeElementId: null,
        };
        expect.assertions(7);

        return executeOperation(operation, state, snapshot).then((ret) => {
            expect(ret).toEqual(state);
            // Get the newly applied value
            const applied = getStateValue({ id: 'apply', typeElementPropertyId: null });
            expect(applied.objectData.length).toEqual(1);
            expect(applied.objectData[0].properties.length).toEqual(1);
            expect(applied.objectData[0].properties[0].id).toEqual('property-id');
            expect(applied.objectData[0].properties[0].typeElementPropertyId).toEqual('property-id');
            expect(applied.objectData[0].properties[0].contentValue).toEqual(null);
            expect(applied.objectData[0].properties[0].objectData).toEqual(null);
        });
    });

    test('Command GET_FIRST returns null on an empty list', () => {

        const operation = {
            valueElementToApplyId: {
                command: 'SET_EQUAL',
                id: 'apply',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: null,
                },
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'GET_FIRST',
                id: 'reference',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: null,
                },
            },
            valueElementToReferenceTypeElementId: null,
        };
        expect.assertions(2);

        return executeOperation(operation, state, snapshot).then((ret) => {
            expect(ret).toEqual(state);
            // Get the newly applied value
            const applied = getStateValue({ id: 'apply', typeElementPropertyId: null });
            expect(applied.objectData).toEqual(null);
        });
    });

    test('Command GET_NEXT returns null on an empty list', () => {

        const operation = {
            valueElementToApplyId: {
                command: 'SET_EQUAL',
                id: 'apply',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: null,
                },
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'GET_NEXT',
                id: 'reference',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: null,
                },
            },
            valueElementToReferenceTypeElementId: null,
        };
        expect.assertions(2);

        return executeOperation(operation, state, snapshot).then((ret) => {
            expect(ret).toEqual(state);
            // Get the newly applied value
            const applied = getStateValue({ id: 'apply', typeElementPropertyId: null });
            expect(applied.objectData).toEqual(null);
        });
    });

    test('Command GET_FIRST returns first list item', () => {

        const operation = {
            valueElementToApplyId: {
                command: 'SET_EQUAL',
                id: 'apply',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: null,
                },
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'GET_FIRST',
                id: 'reference',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: [
                        {
                            contentValue: 'c',
                        },
                        {
                            contentValue: 'b',
                        },
                        {
                            contentValue: 'a',
                        },
                    ],
                },
            },
            valueElementToReferenceTypeElementId: null,
        };
        expect.assertions(3);

        return executeOperation(operation, state, snapshot).then((ret) => {
            expect(ret).toEqual(state);
            // Get the newly applied value
            const applied = getStateValue({ id: 'apply', typeElementPropertyId: null });
            expect(applied.objectData.length).toEqual(1);
            expect(applied.objectData[0].contentValue).toEqual('c');
        });
    });

    test('Command GET_FIRST returns first list item even when called twice', () => {

        const operation = {
            valueElementToApplyId: {
                command: 'SET_EQUAL',
                id: 'apply',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: null,
                },
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'GET_FIRST',
                id: 'reference',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: [
                        {
                            contentValue: 'c',
                        },
                        {
                            contentValue: 'b',
                        },
                        {
                            contentValue: 'a',
                        },
                    ],
                },
            },
            valueElementToReferenceTypeElementId: null,
        };
        const operation2 = { ...operation };

        expect.assertions(6);

        return executeOperation(operation, state, snapshot).then((ret) => {
            expect(ret).toEqual(state);
            // Get the newly applied value
            const applied = getStateValue({ id: 'apply', typeElementPropertyId: null });
            expect(applied.objectData.length).toEqual(1);
            expect(applied.objectData[0].contentValue).toEqual('c');

            return executeOperation(operation2, state, snapshot).then((ret2) => {
                expect(ret2).toEqual(state);
                // Get the newly applied value
                const applied2 = getStateValue({ id: 'apply', typeElementPropertyId: null });
                expect(applied2.objectData.length).toEqual(1);
                expect(applied2.objectData[0].contentValue).toEqual('c');
            });
        });
    });

    test('Command GET_NEXT returns first list item if GET_FIRST has not been called', () => {

        const operation = {
            valueElementToApplyId: {
                command: 'SET_EQUAL',
                id: 'apply',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: null,
                },
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'GET_NEXT',
                id: 'reference',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: [
                        {
                            contentValue: 'c',
                        },
                        {
                            contentValue: 'b',
                        },
                        {
                            contentValue: 'a',
                        },
                    ],
                },
            },
            valueElementToReferenceTypeElementId: null,
        };
        expect.assertions(3);

        return executeOperation(operation, state, snapshot).then((ret) => {
            expect(ret).toEqual(state);
            // Get the newly applied value
            const applied = getStateValue({ id: 'apply', typeElementPropertyId: null });
            expect(applied.objectData.length).toEqual(1);
            expect(applied.objectData[0].contentValue).toEqual('c');
        });
    });

    test('Command GET_NEXT returns second list item if GET_FIRST has been called', () => {

        const operation = {
            valueElementToApplyId: {
                command: 'SET_EQUAL',
                id: 'apply',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: null,
                },
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'GET_FIRST',
                id: 'reference',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: [
                        {
                            contentValue: 'c',
                        },
                        {
                            contentValue: 'b',
                        },
                        {
                            contentValue: 'a',
                        },
                    ],
                },
            },
            valueElementToReferenceTypeElementId: null,
        };

        const operation2 = { ...operation };
        operation2.valueElementToReferenceId.command = 'GET_NEXT';

        expect.assertions(6);

        return executeOperation(operation, state, snapshot).then((ret) => {
            expect(ret).toEqual(state);
            // Get the newly applied value
            const applied = getStateValue({ id: 'apply', typeElementPropertyId: null });
            expect(applied.objectData.length).toEqual(1);
            expect(applied.objectData[0].contentValue).toEqual('c');

            return executeOperation(operation2, state, snapshot).then((ret2) => {
                expect(ret2).toEqual(state);
                // Get the newly applied value
                const applied2 = getStateValue({ id: 'apply', typeElementPropertyId: null });
                expect(applied2.objectData.length).toEqual(1);
                expect(applied2.objectData[0].contentValue).toEqual('b');
            });
        });
    });

    test('Command GET_NEXT returns second list item if GET_FIRST has been called', () => {

        const operation = {
            valueElementToApplyId: {
                command: 'SET_EQUAL',
                id: 'apply',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: null,
                },
            },
            valueElementToApplyTypeElementId: null,
            valueElementToReferenceId: {
                command: 'GET_NEXT',
                id: 'reference',
                typeElementPropertyId: null,
                expectedReturn: {
                    objectData: [
                        {
                            contentValue: 'c',
                        },
                        {
                            contentValue: 'b',
                        },
                        {
                            contentValue: 'a',
                        },
                    ],
                },
            },
            valueElementToReferenceTypeElementId: null,
        };

        // We need to clone operation each time as executeOperation() modifies the operation object
        const operation2 = { ...operation };
        const operation3 = { ...operation };
        const operation4 = { ...operation };

        expect.assertions(11);

        return executeOperation(operation, state, snapshot).then((ret) => {
            expect(ret).toEqual(state);
            // Get the newly applied value
            const applied = getStateValue({ id: 'apply', typeElementPropertyId: null });
            expect(applied.objectData.length).toEqual(1);
            expect(applied.objectData[0].contentValue).toEqual('c');

            return executeOperation(operation2, state, snapshot).then((ret2) => {
                expect(ret2).toEqual(state);
                const applied2 = getStateValue({ id: 'apply', typeElementPropertyId: null });
                expect(applied2.objectData.length).toEqual(1);
                expect(applied2.objectData[0].contentValue).toEqual('b');

                return executeOperation(operation3, state, snapshot).then((ret3) => {
                    expect(ret3).toEqual(state);
                    const applied3 = getStateValue({ id: 'apply', typeElementPropertyId: null });
                    expect(applied3.objectData.length).toEqual(1);
                    expect(applied3.objectData[0].contentValue).toEqual('a');

                    return executeOperation(operation4, state, snapshot).then((ret4) => {
                        expect(ret4).toEqual(state);
                        const applied4 = getStateValue({ id: 'apply', typeElementPropertyId: null });
                        // No more items
                        expect(applied4.objectData.length).toEqual(0);
                    });

                });

            });
        });
    });
});
