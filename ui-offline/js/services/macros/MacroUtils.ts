import { CONTENT_TYPES } from '../../constants';
import { clone } from '../Utils';
import { getMacroState, setMacroState } from './MacroState';

/**
 * @param typeElementPropertyId
 * @param contentType
 * @param value the value from which the object data property is to be extracted from
 * @description extracting a specific properties content value from some objectdata
 */
export const getProperty = (typeElementPropertyId, contentType, objectData) => {
    if (objectData) {
        if (objectData.properties || objectData.properties !== null) {
            const specifiedProperty = objectData.properties.find((property) => property.typeElementPropertyId === typeElementPropertyId);
            if (specifiedProperty.contentType !== contentType) {
                throw new Error(`${specifiedProperty.developerName} does not have a content type of ${contentType}`);
            }
            if (contentType === CONTENT_TYPES.LIST || contentType === CONTENT_TYPES.OBJECT) {
                return specifiedProperty.objectData;
            }
            return specifiedProperty.contentValue;
        }
        throw new Error(`${objectData.developerName} has no object data properties`);
    }

    return null;
};

/**
 * @param typeElementPropertyId
 * @param contentType
 * @param newValue the new value to set to the objects property
 * @param value the value metadata that is to be modified
 * @description setting a specific properties content value from some objectdata
 */
export const setProperty = (typeElementPropertyId, contentType, newValue, objectData) => {
    if (objectData) {
        if (objectData.properties || objectData.properties !== null) {
            const specifiedProperty = objectData.properties.find((property) => property.typeElementPropertyId === typeElementPropertyId);
            if (specifiedProperty.contentType !== contentType) {
                throw new Error(`${specifiedProperty.developerName} does not have a content type of ${contentType}`);
            }

            // This is to account for setPropertyObject and setPropertyArray
            // both of which I am unsure as to how they work
            if (contentType === CONTENT_TYPES.LIST || contentType === CONTENT_TYPES.OBJECT) {
                specifiedProperty.objectData = newValue;
            } else {
                specifiedProperty.contentValue = newValue;
            }

        } else {
            throw new Error(`${objectData.developerName} has no object data properties`);
        }
    }
};

/**
 * @param name the value name
 * @param metadata the flow snapshot
 * @description returns a specific values properties and ID
 */
export const getValueByName = (name: string, metadata: any) => {
    const MacroState = getMacroState();
    const value = metadata.valueElements.find((element) => element.developerName === name);

    if (!value) {
        throw new Error(`A value with name: ${name}, cannot be found in the flow snapshot`);
    }

    // If the values content value has already been modified
    // whilst offline then we want to return this instaed of the default
    // content value found in the metadata object
    if (MacroState.values[value.id]) {
        return { props: MacroState.values[value.id], id: value.id };
    }

    throw new Error(`A value with name: ${name}, has not been set in state`);
};

/**
 * @param typeId
 * @param metadata
 * @description return object data based on type properties
 */
export const generateNewObjectData = (typeId: string, metadata: any) => {
    const typeElement = clone(metadata.typeElements.find((type) => type.id === typeId));

    typeElement.properties = typeElement.properties.map((property) => {
        property.typeElementPropertyId = property.id;
        delete property.id;
        return property;
    });

    return typeElement;
};

/**
 * @param id the value id
 * @param value the modifed contentValue/object data for the value
 */
export const setStateValue = (id: string, value: any) => {
    const MacroState = getMacroState();
    const clonedMacroState: any = MacroState;
    if (clonedMacroState.values) {
        clonedMacroState.values[id] = value;
        setMacroState(clonedMacroState);
    }
};

/**
 * @param dateValue a date time object
 * @description returns a UTC formatted datetime with timezone offset
 */
export const toEngineUTCStringFormat = (dateValue: Date) => {
    // Partially stolen from https://stackoverflow.com/questions/17415579/how-to-iso-8601-format-a-date-with-timezone-offset-in-javascript
    const pad = (num) => {
        const norm = Math.floor(Math.abs(num));
        return (norm < 10 ? '0' : '') + String(norm);
    };
    return `${dateValue.getUTCFullYear()}\
        -${pad(dateValue.getUTCMonth() + 1)}\
        -${pad(dateValue.getUTCDate())}\
        T${pad(dateValue.getUTCHours())}\
        :${pad(dateValue.getUTCMinutes())}\
        :${pad(dateValue.getUTCSeconds())}\
        :${pad(dateValue.getUTCMilliseconds())}\
        0000\
        +00:00`;
};
