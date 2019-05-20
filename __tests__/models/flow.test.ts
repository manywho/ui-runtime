import { FlowInit, cacheObjectData, patchObjectDataCache, setCurrentRequestOfflineId, getRequests } from '../../js/models/Flow';
import { guid } from '../../test-utils';

describe('Flow model expected behaviour', () => {
    test('Object data gets concatenated', () => {
        const tenantId = 'test';
        const state = {};
        const objectData = {};
        const flow = FlowInit({ tenantId, state, objectData });

        const data = [{}];
        const typeElementId = '123';
        let cache = null;
        let n = 0;

        while (n < 10) {
            n += 1;
            cache = cacheObjectData(data, typeElementId);
        }
        expect(cache[typeElementId].length).toEqual(10);
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

        const updatedObject =  [{
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
        }];

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

        const updatedObject =  [{
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
        }];

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
