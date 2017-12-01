

import * as React from 'react';
import ReactDOM from 'react-dom';
import * as $ from 'jquery';

import * as Callbacks from './callbacks';
import * as Collaboration from './collaboration';
import * as Log from 'loglevel';
import * as Model from './model';
import * as Settings from './settings';
import * as Social from './social';
import * as State from './state';

function extendShallow (mergedObject, objects) {

    objects.forEach(object => {
        for (const key in object) {
            if (object.hasOwnProperty(key))
                mergedObject[key] = object[key];
        }
    });

    return mergedObject;
}

function extendDeep (mergedObject, object) {

    for (const key in object) {

        try {
            if (Array.isArray(object[key]))
                mergedObject[key] = extendArray(mergedObject[key] || [], object[key]);
            else if (object[key].constructor === Object)
                mergedObject[key] = extendDeep(mergedObject[key], object[key]);
            else if (object.hasOwnProperty(key))
                mergedObject[key] = object[key];
        }
        catch (e) {
            mergedObject[key] = object[key];
        }
    }

    return mergedObject;
}

function extendArray (mergedArray, array) {

    array.forEach(child => {
        mergedArray.push(child);
    });

    return mergedArray;
}

/**
 * Return `value` parsed as a number or zero
 */
export const getNumber = (value) => {
    let float = 0;

    if (value != null) {
        float = parseFloat(value);

        if (isNaN(float) || !isFinite(value))
            float = 0;
    }

    return float;
};

/**
 * Update the url in the browser to the join url
 */
export const replaceBrowserUrl = (response: any) => {
    // Check to make sure the browser supports the switch of the url
    if (history && history.replaceState) {
        const queryParameters = parseQueryString(window.location.search.substring(1));

        let newJoinUri = response.joinFlowUri;
        const ignoreParameters = ['tenant-id', 'flow-id', 'flow-version-id', 'navigation-element-id', 'join', 'initialization', 'authorization'];

        for (const queryParameter in queryParameters) {
            if (ignoreParameters.indexOf(queryParameter) === -1)
                newJoinUri += '&' + queryParameter + '=' + queryParameters[queryParameter];
        }

        try {
            history.replaceState(response.stateToken, 'Title', newJoinUri);
        }
        catch (ex) {
            Log.error(ex);
        }
    }
};

/**
 * Stolen from: http://www.joezimjs.com/javascript/3-ways-to-parse-a-query-string-in-a-url/
 */
export const parseQueryString = (queryString: string): any => {
    const params = {};
    let queries, temp, i, l;

    // Split into key/value pairs
    queries = queryString.split('&');

    // Convert the array of strings into an object
    for (i = 0, l = queries.length; i < l; i++) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }

    return params;
};

/**
 * @hidden
 */
export const extend = (mergedObject, objects, isDeep?: boolean) => {
    if (!mergedObject)
        return {};

    if (objects) {
        if (!Array.isArray(objects))
            objects = [objects];

        if (!isDeep)
            mergedObject = extendShallow(mergedObject, objects);
        else
            objects.forEach(object => {
                mergedObject = extendDeep(mergedObject, object);
            });
    }

    return mergedObject;
};

/**
 * @hidden
 */
export const extendObjectData = (mergedObjectData: Array<any>, objectData: Array<any>): Array<any>  => {
    if (objectData) {
        if (!mergedObjectData) {
            mergedObjectData = [];
            mergedObjectData.push(objectData[0]);
            return;
        }

        objectData.forEach(objectProperty => {

            if (mergedObjectData && mergedObjectData.length > 0) {

                mergedObjectData.forEach(property => {

                    if (isEqual(property.developerName, objectProperty.developerName, true))
                        if (objectProperty.contentValue != null)
                            extend(property, objectProperty, true);
                        else if (objectProperty.objectData != null)
                            property.objectData = objectProperty.objectData;
                });
            }
        });
    }

    return mergedObjectData;
};

/**
 * Check if a string is `null` or only contains whitespace
 */
export const isNullOrWhitespace = (value: string): boolean => {
    if (isNullOrUndefined(value))
        return true;

    return value.replace(/\s/g, '').length < 1;
};

