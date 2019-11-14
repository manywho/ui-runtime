import { executeMacro } from '../../../js/services/macros/MacroExecution';
import { getMacroState } from '../../../js/services/macros/MacroState';

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

const mockBasicMacro = 'function(state){}';

describe('Macro execution behaviour', () => {
    test('Values in state are always set to macro state context', () => {
        executeMacro(mockBasicMacro, mockMetaData, mockState);
        const result = getMacroState();
        expect(result).toEqual(mockState);
    });
    test('Macro state context is always returned', () => {
        const result = executeMacro(mockBasicMacro, mockMetaData, mockState);
        expect(result).toEqual(mockState);
    });
    test('Modified macro state context is returned', () => {
        const valueName = mockMetaData.valueElements[0].developerName;
        const valueId = mockMetaData.valueElements[0].id;
        const newContentValue = 'value0';
        const mockAdvancedMacro = 'function(state){state.setStringValue("{![' + valueName + ']}", "' + newContentValue + '");}';

        const result: any = executeMacro(mockAdvancedMacro, mockMetaData, mockState);
        expect(result.values[valueId].contentValue).toEqual(newContentValue);
    });
});
