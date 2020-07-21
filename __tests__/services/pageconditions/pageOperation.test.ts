import PageOperation from '../../../js/services/pageconditions/PageOperation';
import { METADATA_TYPES } from '../../../js/constants';

const mockSnaphot = {
    getValue: jest.fn(),
};

describe('Page operation expected behaviour', () => {

    beforeEach(() => {
        mockSnaphot.getValue.mockClear();
    });

    test('If there is now assignor value that an error is thrown', () => {

        mockSnaphot.getValue.mockImplementation(() => undefined);

        const operation = {
            assignment: {
                assignee: {
                    pageObjectReferenceId: 'test',
                    metadataType: METADATA_TYPES.visible,
                },
                assignor: {
                    valueElementToReferenceId: {
                        id: 'test',
                    },
                },
            },
        };

        const pageRuleResult = true;

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

        const component = {
            id: 'test',
        };

        expect(() => {
            PageOperation(operation, mockSnaphot, pageRuleResult, mockValue, component);
        }).toThrow('Cannot find an assignor value for operation');
    });

    test('That when page rule result is equal to the assignor value that visibility property is true', () => {

        mockSnaphot.getValue.mockImplementation(() => ({
            defaultContentValue: 'true',
        }));

        const operation = {
            assignment: {
                assignee: {
                    pageObjectReferenceId: 'test',
                    metadataType: METADATA_TYPES.visible,
                },
                assignor: {
                    valueElementToReferenceId: {
                        id: 'test',
                    },
                },
            },
        };

        const pageRuleResult = true;

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

        const component = {
            id: 'test',
        };

        const result = PageOperation(operation, mockSnaphot, pageRuleResult, mockValue, component);
        expect(result.isVisible).toBeTruthy();
    });

    test('That when page rule result is not equal to the assignor value that visibility property is false', () => {

        mockSnaphot.getValue.mockImplementation(() => ({
            defaultContentValue: 'true',
        }));

        const operation = {
            assignment: {
                assignee: {
                    pageObjectReferenceId: 'test',
                    metadataType: METADATA_TYPES.visible,
                },
                assignor: {
                    valueElementToReferenceId: {
                        id: 'test',
                    },
                },
            },
        };

        const pageRuleResult = false;

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

        const component = {
            id: 'test',
        };

        const result = PageOperation(operation, mockSnaphot, pageRuleResult, mockValue, component);
        expect(result.isVisible).toBeFalsy();
    });

    test('That when page rule result is equal to the assignor value that required property is true', () => {

        mockSnaphot.getValue.mockImplementation(() => ({
            defaultContentValue: 'true',
        }));

        const operation = {
            assignment: {
                assignee: {
                    pageObjectReferenceId: 'test',
                    metadataType: METADATA_TYPES.required,
                },
                assignor: {
                    valueElementToReferenceId: {
                        id: 'test',
                    },
                },
            },
        };

        const pageRuleResult = true;

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

        const component = {
            id: 'test',
        };

        const result = PageOperation(operation, mockSnaphot, pageRuleResult, mockValue, component);
        expect(result.isRequired).toBeTruthy();
    });

    test('That when page rule result is not equal to the assignor value that required property is false', () => {

        mockSnaphot.getValue.mockImplementation(() => ({
            defaultContentValue: 'true',
        }));

        const operation = {
            assignment: {
                assignee: {
                    pageObjectReferenceId: 'test',
                    metadataType: METADATA_TYPES.required,
                },
                assignor: {
                    valueElementToReferenceId: {
                        id: 'test',
                    },
                },
            },
        };

        const pageRuleResult = false;

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

        const component = {
            id: 'test',
        };

        const result = PageOperation(operation, mockSnaphot, pageRuleResult, mockValue, component);
        expect(result.isRequired).toBeFalsy();
    });

    test('That when page rule result is equal to the assignor value that enabled property is true', () => {

        mockSnaphot.getValue.mockImplementation(() => ({
            defaultContentValue: 'true',
        }));

        const operation = {
            assignment: {
                assignee: {
                    pageObjectReferenceId: 'test',
                    metadataType: METADATA_TYPES.enabled,
                },
                assignor: {
                    valueElementToReferenceId: {
                        id: 'test',
                    },
                },
            },
        };

        const pageRuleResult = true;

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

        const component = {
            id: 'test',
        };

        const result = PageOperation(operation, mockSnaphot, pageRuleResult, mockValue, component);
        expect(result.isEnabled).toBeTruthy();
    });

    test('That when page rule result is not equal to the assignor value that enabled property is false', () => {

        mockSnaphot.getValue.mockImplementation(() => ({
            defaultContentValue: 'true',
        }));

        const operation = {
            assignment: {
                assignee: {
                    pageObjectReferenceId: 'test',
                    metadataType: METADATA_TYPES.enabled,
                },
                assignor: {
                    valueElementToReferenceId: {
                        id: 'test',
                    },
                },
            },
        };

        const pageRuleResult = false;

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

        const component = {
            id: 'test',
        };

        const result = PageOperation(operation, mockSnaphot, pageRuleResult, mockValue, component);
        expect(result.isEnabled).toBeFalsy();
    });
});
