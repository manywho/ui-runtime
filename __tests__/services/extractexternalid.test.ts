import { guid, str } from '../../test-utils';

import extractExternalId, { checkForRequestsThatNeedAnExternalId } from '../../js/services/extractExternalId';
import { getObjectData } from '../../js/models/Flow';

jest.mock('../../js/models/Flow', () => ({
    getObjectData: jest.fn(() => []),
    getRequests: jest.fn(() => [
        {
            request: {
                mapElementInvokeRequest: {
                    pageRequest: {
                        pageComponentInputResponses: [
                            {
                                objectData: [
                                    { externalId: null, internalId: 'test' },
                                ],
                            },
                            {
                                objectData: [
                                    { externalId: '', internalId: '' },
                                ],
                            },
                        ],
                    },
                },
            },
        },
    ]),
}));

const getObjectDataMock: any = getObjectData;
const globalAny:any = global;
const mockStateId = guid();
const mockTenantId = guid();
const mockAuthToken = str(100);

const responseJsonMock = jest.fn(() => new Promise((resolve) => {
    const mockResponse = { objectData: [{ externalId: str(15) }] };
    resolve(mockResponse);
}));

globalAny.fetch = jest.fn().mockImplementation(() => new Promise((resolve) => {
    const mockResponse = { json: responseJsonMock };
    resolve(mockResponse);
}));

describe('Page service expected behaviour', () => {

    beforeEach(() => {
        getObjectDataMock.mockClear();
    });

    test('If a request is not associated to any object data no call to the state values endpoint is made', async () => {
        const mockRequest = { assocData: null, request: {} };
        expect.assertions(1);
        await extractExternalId(mockRequest, mockTenantId, mockAuthToken, mockStateId);
        expect(globalAny.fetch).not.toHaveBeenCalled();
    });

    test('if a request is associated to objectdata then a call to the state values endpoint is made', async () => {
        const mockRequest = { assocData: { offlineId: 'test', valueId: 'test', typeElementId: 'test' }, request: {} };
        const expectedValueHeaders = { headers: { ManyWhoTenant: mockTenantId, Authorization: mockAuthToken } };
        getObjectDataMock.mockImplementation(() => [
            { assocData: { offlineId: 'test' }, objectData: { internalId: 'internalId' } },
        ]);

        expect.assertions(1);
        await extractExternalId(mockRequest, mockTenantId, mockAuthToken, mockStateId);
        expect(globalAny.fetch).toHaveBeenCalledWith(
            `${globalAny.manywho.settings.global('platform.uri')}/api/run/1/state/${mockStateId}/values/${mockRequest.assocData.valueId}`,
            expectedValueHeaders,
        );
    });

    test('Requests associated to objectdata should get an external id assigned', () => {

        getObjectDataMock.mockImplementation(() => {
            const mockInternalId = 'test';
            const mockOfflineId = 'test';
            return [
                { assocData: { offlineId: mockOfflineId }, objectData: { internalId: mockInternalId } },
                { assocData: { offlineId: '' }, objectData: { internalId: '' } },
            ];
        });

        const mockExternalId = str(15);
        const mockAssocData = {
            offlineId: 'test',
            valueId: guid(),
            typeElementId: guid(),
        };
        const updatedRequests = checkForRequestsThatNeedAnExternalId(mockAssocData, mockExternalId);
        expect(
            updatedRequests[0].request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses[0].objectData[0].externalId,
        ).toEqual(mockExternalId);
    });

    test('When internal id does not match then the external id is not modified', () => {
        getObjectDataMock.mockImplementation(() => [
            { assocData: { offlineId: 'offlineIdTest1' }, objectData: { internalId: 'internalIdTest4' } },
            { assocData: { offlineId: 'offlineIdTest2' }, objectData: { internalId: 'internalIdTest2' } },
        ]);

        const mockExternalId = 'test';
        const mockAssocData = {
            offlineId: 'offlineIdTest1',
            valueId: 'test',
            typeElementId: 'test',
        };
        const updatedRequests = checkForRequestsThatNeedAnExternalId(mockAssocData, mockExternalId);
        expect(
            updatedRequests[0].request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses[0].objectData[0].externalId,
        ).toEqual(null);
    });
});
