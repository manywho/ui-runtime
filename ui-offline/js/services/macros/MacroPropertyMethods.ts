import { CONTENT_TYPES } from '../../constants';
import { getProperty, setProperty, toEngineUTCStringFormat } from './MacroUtils';

/**
 * @param typeElementPropertyId
 * @description returns the type element properties content value
 */
function getPropertyValue(typeElementPropertyId: string) {
    return getProperty(
        typeElementPropertyId,
        [CONTENT_TYPES.STRING, CONTENT_TYPES.CONTENT, CONTENT_TYPES.PASSWORD, CONTENT_TYPES.BOOLEAN, CONTENT_TYPES.NUMBER, CONTENT_TYPES.DATETIME],
        this,
    );

}

/**
 * @param typeElementPropertyId
 * @description returns the type element properties content value
 * for a property of content type - string
 */
function getPropertyStringValue(typeElementPropertyId: string) {
    return getProperty(typeElementPropertyId, [CONTENT_TYPES.STRING], this);
}

/**
 * @param typeElementPropertyId
 * @description returns the type element properties content value
 * for a property of content type - content
 */
function getPropertyContentValue(typeElementPropertyId: string) {
    return getProperty(typeElementPropertyId, [CONTENT_TYPES.CONTENT], this);
}

/**
 * @param typeElementPropertyId
 * @description returns the type element properties content value
 * for a property of content type - password
 */
function getPropertyPasswordValue(typeElementPropertyId: string) {
    return getProperty(typeElementPropertyId, [CONTENT_TYPES.PASSWORD], this);
}

/**
 * @param typeElementPropertyId
 * @description returns the type element properties content value
 * for a property of content type - number
 */
function getPropertyNumberValue(typeElementPropertyId: string) {
    return getProperty(typeElementPropertyId, [CONTENT_TYPES.NUMBER], this);
}

/**
 * @param typeElementPropertyId
 * @description returns the type element properties content value
 * for a property of content type - datetime
 */
function getPropertyDateTimeValue(typeElementPropertyId: string) {
    return getProperty(typeElementPropertyId, [CONTENT_TYPES.DATETIME], this);
}

/**
 * @param typeElementPropertyId
 * @description returns the type element properties content value
 * for a property of content type - boolean
 */
function getPropertyBooleanValue(typeElementPropertyId: string) {
    return getProperty(typeElementPropertyId, [CONTENT_TYPES.BOOLEAN], this);
}

/**
 * @param typeElementPropertyId
 * @description returns the type element properties object data
 * for a property of content type - list
 */
function getPropertyArray(typeElementPropertyId: string) {
    return getProperty(typeElementPropertyId, [CONTENT_TYPES.LIST], this);
}

/**
 * @param typeElementPropertyId
 * @description returns the type element properties object data
 * for a property of content type - object
 */
function getPropertyObject(typeElementPropertyId: string) {
    return getProperty(typeElementPropertyId, [CONTENT_TYPES.OBJECT], this);
}

/**
 * @param typeElementPropertyId
 * @param contentValue the new content value for the type property
 * @description sets the type element properties content value
 * for a property of content type - string, to the passed in value
 */
function setPropertyValue(typeElementPropertyId: string, contentValue: string) {
    setProperty(
        typeElementPropertyId,
        [CONTENT_TYPES.STRING, CONTENT_TYPES.CONTENT, CONTENT_TYPES.PASSWORD, CONTENT_TYPES.BOOLEAN, CONTENT_TYPES.NUMBER, CONTENT_TYPES.DATETIME],
        contentValue,
        this,
    );
}

/**
 * @param typeElementPropertyId
 * @param contentValue the new content value for the type property
 * @description sets the type element properties content value
 * for a property of content type - string, to the passed in value
 */
function setPropertyStringValue(typeElementPropertyId: string, contentValue: string) {
    setProperty(typeElementPropertyId, [CONTENT_TYPES.STRING], contentValue, this);
}

/**
 * @param typeElementPropertyId
 * @param contentValue the new content value for the type property
 * @description sets the type element properties content value
 * for a property of content type - content, to the passed in value
 */
function setPropertyContentValue(typeElementPropertyId: string, contentValue: string) {
    setProperty(typeElementPropertyId, [CONTENT_TYPES.CONTENT], contentValue, this);
}

/**
 * @param typeElementPropertyId
 * @param contentValue the new content value for the type property
 * @description sets the type element properties content value
 * for a property of content type - password, to the passed in value
 */
function setPropertyPasswordValue(typeElementPropertyId: string, contentValue: string) {
    setProperty(typeElementPropertyId, [CONTENT_TYPES.PASSWORD], contentValue, this);
}

/**
 * @param typeElementPropertyId
 * @param contentValue the new content value for the type property
 * @description sets the type element properties content value
 * for a property of content type - number, to the passed in value
 */
function setPropertyNumberValue(typeElementPropertyId: string, contentValue: string | number) {
    setProperty(typeElementPropertyId, [CONTENT_TYPES.NUMBER], contentValue, this);
}

/**
 * @param typeElementPropertyId
 * @param contentValue the new content value for the type property
 * @description sets the type element properties content value
 * for a property of content type - datetime, to the passed in value converted to UTC datetime
 */
function setPropertyDateTimeValue(typeElementPropertyId: string, contentValue) {
    setProperty(typeElementPropertyId, [CONTENT_TYPES.DATETIME], toEngineUTCStringFormat(contentValue), this);
}

/**
 * @param typeElementPropertyId
 * @param contentValue the new content value for the type property
 * @description sets the type element properties content value
 * for a property of content type - boolean, to the passed in value
 */
function setPropertyBooleanValue(typeElementPropertyId: string, contentValue: string | boolean) {
    setProperty(typeElementPropertyId, [CONTENT_TYPES.BOOLEAN], contentValue, this);
}

/**
 * @param typeElementPropertyId
 * @param objectData the new object data for the type property
 * @description sets the type element properties content value
 * for a property of content type - list, to the passed in value
 */
function setPropertyArray(typeElementPropertyId: string, objectData: any) {
    setProperty(typeElementPropertyId, [CONTENT_TYPES.LIST], objectData, this);
}

/**
 * @param typeElementPropertyId
 * @param objectData the new object data for the type property
 * @description sets the type element properties content value
 * for a property of content type - object, to the passed in value
 */
function setPropertyObject(typeElementPropertyId: string, objectData: any) {
    setProperty(typeElementPropertyId, [CONTENT_TYPES.OBJECT], objectData, this);
}

export default {
    getPropertyValue,
    getPropertyStringValue,
    getPropertyContentValue,
    getPropertyPasswordValue,
    getPropertyNumberValue,
    getPropertyDateTimeValue,
    getPropertyBooleanValue,
    getPropertyArray,
    getPropertyObject,
    setPropertyValue,
    setPropertyStringValue,
    setPropertyContentValue,
    setPropertyPasswordValue,
    setPropertyNumberValue,
    setPropertyDateTimeValue,
    setPropertyBooleanValue,
    setPropertyArray,
    setPropertyObject,
};
