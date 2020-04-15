import { FlowInit, cacheObjectData, getObjectData, patchObjectDataCache, setCurrentRequestOfflineId, getRequests } from '../../js/models/Flow';
import { guid, str } from '../../js/test-utils';

describe('Flow model expected behaviour', () => {
    test('Object data gets replaced with new data for the correct typeElement key', () => {
        const tenantId = str();
        const state = {};
        const objectData = {};
        FlowInit({ tenantId, state, objectData });

        const typeElementId1 = str();
        const typeElementId2 = str();

        const dataSampleOne = [{ test1: str() }];
        const dataSampleTwo = [{ test1: str() }, { test2: str() }];
        cacheObjectData(dataSampleOne, typeElementId1);
        cacheObjectData(dataSampleTwo, typeElementId2);

        const cachedObjectDataForTypeElementId1 = getObjectData(typeElementId1);
        const cachedObjectDataForTypeElementId2 = getObjectData(typeElementId2);
        expect(cachedObjectDataForTypeElementId1).toEqual(dataSampleOne);
        expect(cachedObjectDataForTypeElementId2).toEqual(dataSampleTwo);

        const dataSampleThree = [{ test1: str() }, { test2: str() }, { test3: str() }];
        cacheObjectData(dataSampleThree, typeElementId1);

        const updatedCachedObjectDataForTypeElementId1 = getObjectData(typeElementId1);
        const updatedCachedObjectDataForTypeElementId2 = getObjectData(typeElementId2);
        expect(updatedCachedObjectDataForTypeElementId1).toEqual(dataSampleThree);
        expect(updatedCachedObjectDataForTypeElementId2).toEqual(dataSampleTwo);
    });

    test('Object data returned should get updated if object with matching internalId exists', () => {
        const typeElementId = 'test';

        const mockObjectOne = {
            objectData: {
                externalId: 'externalId1',
                internalId: 'internalId1',
                properties: [
                    {
                        developerName: 'test',
                        contentValue: 'test',
                    },
                ],
            },
        };

        const mockObjectTwo = {
            objectData: {
                externalId: 'externalId2',
                internalId: 'internalId2',
            },
        };

        const tenantId = 'test';
        const state = {};
        const objectData = {
            test: [
                mockObjectOne,
                mockObjectTwo,
            ],
        };

        FlowInit({ tenantId, state, objectData });

        const updatedObject = {
            objectData: {
                externalId: 'externalId1',
                internalId: 'internalId1',
                properties: [
                    {
                        developerName: 'testUpdated',
                        contentValue: 'testUpdated',
                    },
                ],
            },
        };

        const update = patchObjectDataCache(updatedObject, typeElementId);
        expect(update[typeElementId][0].objectData.properties[0].contentValue).toEqual('testUpdated');
    });

    test('Unmodified objectdata should be returned if object with no matching internal id exists', () => {
        const typeElementId = 'test';

        const mockObjectOne = {
            objectData: {
                externalId: 'externalId1',
                internalId: 'internalId1',
                properties: [
                    {
                        developerName: 'test',
                        contentValue: 'test',
                    },
                ],
            },
        };

        const mockObjectTwo = {
            objectData: {
                externalId: 'externalId2',
                internalId: 'internalId2',
            },
        };

        const tenantId = 'test';
        const state = {};
        const objectData = {
            test: [
                mockObjectOne,
                mockObjectTwo,
            ],
        };

        FlowInit({ tenantId, state, objectData });

        const updatedObject =  {
            objectData: {
                externalId: 'externalId3',
                internalId: 'internalId3',
                properties: [
                    {
                        developerName: 'testUpdated',
                        contentValue: 'testUpdated',
                    },
                ],
            },
        };

        const update = patchObjectDataCache(updatedObject, typeElementId);
        expect(update).toEqual(objectData);
    });

    test('Last requests assoc data property should get updated', () => {
        const tenantId = guid();
        const state = {};
        const objectData = {};
        const requests = [
            { request: {}, assocData: null },
            { request: {}, assocData: null },
            { request: {}, assocData: null },
        ];

        const offlineId = guid();
        const valueId = guid();
        const typeElementId = guid();

        FlowInit({ tenantId, state, objectData, requests });
        setCurrentRequestOfflineId(offlineId, valueId, typeElementId);
        const updatedRequests = getRequests();
        expect(updatedRequests[2].assocData).toEqual({ offlineId, valueId, typeElementId });
    });
});
