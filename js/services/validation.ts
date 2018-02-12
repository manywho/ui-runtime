import * as Component from './component';
import * as Model from './model';
import * as Settings from './settings';
import * as Utils from './utils';

const isValueDefined = function (value: any, contentType: string) {
    switch (contentType) {
    case Component.contentTypes.object:
    case Component.contentTypes.list:
        return value == null || value.length === 0 || value.filter(item => item.isSelected).length === 0;

    case Component.contentTypes.boolean:
        if (typeof value === 'string') {
            if (Utils.isEqual(value, 'true', true))
                return false;
            
            if (Utils.isEqual(value, 'false', true))
                return true;
        }
        else
                return !value;

    default:
        return Utils.isNullOrEmpty(value);
    }
};

const getResponse = function (message: string, messageKey: string, flowKey: string): IValidationResult {
    return { isValid: false, validationMessage: message || Settings.global(messageKey, flowKey) };
};

const getRequiredResponse = function (message: string, flowKey: string): IValidationResult {
    return getResponse(message, 'localization.validation.required', flowKey);
};

const getInvalidResponse = function (message: string, flowKey: string): IValidationResult {
    return getResponse(message, 'localization.validation.invalid', flowKey);
};

const validateRegex = function (value: string, regex: string) {
    if (!Utils.isNullOrWhitespace(regex)) {
        const validationRegex = new RegExp(regex);
        return validationRegex.test(Utils.isNullOrUndefined(value) ? '' : value);
    }

    return true;
};

export interface IValidationResult {
    isValid: boolean;
    validationMessage: string;
}

/**
 * Check if the `validation.when` setting contains the `when` parameter, thus validation should be performed
 * @param invokeType When to validate: INITIALIZE, JOIN, MOVE, SYNC
 * @param flowKey
 */
export const shouldValidate = (invokeType: string, flowKey: string) => {
    return Settings.global('validation.when', flowKey).indexOf(invokeType.toLowerCase()) !== -1;
};

/**
 * Validate the ContentValue or ObjectData for a given models local state. Custom regex validation will be 
 * taken from the models `validation` attribute, and a custom message from the `validationMessage` attribute
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
 * Validate a string against a regex and / or null check if required
 * @param value The string to validate
 * @param regex Regex to validate the string with.
 * @param message Custom validation message to be returned in an invalid response
 * @param isRequired Set to true to return an invalid response if the the value is null or empty
 * @param flowKey
 */
export const validateString = (value: string, regex: string | null, message: string, isRequired: boolean, flowKey: string): IValidationResult => {
    if (isRequired && isValueDefined(value, Component.contentTypes.string))
        return getRequiredResponse(message, flowKey);

    if (!validateRegex(value, regex))
        return getInvalidResponse(message, flowKey);

    return { isValid: true, validationMessage: null };
};

/**
 * Validate a number against a regex and / or null check if required
 * @param value The number to validate
 * @param regex Regex to validate the number with. `toString()` will be called on the number first
 * @param message Custom validation message to be returned in an invalid response
 * @param isRequired Set to true to return an invalid response if the the value is null or empty
 * @param flowKey
 */
export const validateNumber = (value: any, regex: string, message: string, isRequired: boolean, flowKey: string): IValidationResult => {
    if (isRequired && isValueDefined(value, Component.contentTypes.number))
        return getRequiredResponse(message, flowKey);

    if (isNaN(value) && !Utils.isNullOrWhitespace(value))
        return getInvalidResponse(message, flowKey);

    if (!validateRegex(Utils.isNullOrUndefined(value) ?  '' : value.toString(), regex))
        return getInvalidResponse(message, flowKey);

    return { isValid: true, validationMessage: null };
};

/**
 * Validate a boolean
 * @param value The boolean to validate
 * @param message Custom validation message to be returned in an invalid response
 * @param isRequired Set to true to return an invalid response if the the value false
 * @param flowKey
 */
export const validateBoolean = (value: boolean, message: string, isRequired: boolean, flowKey: string): IValidationResult => {
    if (isRequired && isValueDefined(value, Component.contentTypes.boolean))
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
    if (isRequired && isValueDefined(value, Component.contentTypes.object))
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
export const validateList = (value: object[], message: string, isRequired: boolean, flowKey: string): IValidationResult => {
    if (isRequired && isValueDefined(value, Component.contentTypes.list))
        return getRequiredResponse(message, flowKey);

    return { isValid: true, validationMessage: null };
};

/**
 * Scroll to the first invalid element based on the selector in the `validation.scroll.selector` setting. Defaults to `.has-error`
 * @param flowKey
 */
export const scrollToInvalidElement = (flowKey: string): void => {
    if (Settings.global('validation.scroll.isEnabled', flowKey, false)) {
        const invalidElement = document.querySelector(Settings.global('validation.scroll.selector', flowKey, '.has-error'));

        if (invalidElement)
            invalidElement.scrollIntoView();
    }
};

/**
 * Add an invalid notification populated with the message from the `localization.validation.notification` setting
 * @param flowKey
 */
export const addNotification = (flowKey: string): void => {
    if (Settings.global('validation.notification.isEnabled', flowKey, false))
        Model.addNotification(flowKey, {
            message: Settings.global('localization.validation.notification', flowKey),
            position: 'center',
            type: 'danger',
            timeout: '0',
            dismissible: true,
        });
};
