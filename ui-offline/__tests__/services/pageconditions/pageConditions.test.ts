import PageRule from '../../../js/services/pageconditions/PageRule';
import PageOperation from '../../../js/services/pageconditions/PageOperation';
import { getStateValue } from '../../../js/models/State';
import PageCondition, { getTriggerComponentContentValue } from '../../../js/services/pageconditions/PageCondition';

jest.mock('../../../js/services/pageconditions/PageRule');
jest.mock('../../../js/services/pageconditions/PageOperation');
jest.mock('../../../js/models/State', () => ({
    getStateValue: jest.fn(),
}));

const mockgetStateValue:any = getStateValue;
const mockPageOperation:any = PageOperation;

const mockComponent = {
    id: 'test',
};

const mockSnaphot = {
    getValue: jest.fn(),
};

const mockValue = {
    isVisible: true,
    isEnabled: true,
    isRequired: true,
    pageComponentId: 'test',
    contentValue: null,
    objectData: null,
    contentType: '',
    isValid: true,
};

describe('Page conditions expected behaviour', () => {

    beforeEach(() => {
        mockSnaphot.getValue.mockClear();
        mockgetStateValue.mockClear();
        mockPageOperation.mockClear();
    });

    test('Should throw error if criteria type is not found', () => {
        const mockPageElement = {
            pageConditions: [
                {
                    pageOperations: [
                        {
                            assignment: {
                                assignee: {
                                    pageObjectReferenceId: 'test',
                                },
                            },
                        },
                    ],
                    pageRules: [{ left: { pageObjectReferenceId: 'test' } }],
                },
            ],
            pageElements: [],
        };
        expect(() => {
            PageCondition(mockPageElement, mockSnaphot, mockComponent, mockValue);
        }).toThrow('Check you have added a criteria value');
    });

    test('Should throw error if the triggering page component is not found in snapshot metadata', () => {
        mockSnaphot.getValue.mockImplementation(() => undefined);
        const mockPageElement = {
            pageConditions: [
                {
                    pageOperations: [
                        {
                            assignment: {
                                assignee: {
                                    pageObjectReferenceId: 'test',
                                },
                            },
                        },
                    ],
                    pageRules: [{ left: { pageObjectReferenceId: 'foo' }, criteriaType: 'EQUAL' }],
                },
            ],
            pageComponents: [],
        };
        expect(() => {
            PageCondition(mockPageElement, mockSnaphot, mockComponent, mockValue);
        }).toThrow('Could not find a trigger component');
    });

    test('If trigger component value is found in state then return its content value', () => {
        const mockContentValue = 'test';

        mockgetStateValue.mockImplementation(() => ({
            contentValue: mockContentValue,
        }));

        const mockTriggerComponent = {
            valueElementValueBindingReferenceId: {
                id: 'test',
            },
        };

        const result = getTriggerComponentContentValue(mockTriggerComponent, {}, {});
        expect(result).toEqual(mockContentValue);
    });

    test('If trigger component value is not found in state then return its default content value from snapshot', () => {
        const mockDefaultContentValue = 'test default value';

        mockgetStateValue.mockImplementation(() => undefined);

        mockSnaphot.getValue.mockImplementation(() => ({
            defaultContentValue: mockDefaultContentValue,
        }));

        const mockTriggerComponent = {
            valueElementValueBindingReferenceId: {
                id: 'test',
            },
        };

        const result = getTriggerComponentContentValue(mockTriggerComponent, mockSnaphot, {});
        expect(result).toEqual(mockDefaultContentValue);
    });

    test('If trigger component value has objectdata then return the expected property content value', () => {
        const mockTypePropId = 'test';
        const mockPropContentValue = 'content value';
        const mockDefaultContentValue = 'test default value';

        mockgetStateValue.mockImplementation(() => ({
            objectData: [
                {
                    properties: [
                        {
                            typeElementPropertyId: mockTypePropId,
                            contentValue: mockPropContentValue,
                        },
                    ],
                },
            ],
        }));

        const mockPageRule = {
            left: {
                valueElementToReferenceId: {
                    typeElementPropertyId: mockTypePropId,
                },
            },
        };

        mockSnaphot.getValue.mockImplementation(() => ({
            defaultContentValue: mockDefaultContentValue,
        }));

        const mockTriggerComponent = {
            valueElementValueBindingReferenceId: {
                id: 'test',
            },
        };

        const result = getTriggerComponentContentValue(mockTriggerComponent, mockSnaphot, mockPageRule);
        expect(result).toEqual(mockPropContentValue);
    });

    test('If a value comparable is not found that an error is thrown', () => {

        const mockContentValue = 'test';

        mockgetStateValue.mockImplementation(() => ({
            contentValue: mockContentValue,
        }));

        mockSnaphot.getValue.mockImplementation(() => undefined);

        const mockPageElement = {
            pageConditions: [
                {
                    pageOperations: [
                        {
                            assignment: {
                                assignee: {
                                    pageObjectReferenceId: 'test',
                                },
                            },
                        },
                    ],
                    pageRules: [{
                        left: { pageObjectReferenceId: 'test' },
                        criteriaType: 'EQUAL',
                        right: { valueElementToReferenceId: { id: 'test' } },
                    }],
                },
            ],
            pageComponents: [
                {
                    id: 'test',
                    valueElementValueBindingReferenceId: {
                        id: 'test',
                    },
                },
            ],
        };

        expect(() => {
            PageCondition(mockPageElement, mockSnaphot, mockComponent, mockValue);
        }).toThrow('Cannot find a value to compare');
    });

    test('If no errors are thrown then a page rule is executed', () => {
        const mockContentValue = 'test';

        mockgetStateValue.mockImplementation(() => ({
            contentValue: mockContentValue,
        }));

        mockSnaphot.getValue.mockImplementation(() => ({
            contentValue: 'test',
        }));

        const mockPageElement = {
            pageConditions: [
                {
                    pageOperations: [
                        {
                            assignment: {
                                assignee: {
                                    pageObjectReferenceId: 'test',
                                },
                            },
                        },
                    ],
                    pageRules: [{
                        left: { pageObjectReferenceId: 'test' },
                        criteriaType: 'EQUAL',
                        right: { valueElementToReferenceId: { id: 'test' } },
                    }],
                },
            ],
            pageComponents: [
                {
                    id: 'test',
                    valueElementValueBindingReferenceId: {
                        id: 'test',
                    },
                },
            ],
        };

        PageCondition(mockPageElement, mockSnaphot, mockComponent, mockValue);
        expect(PageRule).toHaveBeenCalledTimes(1);
    });

    test('If no errors are thrown then page operations are executed', () => {
        const mockContentValue = 'test';

        mockgetStateValue.mockImplementation(() => ({
            contentValue: mockContentValue,
        }));

        mockSnaphot.getValue.mockImplementation(() => ({
            contentValue: 'test',
        }));

        const mockPageElement = {
            pageConditions: [
                {
                    pageOperations: [
                        {
                            assignment: {
                                assignee: {
                                    pageObjectReferenceId: 'test',
                                },
                            },
                        },
                        {
                            assignment: {
                                assignee: {
                                    pageObjectReferenceId: 'test',
                                },
                            },
                        },
                    ],
                    pageRules: [{
                        left: { pageObjectReferenceId: 'test' },
                        criteriaType: 'EQUAL',
                        right: { valueElementToReferenceId: { id: 'test' } },
                    }],
                },
            ],
            pageComponents: [
                {
                    id: 'test',
                    valueElementValueBindingReferenceId: {
                        id: 'test',
                    },
                },
            ],
        };

        PageCondition(mockPageElement, mockSnaphot, mockComponent, mockValue);
        expect(mockPageOperation).toHaveBeenCalledTimes(2);
    });
});
