import * as Component from './component';
import * as Settings from './settings';
import Utils from './utils';

const isNull = function(value: any, contentType: string) {
    switch (contentType) {
        case Component.contentTypes.object:
            return value !== null;

        case Component.contentTypes.list:
            return value.length > 0;

        case Component.contentTypes.boolean:
            if (typeof value === 'string') {
                if (Utils.isEqual(value, 'true', true))
                    return false;
                else if (Utils.isEqual(value, 'false', true))
                    return true;
            }
            else
                return !value;

            break;

        default:
            return Utils.isNullOrEmpty(value);
    }
};

const getResponse = function(message: string, messageKey: string, flowKey: string): IValidationResult {
    return { isValid: false, validationMessage: message || Settings.global(messageKey, flowKey) };
};

const getRequiredResponse = function(message: string, flowKey: string): IValidationResult {
    return getResponse(message, 'localization.validation.required', flowKey);
};

const getInvalidResponse = function(message: string, flowKey: string): IValidationResult {
    return getResponse(message, 'localization.validation.invalid', flowKey);
};

const validateRegex = function(value: string, regex: string) {
    if (!Utils.isNullOrWhitespace(regex)) {
        const validationRegex = new RegExp(regex);
        return validationRegex.test(value);
    }

    return true;
};

export interface IValidationResult {
    isValid: boolean,
    validationMessage: string
}

/**
 * Validate the ContentValue or ObjectData for a given models local state. Custom regex validation will be taken from the models `validation` attribute, and a custom message
 * from the `validationMessage` attribute
 * @param model The model that will be validated
 * @param state The matching local state for the model that will be validated
 * @param flowKey
 */
export const validate = (model: any, state: any, flowKey: string): IValidationResult => {
    if (!Settings.global('validation.isenabled', flowKey, false))
        return { isValid: true, validationMessage: null };

    if (model.isValid === false)
        return { isValid: false, validationMessage: Settings.global('localization.validation.required', flowKey) };

    let regex = null;
    let message = null;

    if (model.attributes) {
        regex = model.attributes.validation ? model.attributes.validation : null;
        message = model.attributes.validationMessage ? model.attributes.validationMessage : null;
    }

    let value = null;

    if (Utils.isEqual(model.contentType, Component.contentTypes.object, true)
        || Utils.isEqual(model.contentType, Component.contentTypes.list, true))
        value = state && state.objectData !== undefined ? state.objectData : model.objectData;
    else
        value = state && state.contentValue !== undefined ? state.contentValue : model.contentValue;

    switch (model.contentType.toUpperCase()) {
        case Component.contentTypes.string:
        case Component.contentTypes.password:
        case Component.contentTypes.content:
        case Component.contentTypes.datetime:
            return validateString(value, regex, message, model.isRequired, flowKey);

        case Component.contentTypes.number:
            return validateNumber(value, regex, message, model.isRequired, flowKey);

        case Component.contentTypes.boolean:
            return validateBoolean(value, message, model.isRequired, flowKey);

        case Component.contentTypes.object:
            return validateObject(value, message, model.isRequired, flowKey);

        case Component.contentTypes.list:
            return validateList(value, message, model.isRequired, flowKey);
    }
};

/**
 *
 * @param value The string to validate
 * @param regex Regex to validate the string with.
 * @param message Custom validation message to be returned in an invalid response
 * @param isRequired Set to true to return an invalid response if the the value is null or empty
 * @param flowKey
 */
export const validateString = (value: string, regex: string | null, message: string, isRequired: boolean, flowKey: string): IValidationResult => {
    if (isRequired && isNull(value, Component.contentTypes.string))
        return getRequiredResponse(message, flowKey);

    if (!validateRegex(value, regex))
        return getInvalidResponse(message, flowKey);

    return { isValid: true, validationMessage: null };
};

/**
 *
 * @param value The number to validate
 * @param regex Regex to validate the number with. `toString()` will be called on the number first
 * @param message Custom validation message to be returned in an invalid response
 * @param isRequired Set to true to return an invalid response if the the value is null or empty
 * @param flowKey
 */
export const validateNumber = (value: any, regex: string, message: string, isRequired: boolean, flowKey: string): IValidationResult => {
    if (isRequired && isNull(value, Component.contentTypes.number))
        return getRequiredResponse(message, flowKey);

    if (isNaN(value) && !Utils.isNullOrWhitespace(value))
        return getInvalidResponse(message, flowKey);

    if (!validateRegex(value.toString(), regex))
        return getInvalidResponse(message, flowKey);

    return { isValid: true, validationMessage: null };
};

/**
 *
 * @param value The boolean to validate
 * @param message Custom validation message to be returned in an invalid response
 * @param isRequired Set to true to return an invalid response if the the value false
 * @param flowKey
 */
export const validateBoolean = (value: boolean, message: string, isRequired: boolean, flowKey: string): IValidationResult => {
    if (isRequired && isNull(value, Component.contentTypes.boolean))
        return getRequiredResponse(message, flowKey);

    return { isValid: true, validationMessage: null };
};

/**
 * Only isRequired validation is currently supported for objects
 * @param value The object to validate
 * @param message Custom validation message to be returned in an invalid response
 * @param isRequired Set to true to return an invalid response if the the value is null or empty
 * @param flowKey
 */
export const validateObject = (value: object, message: string, isRequired: boolean, flowKey: string): IValidationResult => {
    if (isRequired && isNull(value, Component.contentTypes.object))
        return getRequiredResponse(message, flowKey);

    return { isValid: true, validationMessage: null };
};

/**
 * Only isRequired validation is currently supported for lists
 * @param value The array to validate
 * @param message Custom validation message to be returned in an invalid response
 * @param isRequired Set to true to return an invalid response if the the value is null or empty
 * @param flowKey
 */
export const validateList = (value: Array<object>, message: string, isRequired: boolean, flowKey: string): IValidationResult => {
    if (isRequired && isNull(value, Component.contentTypes.list))
        return getRequiredResponse(message, flowKey);

    return { isValid: true, validationMessage: null };
};
