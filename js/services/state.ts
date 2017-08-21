import * as $ from 'jquery';

import Collaboration from './collaboration';
import Model from './model';
import Settings from './settings';
import Utils from './utils';
import Validation from './validation';

declare var manywho: any;
declare var moment: any;

const loading = {};
const components = {};
const state = {};
const authenticationToken = {};
const sessionId = {};
const location = {};
const login = {};
const options = {};
const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default {

    refreshComponents: function(models, validate: boolean, flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        components[lookUpKey] = {};

        for (const id in models) {

            let selectedObjectData = null;

            // We need to do a little work on the object data as we only want the selected values in the state
            if (models[id].objectData && !Utils.isEmptyObjectData(models[id]))
                selectedObjectData = models[id].objectData.filter(item => item.isSelected);

            components[lookUpKey][id] = {
                contentValue: models[id].contentValue || null,
                objectData: selectedObjectData || null
            };

            if (validate)
                components[lookUpKey][id] = $.extend({}, components[lookUpKey][id], exports.default.isValid(id, flowKey));
        }
    },

    getLocation: function (flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return location[lookUpKey];
    },

    setLocation: function(flowKey) {
        if ('geolocation' in navigator
            && (Settings.global('trackLocation', flowKey, false) || Settings.global('location.isTrackingEnabled', flowKey, false))) {

            const lookUpKey = Utils.getLookUpKey(flowKey);

            navigator.geolocation.getCurrentPosition(position => {

                if (position != null && position.coords != null) {
                    location[lookUpKey] = {
                        latitude: Utils.getNumber(position.coords.latitude),
                        longitude: Utils.getNumber(position.coords.longitude),
                        accuracy: Utils.getNumber(position.coords.accuracy),
                        altitude: Utils.getNumber(position.coords.altitude),
                        altitudeAccuracy: Utils.getNumber(position.coords.altitudeAccuracy),
                        heading: Utils.getNumber(position.coords.heading),
                        speed: Utils.getNumber(position.coords.speed)
                    };

                    exports.default.setUserTime(flowKey);
                }
            }, null, { timeout: 60000 });
        }
    },

    setUserTime: function(flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        const now = moment();

        if (!Utils.isNullOrUndefined(Settings.global('i18n.timezoneOffset', flowKey)))
            now.utcOffset(Settings.global('i18n.timezoneOffset', flowKey));

        if (location[lookUpKey])
            location[lookUpKey].time = now.format();
        else
            location[lookUpKey] = { time: now.format() };
    },

    getComponent: function(id, flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return (components[lookUpKey] || {})[id];
    },

    getComponents: function(flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return components[lookUpKey];
    },

    setComponent: function(id, values, flowKey, push) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        components[lookUpKey][id] = Utils.extend(components[lookUpKey][id], values);

        if (values != null)
            components[lookUpKey][id].objectData = values.objectData;

        if (typeof values.isValid === 'undefined' && components[lookUpKey][id].isValid === false) {
            const model = Model.getComponent(id, flowKey);

            if (model.isRequired &&
                (!Utils.isNullOrEmpty(values.contentValue)  || (values.objectData && values.objectData.length > 0))) {

                components[lookUpKey][id].isValid = true;
                components[lookUpKey][id].validationMessage = null;
            }
        }

        if (push)
            Collaboration.push(id, values, flowKey);
    },

    setComponents: function (value, flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        components[lookUpKey] = value;
    },

    getPageComponentInputResponseRequests: function(flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        let pageComponentInputResponseRequests = null;

        if (components[lookUpKey] != null) {

            pageComponentInputResponseRequests = [];

            for (const id in components[lookUpKey]) {

                if (guidRegex.test(id))
                    pageComponentInputResponseRequests.push({
                        pageComponentId: id,
                        contentValue: components[lookUpKey][id].contentValue,
                        objectData: components[lookUpKey][id].objectData
                    });
            }
        }

        return pageComponentInputResponseRequests;
    },

    isAllValid: function(flowKey) {
        const components = Model.getComponents(flowKey);
        let isValid = true;

        if (components)
            for (const id in components) {
                const result = exports.default.isValid(id, flowKey);

                if (result.isValid === false) {
                    exports.default.setComponent(id, result, flowKey, true);
                    isValid = false;
                }
            }

        return isValid;
    },

    isValid: function(id, flowKey) {
        const model = Model.getComponent(id, flowKey);
        const state = exports.default.getComponent(id, flowKey);

        return Validation.validate(model, state, flowKey);
    },

    setState: function(id, token, mapElementId, flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        state[lookUpKey] = {
            id: id,
            token: token,
            currentMapElementId: mapElementId
        };
    },

    getState: function(flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return state[lookUpKey];
    },

    setOptions: function (flowOptions, flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        options[lookUpKey] = flowOptions;
    },

    getOptions: function (flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return options[lookUpKey];
    },

    setLogin: function (loginData, flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        login[lookUpKey] = loginData;
    },

    getLogin: function (flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return login[lookUpKey];
    },

    setAuthenticationToken: function (token, flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        authenticationToken[lookUpKey] = token;
    },

    getAuthenticationToken: function (flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return authenticationToken[lookUpKey];
    },

    getSessionData: function (flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return sessionId[lookUpKey];
    },

    setSessionData: function (sessionID, sessionUrl, flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        sessionId[lookUpKey] = {
            id: sessionID,
            url: sessionUrl
        };
    },

    setComponentLoading: function (componentId, data, flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        components[lookUpKey] = components[lookUpKey] || {};
        components[lookUpKey][componentId] = components[lookUpKey][componentId] || {};

        components[lookUpKey][componentId].loading = data;
    },

    setComponentError: function(componentId, error, flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        components[lookUpKey] = components[lookUpKey] || {};
        components[lookUpKey][componentId] = components[lookUpKey][componentId] || {};

        if (error !== null && typeof error === 'object') {
            components[lookUpKey][componentId].error = error;
            components[lookUpKey][componentId].error.id = componentId;
        }
        else if (typeof error === 'string')
            components[lookUpKey][componentId].error = {
                message: error,
                id: componentId
            };
        else if (!error)
            components[lookUpKey][componentId].error = null;
    },

    remove: function(flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        components[lookUpKey] == null;
        delete components[lookUpKey];
    }

};