/**
 * Check if a value is `null` or `undefined`
 */
export const isNullOrUndefined = (value: any): boolean => {
    return typeof value === 'undefined' || value === null;
};

/**
 * Check if a string is `null` or ""
 */
export const isNullOrEmpty = (value: string): boolean => {
    return isNullOrUndefined(value) || value === '';
};

/**
 * Check equality for two strings
 */
export const isEqual = (value1: string, value2: string, ignoreCase: boolean): boolean => {
    if (!value1 && !value2)
        return true;
    else if (value1 && value2) {
        if (ignoreCase)
            return value1.toLowerCase() === value2.toLowerCase();
        else
            return value1 === value2;
    }

    return false;
};

/**
 * Returns an array with an entry for each property value of the passed in object
 */
export const convertToArray = (obj): Array<any> => {
    let items = null;

    if (obj) {
        items = [];
        for (const prop in obj) {
            items.push(obj[prop]);
        }
    }

    return items;
};

/**
 * Check if an array contains item where the `key` property is equal to `id`
 */
export const contains = (collection: Array<any>, id: string, key: string) => {
    const selectedItem = collection.filter(item => item[key] === id);
    return (selectedItem && selectedItem.length > 0);
};

/**
 * Get an item from an array where the `key` property of the item is equal to `id`
 */
export const get = (collection: Array<any>, id: string, key: string) => {
    const selectedItem = collection.filter(item => item[key] === id);

    if (selectedItem && selectedItem.length > 0)
        return selectedItem[0];

    return null;
};

/**
 * @hidden
 */
export const getAll = (map: any, id: string, key: string) => {
    const items = [];

    for (const name in map) {
        if (map[name][key] === id)
            items.push(map[name]);
    }

    return items;
};

/**
 * Construct a new flow key
 */
export const getFlowKey = function (tenantId: string, flowId: string, flowVersionId: string, stateId: string, element: string) {
    const args = Array.prototype.slice.call(arguments);
    return args.join('_');
};

/**
 * Get a key in the format of `tenantid_stateid` derived from the `flowKey`
 */
export const getLookUpKey = (flowKey: string) => {
    if (flowKey)
        return [flowKey.split('_')[0], flowKey.split('_')[3]].join('_');
};

/**
 * Get the `element` from a flow key
 */
export const extractElement = (flowKey: string) => {
    return flowKey.split('_')[4];
};

/**
 * Get the `tenant id` from a flow key
 */
export const extractTenantId = (flowKey: string) => {
    return flowKey.split('_')[0];
};

/**
 * Get the `flow id` from a flow key
 */
export const extractFlowId = (flowKey: string) => {
    return flowKey.split('_')[1];
};

/**
 * Get the `flow version id` from a flow key
 */
export const extractFlowVersionId = (flowKey: string) => {
    return flowKey.split('_')[2];
};

/**
 * Get the `state id` from a flow key
 */
export const extractStateId = (flowKey: string) => {
    return flowKey.split('_')[3];
};

/**
 * @hidden
 */
export const removeLoadingIndicator = (id: string) => {
    const element = document.getElementById(id);
    if (element)
        element.parentNode.removeChild(element);
};

/**
 * Check if the flow is running in an embedded scenario by checking if the `documentElement` has the `manywho` class applied
 */
export const isEmbedded = (): boolean => {
    return !document.documentElement.classList.contains('manywho');
};

/**
 * Returns true if the `clientWidth` is smaller than 768px
 */
export const isSmallScreen = (flowKey): boolean => {
    const lookUpKey = getLookUpKey(flowKey);
    return document.getElementById(lookUpKey).clientWidth < 768;
};

/**
 * Stolen from here: http://stackoverflow.com/questions/8817394/javascript-get-deep-value-from-object-by-passing-path-to-it-as-string
 */
