/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.validation = (function (manywho) {

    const isNull = function(value: any, contentType: string) {
        switch (contentType) {
            case manywho.component.contentTypes.object:
                return value !== null;

            case manywho.component.contentTypes.list:
                return value.length > 0;

            case manywho.component.contentTypes.boolean:
                return value;

            default:
                return manywho.utils.isNullOrEmpty(value);
        }
    };

    const getResponse = function(message: string, messageKey: string, flowKey: string) {
        return { isValid: false, validationMessage: message || manywho.settings.global(messageKey, flowKey) };
    };

    const getRequiredResponse = function(message: string, flowKey: string) {
        return getResponse(message, 'localization.validation.required', flowKey);
    };

    const getInvalidResponse = function(message: string, flowKey: string) {
        return getResponse(message, 'localization.validation.invalid', flowKey);
    };

    const validateRegex = function(value: string, regex: string) {
        if (!manywho.utils.isNullOrWhitespace(regex)) {
            const validationRegex = new RegExp(regex);
            return validationRegex.test(value);
        }

        return true;
    };

    return {
        validate(model: any, state: any, flowKey: string) {
            if (!manywho.settings.global('validation.isenabled', flowKey, false))
                return {};

            if (model.isValid === false)
                return { isValid: false, validationMessage: manywho.settings.global('localization.validation.required', flowKey) };

            let regex = null;
            let message = null;

            if (model.attributes) {
                regex = model.attributes.validation ? model.attributes.validation : null;
                message = model.attributes.validationMessage ? model.attributes.validationMessage : null;
            }

            let value = null;

            if (manywho.utils.isEqual(model.contentType, manywho.component.contentTypes.object, true)
                || manywho.utils.isEqual(model.contentType, manywho.component.contentTypes.list, true))
                value = state && state.objectData !== undefined ? state.objectData : model.objectData;
            else
                value = state && state.contentValue !== undefined ? state.contentValue : model.contentValue;

            switch (model.contentType.toUpperCase()) {
                case manywho.component.contentTypes.string:
                case manywho.component.contentTypes.password:
                case manywho.component.contentTypes.content:
                case manywho.component.contentTypes.datetime:
                    return manywho.validation.validateString(value, regex, message, model.isRequired, flowKey);

                case manywho.component.contentTypes.number:
                    return manywho.validation.validateNumber(value, regex, message, model.isRequired, flowKey);

                case manywho.component.contentTypes.object:
                    return manywho.validation.validateObject(value, message, model.isRequired, flowKey);

                case manywho.component.contentTypes.list:
                    return manywho.validation.validateList(value, message, model.isRequired, flowKey);

                default:
                    return { isValid: true, validationMessage: null };
            }
        },

        validateString(value: string, regex: string, message: string, isRequired: boolean, flowKey: string) {
            if (isRequired && isNull(value, manywho.component.contentTypes.string))
                return getRequiredResponse(message, flowKey);

            if (!validateRegex(value, regex))
                return getInvalidResponse(message, flowKey);

            return { isValid: true, validationMessage: null };
        },

        validateNumber(value: any, regex: string, message: string, isRequired: boolean, flowKey: string) {
            if (isRequired && isNull(value, manywho.component.contentTypes.number))
                return getRequiredResponse(message, flowKey);

            if (isNaN(value) && !manywho.utils.isNullOrWhitespace(value))
                return getInvalidResponse(message, flowKey);

            if (!validateRegex(value.toString(), regex))
                return getInvalidResponse(message, flowKey);

            return { isValid: true, validationMessage: true };
        },

        validateBoolean(value: boolean, message: string, isRequired: boolean, flowKey: string) {
            if (isRequired && isNull(value, manywho.component.contentTypes.boolean))
                return getRequiredResponse(message, flowKey);

            return { isValid: true, validationMessage: true };
        },

        validateObject(value: object, message: string, isRequired: boolean, flowKey: string) {
            if (isRequired && isNull(value, manywho.component.contentTypes.object))
                return getRequiredResponse(message, flowKey);

            return { isValid: true, validationMessage: true };
        },

        validateList(value: Array<object>, message: string, isRequired: boolean, flowKey: string) {
            if (isRequired && isNull(value, manywho.component.contentTypes.list))
                return getRequiredResponse(message, flowKey);

            return { isValid: true, validationMessage: true };
        }

    };

})(manywho);
