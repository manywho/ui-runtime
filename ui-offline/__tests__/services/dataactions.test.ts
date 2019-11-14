import DataActions from '../../js/services/DataActions';
import { setStateValue } from '../../js/models/State';
import { cacheObjectData, patchObjectDataCache } from '../../js/models/Flow';
import { str } from '../../test-utils';

const mockCacheObjectData: any = cacheObjectData;

const mockTypeElementId = 'testTypeElementId';
const mockValueElementToApplyId = 'testValueId';

const mockObjectOne = {
    objectData: {
        externalId: 'externalId1',
        internalId: 'internalId1',
    },
};

const mockObjectTwo = {
    objectData: {
        externalId: 'externalId2',
        internalId: 'internalId2',
    },
};

jest.mock('../../js/models/Flow', () => ({
    getObjectData: jest.fn(() => {
        return [
            mockObjectOne,
            mockObjectTwo,
        ];
    }),
    patchObjectDataCache: jest.fn(),
    cacheObjectData: jest.fn(),
    setCurrentRequestOfflineId: jest.fn(),
}));

const mockAction = {
    crudOperationType: 'SAVE',
    valueElementToApplyId: mockValueElementToApplyId,
    objectDataRequest: {
        typeElementId: mockTypeElementId,
    },
};

const mockFlow = {
    state: 'test',
    tenantId: 'test',
};

const mockSnapshot = {
    getValue: jest.fn(() => {
        return {
            typeElementId: mockTypeElementId,
        };
    }),
    metadata: {
        typeElements: [
            { id: mockTypeElementId, properties: [] },
        ],
    },
};

describe('Data action behaviour', () => {

    beforeEach(() => {
        mockCacheObjectData.mockClear();
    });

    test('Offline state should always be returned', () => {
        const mockObjectData = {
            objectData: [
                {
                    externalId: 'externalId3',
                    internalId: 'internalId3',
                },
            ],
        };

        setStateValue(mockValueElementToApplyId, mockTypeElementId, mockSnapshot, mockObjectData);

        const mockDefaultAction = {
            crudOperationType: '',
            valueElementToApplyId: mockValueElementToApplyId,
            objectDataRequest: {
                typeElementId: mockTypeElementId,
            },
        };
        const executeDefaultDataAction = DataActions(mockDefaultAction, mockFlow, mockSnapshot);
        expect(executeDefaultDataAction).toEqual(mockFlow.state);

        const mockSaveAction = {
            crudOperationType: 'SAVE',
            valueElementToApplyId: mockValueElementToApplyId,
            objectDataRequest: {
                typeElementId: mockTypeElementId,
            },
        };
        const executeSaveDataAction = DataActions(mockSaveAction, mockFlow, mockSnapshot);
        expect(executeSaveDataAction).toEqual(mockFlow.state);

        const mockDeleteAction = {
            crudOperationType: 'DELETE',
            valueElementToApplyId: mockValueElementToApplyId,
            objectDataRequest: {
                typeElementId: mockTypeElementId,
            },
        };
        const executeDeleteDataAction = DataActions(mockDeleteAction, mockFlow, mockSnapshot);
        expect(executeDeleteDataAction).toEqual(mockFlow.state);
    });

    test('When objectdata is existing then the objectdata memory cache should be updated', () => {

        const mockObjectOneInState = {
            externalId: 'externalId1',
            internalId: 'internalId1',
        };

        const mockObjectTwoInState = {
            externalId: 'externalId2',
            internalId: 'internalId2',
        };

        const mockObjectData = {
            objectData: [
                mockObjectOneInState,
                mockObjectTwoInState,
            ],
        };

        setStateValue(mockValueElementToApplyId, mockTypeElementId, mockSnapshot, mockObjectData);
        DataActions(mockAction, mockFlow, mockSnapshot);

        // Calling this function indicates that an update is being performed
        expect(patchObjectDataCache).toHaveBeenCalledTimes(2);
    });

    test('When objectdata is not existing then new object is concatenated to objectdata cache', () => {
        const mockObjectData = {
            objectData: [
                {
                    externalId: str(),
                    internalId: str(),
                },
            ],
        };

        const mockArgs = mockCacheObjectData.mock.calls;

        setStateValue(mockValueElementToApplyId, mockTypeElementId, mockSnapshot, mockObjectData);

        expect(mockArgs.length).toEqual(0);
        DataActions(mockAction, mockFlow, mockSnapshot);

        // Assert that the number of objects being cached
        // is as expected
        expect(mockArgs[0][0].length).toEqual(3);

        // Calling this function indicates that a new object is being cached
        expect(mockCacheObjectData).toHaveBeenCalledTimes(1);
    });
});
