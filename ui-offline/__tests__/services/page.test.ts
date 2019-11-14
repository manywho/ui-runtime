import { generatePage } from '../../js/services/Page';
import PageCondition from '../../js/services/pageconditions/PageCondition';

jest.mock('../../js/services/pageconditions/PageCondition');

const pageConditionMock: any = PageCondition;

console.error = jest.fn();

const mockRequest = {
    annotations: null,
    currentMapElementDeveloperName: '',
    currentMapElementId: '',
    geoLocation: null,
    invokeType: 'SYNC',
    key: 0,
    mapElementInvokeRequest: {
        pageRequest: {
            pageComponentInputResponses: [
                {
                    contentValue: true,
                    objectData: null,
                    pageComponentId: 'test',
                },
            ],
        },
        selectedOutcomeId: '',
    },
    mode: '',
    navigationElementId: null,
    selectedMapElementId: null,
    selectedNavigationElementId: null,
    stateId: '',
    stateToken: '',
};

const mockState = {
    currentMapElementId: '',
    id: '',
    token: '',
    values: [],
    getValue: jest.fn(),
    setValue: jest.fn(),
};

const mockMapElement = {
    id: '',
    developerName: '',
    outcomes: [],
    pageElementId: 'test',
};

const mockTenantId = '';

describe('Page service expected behaviour', () => {

    beforeEach(() => {
        pageConditionMock.mockClear();
    });

    test('If the page element has page conditions then call the page condition service', () => {
        pageConditionMock.mockImplementation(() => {
            return;
        });
        const mockSnapshot = {
            metadata: {
                pageElements: [
                    {
                        id: 'test',
                        pageContainers: [],
                        pageComponents: [
                            { id: 'test' },
                        ],
                        pageConditions: [],
                    },
                ],
                id: {
                    id: '',
                    versionId: '',
                },
            },
            getSystemValue: jest.fn(() => {
                return { defaultContentValue: 'False' };
            }),
        };
        generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId);
        expect(PageCondition).toHaveBeenCalled();
    });

    test('If the page element does not have page conditions then page condition service is not called', () => {
        pageConditionMock.mockImplementation(() => {
            return;
        });
        const mockSnapshot = {
            metadata: {
                pageElements: [
                    {
                        id: 'test',
                        pageContainers: [],
                        pageComponents: [
                            { id: 'test' },
                        ],
                        pageConditions: null,
                    },
                ],
                id: {
                    id: '',
                    versionId: '',
                },
            },
            getSystemValue: jest.fn(() => {
                return { defaultContentValue: 'False' };
            }),
        };
        generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId);
        expect(PageCondition).not.toHaveBeenCalled();
    });

    test('If page condition service throws an error then console error is called', () => {
        pageConditionMock.mockImplementation(() => {
            throw new Error();
        });
        const mockSnapshot = {
            metadata: {
                pageElements: [
                    {
                        id: 'test',
                        pageContainers: [],
                        pageComponents: [
                            { id: 'test' },
                        ],
                        pageConditions: [],
                    },
                ],
                id: {
                    id: '',
                    versionId: '',
                },
            },
            getSystemValue: jest.fn(() => {
                return { defaultContentValue: 'False' };
            }),
        };
        generatePage(mockRequest, mockMapElement, mockState, mockSnapshot, mockTenantId);
        expect(console.error).toHaveBeenCalled();
    });
});
