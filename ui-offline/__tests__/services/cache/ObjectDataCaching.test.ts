import ObjectDataCaching, { generateObjectData, getObjectDataRequest } from '../../../js/services/cache/ObjectDataCaching';
import { cacheObjectData } from '../../../js/models/Flow';
import OnCached from '../../../js/services/cache/OnCached';

jest.mock('../../../js/models/Flow', () => ({
    cacheObjectData: jest.fn(),
}));

jest.mock('../../../js/services/cache/OnCached');

const OnCachedMock:any = OnCached;

const mockBindingId = 'test';
const mockTypeElementId = 'test';

const mockBindingId2 = 'test2';
const mockTypeElementId2 = 'test2';

const mockTypeName = 'test';
const mockTypeName2 = 'test2';

const propertyName1 = 'prop1';
const propertyName2 = 'prop2';

const mockFlow = {
    state: {},
    tenantId: 'test',
};

const window2: any = window;
const globalAny: any = global;
const mockCacheObjectData: any = cacheObjectData;

const mockMetaData = {
    pageElements: [
        {
            pageComponents: [
                {
                    objectDataRequest: {
                        command: null,
                        listFilter: null,
                        typeElementBindingId: mockBindingId,
                        typeElementDeveloperName: null,
                        typeElementId: mockTypeElementId,
                    },
                },
                {
                    objectDataRequest: {
                        command: null,
                        listFilter: null,
                        typeElementBindingId: mockBindingId2,
                        typeElementDeveloperName: null,
                        typeElementId: mockTypeElementId2,
                    },
                },
            ],
        },
    ],
    typeElements: [
        {
            id: mockTypeElementId,
            developerName: mockTypeName,
            bindings: [
                {
                    id: mockBindingId,
                },
            ],
            properties: [
                { developerName: propertyName1 },
                { developerName: propertyName2 },
            ],
        },
        {
            id: mockTypeElementId2,
            developerName: mockTypeName2,
            bindings: [
                {
                    id: mockBindingId2,
                },
            ],
            properties: [
                { developerName: propertyName1 },
                { developerName: propertyName2 },
            ],
        },
    ],
};

const requestLimit = globalAny.manywho.settings.global('offline.cache.requests.limit', null, 250);
const requestPageSize = globalAny.manywho.settings.global('offline.cache.requests.pageSize', null, 10);
const requestIterations = Math.ceil(requestLimit / requestPageSize);

describe('Object data response caching behaviour', () => {

    beforeEach(() => {
        mockCacheObjectData.mockClear();
        OnCachedMock.mockClear();
    });

    // TODO: figure out how to mock jquery deffered fail
    test.skip('That an object data request is made for every request', (done) => {
        window2.metaData = mockMetaData;

        OnCachedMock.mockImplementation(() => {
            expect(globalAny.manywho.ajax.dispatchObjectDataRequest).toHaveBeenCalledTimes(requestIterations);
            done();
        });

        ObjectDataCaching(mockFlow);
    });

    // TODO: figure out how to mock jquery deffered fail
    test.skip('That an object data request response is set into flow model state', (done) => {
        window2.metaData = mockMetaData;

        OnCachedMock.mockImplementation(() => {
            expect(mockCacheObjectData).toHaveBeenCalledTimes(requestIterations);
            done();
        });

        ObjectDataCaching(mockFlow);
    });

    test('Generating object data requests should return empty if there are no data actions/page component objectdatarequest in snapshot', () => {
        window2.metaData = {
            pageElements: [],
            mapElements: [],
        };

        expect(generateObjectData()).toEqual([]);
    });

    test('Generating object data requests should return an array of object data requests', () => {
        window2.metaData = mockMetaData;
        const objectDataRequests = generateObjectData();
        expect(objectDataRequests.length).toEqual(mockMetaData.pageElements[0].pageComponents.length);
    });

    test('A single object data requests list filter limit should be equal to globally defined limit', () => {
        window2.metaData = mockMetaData;
        const mockRequestObject = {
            command: null,
            listFilter: null,
            typeElementBindingId: mockBindingId,
            typeElementDeveloperName: null,
            typeElementId: mockTypeElementId,
        };

        const result = getObjectDataRequest(mockRequestObject);
        expect(result.listFilter.limit).toEqual(requestLimit);
    });

    test('A single object data requests typeElementBindingId should be equal to the associated type elements binding id', () => {
        window2.metaData = mockMetaData;
        const mockRequestObject = {
            command: null,
            listFilter: null,
            typeElementBindingId: mockBindingId,
            typeElementDeveloperName: null,
            typeElementId: mockTypeElementId,
        };

        const result = getObjectDataRequest(mockRequestObject);
        expect(result.typeElementBindingId).toEqual(mockMetaData.typeElements[0].bindings[0].id);
    });

    test('A single object data requests objectDataTypes typeElementId should be equal to the associated type elements typeElementId', () => {
        window2.metaData = mockMetaData;
        const mockRequestObject = {
            command: null,
            listFilter: null,
            typeElementBindingId: mockBindingId,
            typeElementDeveloperName: null,
            typeElementId: mockTypeElementId,
        };

        const result = getObjectDataRequest(mockRequestObject);
        expect(result.objectDataType.typeElementId).toEqual(mockMetaData.typeElements[0].id);
    });

    test('A single object data requests objectDataTypes developerName should be equal to the associated type elements developerName', () => {
        window2.metaData = mockMetaData;
        const mockRequestObject = {
            command: null,
            listFilter: null,
            typeElementBindingId: mockBindingId,
            typeElementDeveloperName: null,
            typeElementId: mockTypeElementId,
        };

        const result = getObjectDataRequest(mockRequestObject);
        expect(result.objectDataType.developerName).toEqual(mockMetaData.typeElements[0].developerName);
    });

    test('A single object data requests objectDataTypes properties should map to the associated type elements properties', () => {
        window2.metaData = mockMetaData;
        const mockRequestObject = {
            command: null,
            listFilter: null,
            typeElementBindingId: mockBindingId,
            typeElementDeveloperName: null,
            typeElementId: mockTypeElementId,
        };

        const result = getObjectDataRequest(mockRequestObject);
        expect(result.objectDataType.properties.length).toEqual(2);
        expect(result.objectDataType.properties[0].developerName).toEqual(propertyName1);
        expect(result.objectDataType.properties[1].developerName).toEqual(propertyName2);
    });
});
