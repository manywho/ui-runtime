import MacroMethods, { bindValuePropertyFunctions } from '../../../js/services/macros/MacroMethods';
import { setMacroState } from '../../../js/services/macros/MacroState';
import MacroPropertyMethods from '../../../js/services/macros/MacroPropertyMethods';
import * as utils from '../../../js/services/macros/MacroUtils';

const datetimeMock = new Date();
const datetimeFormattedMock = utils.toEngineUTCStringFormat(datetimeMock);

const mockMetaData = {
    valueElements: [
        { id: 'test1', developerName: 'booleanTest', defaultContentValue: false },
        { id: 'test2', developerName: 'contentTest', defaultContentValue: 'content' },
        { id: 'test3', developerName: 'dateTimeTest', defaultContentValue: datetimeMock },
        { id: 'test4', developerName: 'numberTest', defaultContentValue: '0' },
        { id: 'test5', developerName: 'objectTest', defaultObjectData: [] },
        { id: 'test6', developerName: 'passwordTest', defaultContentValue: 'password' },
        { id: 'test7', developerName: 'valueTest', defaultContentValue: 'value' },
        { id: 'test8', developerName: 'arrayTest', defaultObjectData: [] },
    ],
};

const mockState = {
    values: {
        test1: { id: 'test1', developerName: 'booleanTest', contentValue: false },
        test2: { id: 'test2', developerName: 'contentTest', contentValue: 'content' },
        test3: { id: 'test3', developerName: 'dateTimeTest', contentValue: datetimeMock },
        test4: { id: 'test4', developerName: 'numberTest', contentValue: 0 },
        test5: { id: 'test5', developerName: 'objectTest', objectData: [{ properties: [] }] },
        test6: { id: 'test6', developerName: 'passwordTest', contentValue: 'password' },
        test7: { id: 'test7', developerName: 'valueTest', contentValue: 'value' },
        test8: { id: 'test8', developerName: 'arrayTest', objectData: [] },
    },
};

const macroFunctions: any = bindValuePropertyFunctions();
for (const key of Object.keys(macroFunctions)) {
    mockState.values.test5[key] = macroFunctions[key];
}

setMacroState(mockState);
MacroMethods.initMethods(mockMetaData);

describe('Macro value methods behaviour', () => {

    test('get datetime value returns a datetime string', () => {
        const result = MacroMethods.getDateTimeValue(`{![${mockMetaData.valueElements[2].developerName}]}`);
        expect(result).toEqual(datetimeFormattedMock);
    });

    test('get number value returns a number', () => {
        const result = MacroMethods.getNumberValue(`{![${mockMetaData.valueElements[3].developerName}]}`);
        expect(result).toEqual(mockState.values.test4.contentValue);
    });

    test('get object value returns an object', () => {
        const result = MacroMethods.getObject(`{![${mockMetaData.valueElements[4].developerName}]}`);
        expect(result).toEqual(mockState.values.test5.objectData[0]);
    });

    test('get array value returns an array', () => {
        const result = MacroMethods.getArray(`{![${mockMetaData.valueElements[7].developerName}]}`);
        expect(result).toEqual(mockState.values.test8.objectData);
    });

    test('Setter functions insert passed value into macro state', () => {

        const spy = jest.spyOn(utils, 'setStateValue');

        setMacroState(mockState);
        MacroMethods.initMethods(mockMetaData);

        MacroMethods.setDateTimeValue(
            `{![${mockState.values.test3.developerName}]}`,
            datetimeMock,
        );
        const mockDateTimeProps = {
            contentValue: datetimeFormattedMock,
            objectData: null,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockState.values.test3.id,
            mockDateTimeProps,
        );

        const mockObjectContentValue = { properties: [] };
        MacroMethods.setObject(
            `{![${mockState.values.test5.developerName}]}`,
            mockObjectContentValue,
        );
        const mockObjectProps = {
            contentValue: null,
            objectData: [mockObjectContentValue],
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockState.values.test5.id,
            mockObjectProps,
        );

        const mockArrayContentValue = [1, 2, 3];
        MacroMethods.setArray(
            `{![${mockState.values.test8.developerName}]}`,
            mockArrayContentValue,
        );
        const mockArrayProps = {
            contentValue: null,
            objectData: mockArrayContentValue,
            pageComponentId: null,
        };
        expect(spy).toHaveBeenCalledWith(
            mockState.values.test8.id,
            mockArrayProps,
        );
    });

    test('Binding property methods should return an object with values mapping to property methods', () => {
        const result = bindValuePropertyFunctions();
        for (const key in MacroPropertyMethods) {
            // eslint-disable-next-line no-prototype-builtins
            if (MacroPropertyMethods.hasOwnProperty(key)) {
                const func = MacroPropertyMethods[key];
                expect(result[func.name]).toEqual(MacroPropertyMethods[key]);
            }
        }
    });
});
