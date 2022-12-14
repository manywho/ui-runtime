import * as moment from 'moment';

import * as Collaboration from './collaboration';
import * as Model from './model';
import * as Settings from './settings';
import * as Utils from './utils';
import * as Validation from './validation';

const components = {};
const state = {};
const authenticationToken = {};
const sessionId = {};
const location = {};
const login = {};
const options = {};
const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Reset the local state of each component defined in the models.
 */
export const refreshComponents = (models: any, flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);

    components[lookUpKey] = {};

    for (const id in models) {
        let selectedObjectData = null;

        // We need to do a little work on the object data as we only want the selected values in the state
        if (models[id].objectData && !Utils.isEmptyObjectData(models[id])) {
            selectedObjectData = models[id].objectData.filter((item) => item.isSelected);
        }

        components[lookUpKey][id] = {
            contentValue: models[id].contentValue || null,
            objectData: selectedObjectData || null,
        };
    }
};

/**
 * Return the users current location. Updated with `setLocation`
 */
export const getLocation = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return location[lookUpKey];
};

/**
 * Set the current location to the running users `navigator.geolocation` if the `location.isTrackingEnabled` setting is true
 */
export const setLocation = (flowKey: string) => {
    if (
        'geolocation' in navigator &&
        (Settings.global('trackLocation', flowKey, false) ||
            Settings.global('location.isTrackingEnabled', flowKey, false))
    ) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (position != null && position.coords != null) {
                    location[lookUpKey] = {
                        latitude: Utils.getNumber(position.coords.latitude),
                        longitude: Utils.getNumber(position.coords.longitude),
                        accuracy: Utils.getNumber(position.coords.accuracy),
                        altitude: Utils.getNumber(position.coords.altitude),
                        altitudeAccuracy: Utils.getNumber(position.coords.altitudeAccuracy),
                        heading: Utils.getNumber(position.coords.heading),
                        speed: Utils.getNumber(position.coords.speed),
                    };

                    setUserTime(flowKey);
                }
            },
            null,
            { timeout: 60000 },
        );
    }
};

/**
 * Set the `location.time` property specifically based on the running users time. Optionally override timezone using the `i18n.timezoneOffset` setting
 */
export const setUserTime = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    const now = moment();

    if (!Utils.isNullOrUndefined(Settings.global('i18n.timezoneOffset', flowKey))) {
        now.utcOffset(Settings.global('i18n.timezoneOffset', flowKey));
    }

    if (location[lookUpKey]) {
        location[lookUpKey].time = now.format();
    } else {
        location[lookUpKey] = { time: now.format() };
    }
};

/**
 * Get the state of a specific component
 * @param id Id of the component
 * @param flowKey
 */
export const getComponent = (id: string, flowKey: string): IComponentValue => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return (components[lookUpKey] || {})[id];
};

/**
 * Get the state of every component
 * @param flowKey
 */
export const getComponents = (flowKey: string): IComponentValue[] => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return components[lookUpKey];
};

export interface IComponentValue {
    objectData?: any[];
    contentValue?: string | number | boolean;
    loading?: {
        message: string;
    };
    error?: {
        message: string;
    };
    isValid?: boolean;
    validationMessage?: string;
}

/**
 * Update the state of a single component. If clientside validation is enabled the new state will be validated first
 * @param push Set to true to call `Collaboration.push` after updating the component
 */
export const setComponent = (
    id: string,
    value: IComponentValue,
    flowKey: string,
    push: boolean,
) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);

    components[lookUpKey][id] = Utils.extend(components[lookUpKey][id], value);

    components[lookUpKey][id] = Utils.extend(components[lookUpKey][id], isValid(id, flowKey));

    if (push) {
        Collaboration.push(id, value, flowKey);
    }
};

/**
 * Overwrite the existing state of every component
 * @param values The state of each component
 * @param flowKey
 */
export const setComponents = (values: any, flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    components[lookUpKey] = values;
};

export interface IPageComponentInputResponseRequest {
    pageComponentId: string;
    contentValue: string | number | boolean;
    objectData: any[];
}

/**
 * Transform the current components local state into an array of IPageComponentInputResponseRequest
 */