export const getValueByPath = (obj: any, path: string): any => {
    if (!path || path === '')
        return obj;

    try {
        let parts = path.split('.');

        for (let i = 0; i < parts.length; i++) {
            let foundKey = null;

            for (let key in obj) {
                if (key.toLowerCase() === parts[i].toLowerCase())
                    foundKey = key;
            }

            if (foundKey)
                obj = obj[foundKey];
            else
                obj = undefined;
        }
        return obj;
    }
    catch (ex) {
        return undefined;
    }
};

/**
 * Unmount the flow from the DOM then remove the containing element
 */
export const removeFlowFromDOM = (flowKey) => {
    const lookUpKey = getLookUpKey(flowKey);
    const rootElement = document.querySelector(Settings.global('containerSelector', flowKey, '#manywho'));

    for (let i = 0, len = rootElement.children.length; i < len; i++) {

        if (rootElement.children[i].id === lookUpKey) {
            ReactDOM.unmountComponentAtNode(rootElement.children[i]);
            rootElement.removeChild(rootElement.children[i]);
        }
    }
};

/**
 * Returns the property where its `developerName` is equal to the `propertyName` argument
 */
export const getObjectDataProperty = (properties: Array<any>, propertyName: string): any => {
    return properties.find(property => isEqual(property.developerName, propertyName, true));
};

/**
 * Set the `contentValue` of a property that matches the `propertyName`
 */
export const setObjectDataProperty = (properties: Array<any>, propertyName: string, value: string | number | boolean) => {
    const property = properties.find(property => isEqual(property.developerName, propertyName, true));
    if (property)
        property.contentValue = value;
};

/**
 * Check if the models objectdata is empty
 */
export const isEmptyObjectData = (model): boolean => {
    if (model.objectDataRequest && model.objectData && model.objectData.length === 1)
        return isPlaceholderObjectData(model.objectData);
    else if (model.objectData)
        return false;

    return true;
};

/**
 * Returns true if the objectdata is a single item and all of its properties content values are null or whitespace
 */
export const isPlaceholderObjectData = (objectData: Array<any>): boolean => {
    if (objectData.length === 1) {
        for (const prop in objectData[0].properties) {
            if (!isNullOrWhitespace(objectData[0].properties[prop].contentValue))
                return false;
        }
        return true;
    }

    return false;
};

/**
 * Stolen from: https://github.com/johndugan/javascript-debounce/blob/master/debounce.js
 */
export const debounce = (func: Function, wait: number, immediate: boolean) => {
    let timeout;
    return function() {
        const context = this,
            args = arguments;
        const later = function() {
            timeout = null;
            if ( !immediate ) {
                func.apply(context, args);
            }
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait || 200);
        if ( callNow ) {
            func.apply(context, args);
        }
    };
};

/**
 * Remove all traces of the flow from the model, settings, state, social, callbacks and DOM. Then inform collaboration the user has left.
 */
export const removeFlow = (flowKey: string) => {
    Model.deleteFlowModel(flowKey);
    removeFlowFromDOM(flowKey);
    Settings.remove(flowKey);
    State.remove(flowKey);
    Social.remove(flowKey);
    Callbacks.remove(flowKey);

    if (Settings.flow('collaboration.isEnabled', flowKey)) {
        Collaboration.leave('Another user', flowKey);
        Collaboration.remove(flowKey);
    }
};

/**
 * Stolen from: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 */
export const guid = (): string => {
    let now = new Date().getTime();

    if (typeof performance !== 'undefined' && typeof performance.now === 'function')
        now += performance.now();

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (now + Math.random() * 16) % 16 | 0;
        now = Math.floor(now / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
};

/**
 * Stolen from: https://github.com/soundcloud/jquery-whenall
 */
export const whenAll = (deferreds: Array<JQueryDeferred<any>>): JQueryDeferred<any> => {
    if (deferreds && deferreds.length) {
        let deferred = $.Deferred(),
            toResolve = deferreds.length,
            someFailed = false,
            fail,
            always;
        always = function () {
            if (!--toResolve) {
                deferred[someFailed ? 'reject' : 'resolve']();
            }
        };
        fail = function () {
            someFailed = true;
        };
        deferreds.forEach(function (d) {
            d.fail(fail).always(always);
        });
        return deferred;
    } else {
        return $.Deferred().resolve();
    }
};
