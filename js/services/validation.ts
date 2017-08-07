/// <reference path="../../typings/index.d.ts" />

import Component from './component';
import Settings from './settings';
import Utils from './utils';

declare var manywho: any;

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

const getResponse = function(message: string, messageKey: string, flowKey: string) {
    return { isValid: false, validationMessage: message || Settings.global(messageKey, flowKey) };
};

const getRequiredResponse = function(message: string, flowKey: string) {
    return getResponse(message, 'localization.validation.required', flowKey);
};

const getInvalidResponse = function(message: string, flowKey: string) {
    return getResponse(message, 'localization.validation.invalid', flowKey);
};

const validateRegex = function(value: string, regex: string) {
    if (!Utils.isNullOrWhitespace(regex)) {
        const validationRegex = new RegExp(regex);
        return validationRegex.test(value);
    }

    return true;
};

export default {
    validate(model: any, state: any, flowKey: string) {
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
                return exports.validateString(value, regex, message, model.isRequired, flowKey);

            case Component.contentTypes.number:
                return exports.validateNumber(value, regex, message, model.isRequired, flowKey);

            case Component.contentTypes.boolean:
                return exports.validateBoolean(value, message, model.isRequired, flowKey);

            case Component.contentTypes.object:
                return exports.validateObject(value, message, model.isRequired, flowKey);

            case Component.contentTypes.list:
                return exports.validateList(value, message, model.isRequired, flowKey);

            default:
                return { isValid: true, validationMessage: null };
        }
    },

    validateString(value: string, regex: string, message: string, isRequired: boolean, flowKey: string) {
        if (isRequired && isNull(value, Component.contentTypes.string))
            return getRequiredResponse(message, flowKey);

        if (!validateRegex(value, regex))
            return getInvalidResponse(message, flowKey);

        return { isValid: true, validationMessage: null };
    },

    validateNumber(value: any, regex: string, message: string, isRequired: boolean, flowKey: string) {
        if (isRequired && isNull(value, Component.contentTypes.number))
            return getRequiredResponse(message, flowKey);

        if (isNaN(value) && !Utils.isNullOrWhitespace(value))
            return getInvalidResponse(message, flowKey);

        if (!validateRegex(value.toString(), regex))
            return getInvalidResponse(message, flowKey);

        return { isValid: true, validationMessage: true };
    },

    validateBoolean(value: boolean, message: string, isRequired: boolean, flowKey: string) {
        if (isRequired && isNull(value, Component.contentTypes.boolean))
            return getRequiredResponse(message, flowKey);

        return { isValid: true, validationMessage: true };
    },

    validateObject(value: object, message: string, isRequired: boolean, flowKey: string) {
        if (isRequired && isNull(value, Component.contentTypes.object))
            return getRequiredResponse(message, flowKey);

        return { isValid: true, validationMessage: true };
    },

    validateList(value: Array<object>, message: string, isRequired: boolean, flowKey: string) {
        if (isRequired && isNull(value, Component.contentTypes.list))
            return getRequiredResponse(message, flowKey);

        return { isValid: true, validationMessage: true };
    }

};
