import { getProperty, getValueByName, setStateValue } from '../../../js/services/macros/MacroUtils';
import { CONTENT_TYPES } from '../../../js/constants';
import { getMacroState, setMacroState } from '../../../js/services/macros/MacroState';

describe('Macro utilities behaviour', () => {
    // getProperty tests
    test('If property is found then returns the property contentValue', () => {
        const testTypeId = 'test id';
        const testContentValue = 'test content value';
        const value = {
            properties: [
                {
                    contentType: 'ContentString',
                    contentValue: testContentValue,
                    developerName: 'test name',
                    typeElementPropertyId: testTypeId,
                },
            ],
            developerName: 'test',
        };

        const result = getProperty(testTypeId, CONTENT_TYPES.STRING, value);
        expect(result).toEqual(testContentValue);
    });
    test('If property is found but is incorrect contentType then error is thrown', () => {
        const testTypeId = 'test id';
        const testContentValue = 'test content value';
        const value = {
            properties: [
                {
                    contentType: 'ContentString',
                    contentValue: testContentValue,
                    developerName: 'test name',
                    typeElementPropertyId: testTypeId,
                },
            ],
            developerName: 'test',
        };

        expect(() => {
            getProperty(testTypeId, CONTENT_TYPES.NUMBER, value);
        }).toThrow(Error);
    });
    test('If objectdata has no properties key throw an error', () => {
        const testTypeId = 'test id';
        const value = {
            developerName: 'test',
        };

        expect(() => {
            getProperty(testTypeId, CONTENT_TYPES.NUMBER, value);
        }).toThrow(Error);
    });
    test('If objectdata properties key is null then throw an error', () => {
        const testTypeId = 'test id';
        const value = {
            properties: null,
            developerName: 'test',
        };

        expect(() => {
            getProperty(testTypeId, CONTENT_TYPES.NUMBER, value);
        }).toThrow(Error);
    });

    // getValueByName tests
    test('If value is found in state then return values in state', () => {
        const mockMetaData = {
            valueElements: [
                { id: 'test1', developerName: 'name1', contentValue: 'value1' },
                { id: 'test2', developerName: 'name2', contentValue: 'value2' },
                { id: 'test3', developerName: 'name3', contentValue: 'value3' },
                { id: 'test4', developerName: 'name4', contentValue: 'value4' },
            ],
        };
        const mockState = {
            values: {
                test1: { contentValue: 'value1', objectData: null },
                test2: { contentValue: 'value2', objectData: null },
                test3: { contentValue: 'value3', objectData: null },
                test4: { contentValue: 'value4', objectData: null },
            },
        };

        const mockValueName = 'name2';
        const mockValueId = 'test2';

        setMacroState(mockState);

        const expectedResult = {
            props: mockState.values[mockValueId],
            id: mockValueId,
        };
        const result = getValueByName(mockValueName, mockMetaData);
        expect(result).toEqual(expectedResult);
    });
    test('If value is not found in snapshot then throw an error', () => {
        const mockMetaData = {
            valueElements: [
                { id: 'test1', developerName: 'name1', contentValue: 'value1' },
                { id: 'test2', developerName: 'name2', contentValue: 'value2' },
                { id: 'test3', developerName: 'name3', contentValue: 'value3' },
                { id: 'test4', developerName: 'name4', contentValue: 'value4' },
            ],
        };
        const mockState = {
            values: {
                test1: { contentValue: 'value1', objectData: null },
                test2: { contentValue: 'value2', objectData: null },
                test3: { contentValue: 'value3', objectData: null },
                test4: { contentValue: 'value4', objectData: null },
            },
        };

        const mockValueName = 'noname';

        setMacroState(mockState);

        expect(() => {
            getValueByName(mockValueName, mockMetaData);
        }).toThrow(Error);
    });
    test('If value is not found in state then throw an error', () => {
        const mockMetaData = {
            valueElements: [
                { id: 'test1', developerName: 'name1', contentValue: 'value1' },
                { id: 'test2', developerName: 'name2', contentValue: 'value2' },
                { id: 'test3', developerName: 'name3', contentValue: 'value3' },
                { id: 'test4', developerName: 'name4', contentValue: 'value4' },
            ],
        };
        const mockState = {
            values: {
                test1: { contentValue: 'value1', objectData: null },
                test3: { contentValue: 'value3', objectData: null },
                test4: { contentValue: 'value4', objectData: null },
            },
        };

        const mockValueName = 'name2';

        setMacroState(mockState);

        const expectedResult = {
            id: 'test2',
            developerName: 'name2',
            contentValue: 'value2',
        };

        expect(() => {
            getValueByName(mockValueName, mockMetaData);
        }).toThrow(`A value with name: ${expectedResult.developerName}, has not been set in state`);
    });

    // setStateValue tests
    test('State should get modified with passed value', () => {
        const mockValueId = 'new';
        const mockState = {
            values: {
                test1: { contentValue: 'value1', objectData: null },
                test2: { contentValue: 'value2', objectData: null },
                test3: { contentValue: 'value3', objectData: null },
                test4: { contentValue: 'value4', objectData: null },
            },
        };

        const newStateValue = { contentValue: 'new', objectData: null };

        const newMockState = {
            values: {
                test1: { contentValue: 'value1', objectData: null },
                test2: { contentValue: 'value2', objectData: null },
                test3: { contentValue: 'value3', objectData: null },
                test4: { contentValue: 'value4', objectData: null },
                new: { contentValue: 'new', objectData: null },
            },
        };

        setMacroState(mockState);
        setStateValue(mockValueId, newStateValue);
        expect(getMacroState()).toEqual(newMockState);
    });
});