export const getPageComponentInputResponseRequests = (
    flowKey: string,
): IPageComponentInputResponseRequest[] => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    let pageComponentInputResponseRequests = null;

    if (components[lookUpKey] != null) {
        pageComponentInputResponseRequests = [];

        for (const id in components[lookUpKey]) {
            if (guidRegex.test(id)) {
                pageComponentInputResponseRequests.push({
                    pageComponentId: id,
                    contentValue: components[lookUpKey][id].contentValue,
                    objectData: components[lookUpKey][id].objectData,
                });
            }
        }
    }

    return pageComponentInputResponseRequests;
};

/**
 * Get the validation result for a components local state
 * @param id The component id
 */
export const isValid = (id: string, flowKey: string): Validation.IValidationResult => {
    const model = Model.getComponent(id, flowKey);
    const state = getComponent(id, flowKey);

    return Validation.validate(model, state, flowKey);
};

/**
 * Call `isValid` on every components local state. Returns true if every component is valid
 */
export const isAllValid = (flowKey: string): boolean => {
    const components = Model.getComponents(flowKey);
    let result = true;

    if (components) {
        for (const id in components) {
            const validationResult: Validation.IValidationResult = isValid(id, flowKey);

            if (!validationResult.isValid) {
                setComponent(id, validationResult as IComponentValue, flowKey, true);
                result = false;
            }
        }
    }

    return result;
};

/**
 * Update the id, token, and map element id of the current state
 * @param id The state id
 * @param mapElementId Id of the map element the state is currently on
 * @param flowKey
 */
export const setState = (id: string, token: string, mapElementId: string, flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);

    state[lookUpKey] = {
        id,
        token,
        currentMapElementId: mapElementId,
    };
};

/**
 * @ignore
 */
export const getState = (flowKey: string): any => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return state[lookUpKey];
};

/**
 * @ignore
 */
export const setOptions = (flowOptions: any, flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    options[lookUpKey] = flowOptions;
};

/**
 * @ignore
 */
export const getOptions = (flowKey: string): any => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return options[lookUpKey];
};

/**
 * @ignore
 */
export const setLogin = (loginData: any, flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    login[lookUpKey] = loginData;
};

/**
 * @ignore
 */
export const getLogin = (flowKey: string): any => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return login[lookUpKey];
};

/**
 * Update the active authentication token for the current user
 */
export const setAuthenticationToken = (token: string, flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    authenticationToken[lookUpKey] = token;
};

/**
 * Get the authentication token for the current user
 */
export const getAuthenticationToken = (flowKey: string): string => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return authenticationToken[lookUpKey];
};

/**
 * @ignore
 */
export const getSessionData = (flowKey: string): any => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return sessionId[lookUpKey];
};

/**
 * @ignore
 */
export const setSessionData = (id: string, url: string, flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    sessionId[lookUpKey] = { id, url };
};

/**
 * Set the `loading` property of the component's state to `data`
 * @param componentId
 * @param data
 * @param flowKey
 */
export const setComponentLoading = (componentId: string, data: any, flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);

    components[lookUpKey] = components[lookUpKey] || {};
    components[lookUpKey][componentId] = components[lookUpKey][componentId] || {};

    components[lookUpKey][componentId].loading = data;
};

/**
 * Set the `error` property on a component to an object with `message` and `id` properties.
 * If the `error` argument is a string it will populate the `message` property
 */
export const setComponentError = (componentId: string, error: any | string, flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);

    components[lookUpKey] = components[lookUpKey] || {};
    components[lookUpKey][componentId] = components[lookUpKey][componentId] || {};

    if (error !== null && typeof error === 'object') {
        components[lookUpKey][componentId].error = error;
        components[lookUpKey][componentId].error.id = componentId;
    } else if (typeof error === 'string') {
        components[lookUpKey][componentId].error = {
            message: error,
            id: componentId,
        };
    } else if (!error) {
        components[lookUpKey][componentId].error = null;
    }
};

/**
 * Remove the local state for this flow
 */
export const remove = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);

    components[lookUpKey] == null;
    delete components[lookUpKey];
};
