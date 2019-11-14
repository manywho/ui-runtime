import { bindValuePropertyFunctions } from '../../../js/services/macros/MacroMethods';
import { CONTENT_TYPES } from '../../../js/constants';
import { getProperty, setProperty } from '../../../js/services/macros/MacroUtils';

const mockContentValue = 'test content value';

jest.mock('../../../js/services/macros/MacroUtils', () => ({
    getProperty: jest.fn(() => {
        return mockContentValue;
    }),
    setProperty: jest.fn(),
    toEngineUTCStringFormat: jest.fn(() => {
        return mockContentValue;
    }),
}));

describe('Macro value property methods behaviour', () => {
    const mockTypeId = 'test id';
    let response;

    beforeAll(() => {
        function generateResponse() {}

        const macroFunctions: any = bindValuePropertyFunctions();
        for (const key of Object.keys(macroFunctions)) {
            generateResponse.prototype[key] = macroFunctions[key];
        }
        response = new generateResponse();
    });

    test('get string property calls getProperty', () => {
        const result = response.getPropertyStringValue(mockTypeId);
        expect(getProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.STRING, response);
        expect(result).toEqual(mockContentValue);
    });

    test('get content property calls getProperty', () => {
        const result = response.getPropertyContentValue(mockTypeId);
        expect(getProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.CONTENT, response);
        expect(result).toEqual(mockContentValue);
    });

    test('get password property calls getProperty', () => {
        const result = response.getPropertyPasswordValue(mockTypeId);
        expect(getProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.PASSWORD, response);
        expect(result).toEqual(mockContentValue);
    });

    test('get number property calls getProperty', () => {
        const result = response.getPropertyNumberValue(mockTypeId);
        expect(getProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.NUMBER, response);
        expect(result).toEqual(mockContentValue);
    });

    test('get date time property calls getProperty', () => {
        const result = response.getPropertyDateTimeValue(mockTypeId);
        expect(getProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.DATETIME, response);
        expect(result).toEqual(mockContentValue);
    });

    test('get boolean property calls getProperty', () => {
        const result = response.getPropertyBooleanValue(mockTypeId);
        expect(getProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.BOOLEAN, response);
        expect(result).toEqual(mockContentValue);
    });

    test('get array property calls getProperty', () => {
        const result = response.getPropertyArray(mockTypeId);
        expect(getProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.LIST, response);
        expect(result).toEqual(mockContentValue);
    });

    test('get object property calls getProperty', () => {
        const result = response.getPropertyObject(mockTypeId);
        expect(getProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.OBJECT, response);
        expect(result).toEqual(mockContentValue);
    });

    test('set string property calls setProperty', () => {
        response.setPropertyStringValue(mockTypeId, mockContentValue);
        expect(setProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.STRING, mockContentValue, response);
    });

    test('set content property calls setProperty', () => {
        response.setPropertyContentValue(mockTypeId, mockContentValue);
        expect(setProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.CONTENT, mockContentValue, response);
    });

    test('set password property calls setProperty', () => {
        response.setPropertyPasswordValue(mockTypeId, mockContentValue);
        expect(setProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.PASSWORD, mockContentValue, response);
    });

    test('set number property calls setProperty', () => {
        response.setPropertyNumberValue(mockTypeId, mockContentValue);
        expect(setProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.NUMBER, mockContentValue, response);
    });

    test('set date time property calls setProperty', () => {
        response.setPropertyDateTimeValue(mockTypeId, mockContentValue);
        expect(setProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.DATETIME, mockContentValue, response);
    });

    test('set boolean property calls setProperty', () => {
        response.setPropertyBooleanValue(mockTypeId, mockContentValue);
        expect(setProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.BOOLEAN, mockContentValue, response);
    });

    test('set array property calls setProperty', () => {
        response.setPropertyArray(mockTypeId, mockContentValue);
        expect(setProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.LIST, mockContentValue, response);
    });

    test('set object property calls setProperty', () => {
        response.setPropertyObject(mockTypeId, mockContentValue);
        expect(setProperty).toHaveBeenCalledWith(mockTypeId, CONTENT_TYPES.OBJECT, mockContentValue, response);
    });
});
