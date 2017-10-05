

import * as React from 'react';
import ReactDOM from 'react-dom';
import * as $ from 'jquery';

import * as Callbacks from './callbacks';
import * as Collaboration from './collaboration';
import * as Log from 'loglevel';
import Model from './model';
import * as Settings from './settings';
import Social from './social';
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

export default {

    getNumber: function(value) {
        let float = 0;

        if (value != null) {
            float = parseFloat(value);

            if (isNaN(float) || !isFinite(value))
                float = 0;
        }

        return float;
    },

    replaceBrowserUrl: function(response) {
        // Check to make sure the browser supports the switch of the url
        if (history && history.replaceState) {
            const queryParameters = exports.default.parseQueryString(window.location.search.substring(1));

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
    },

    // Stolen from: http://www.joezimjs.com/javascript/3-ways-to-parse-a-query-string-in-a-url/
    parseQueryString: function (queryString) {
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
    },

    extend: function (mergedObject, objects, isDeep?) {
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
    },

    extendObjectData: function (mergedObjectData, objectData) {

        if (objectData) {
            if (!mergedObjectData) {
                mergedObjectData = [];
                mergedObjectData.push(objectData[0]);
                return;
            }

            objectData.forEach(objectProperty => {

                if (mergedObjectData && mergedObjectData.length > 0) {

                    mergedObjectData.forEach(property => {

                        if (exports.default.isEqual(property.developerName, objectProperty.developerName, true))
                            if (objectProperty.contentValue != null)
                                exports.default.extend(property, objectProperty, true);
                            else if (objectProperty.objectData != null)
                                property.objectData = objectProperty.objectData;
                    });
                }
            });
        }

        return mergedObjectData;
    },

    isNullOrWhitespace: function (value) {
        if (exports.default.isNullOrUndefined(value))
            return true;

        return value.replace(/\s/g, '').length < 1;
    },

    isNullOrUndefined: function(value) {
        return typeof value === 'undefined' || value === null;
    },

    isNullOrEmpty: function(value) {
        return exports.default.isNullOrUndefined(value) || value === '';
    },

    isEqual: function (value1, value2, ignoreCase) {
        if (!value1 && !value2)
            return true;
        else if (value1 && value2) {
            if (ignoreCase)
                return value1.toLowerCase() === value2.toLowerCase();
            else
                return value1 === value2;
        }

        return false;
    },

    convertToArray: function(obj) {
        let items = null;

        if (obj) {
            items = [];
            for (const prop in obj) {
                items.push(obj[prop]);
            }
        }

        return items;
    },

    contains: function (collection, id, key) {
        const selectedItem = collection.filter(item => item[key] === id);
        return (selectedItem && selectedItem.length > 0);
    },

    get: function (collection, id, key) {
        const selectedItem = collection.filter(item => item[key] === id);

        if (selectedItem && selectedItem.length > 0)
            return selectedItem[0];

        return null;
    },

    getAll: function (map, id, key) {
        const items = [];

        for (const name in map) {
            if (map[name][key] === id)
                items.push(map[name]);
        }

        return items;
    },

    getFlowKey: function (tenantId, flowId, flowVersionId, stateId, element) {
        const args = Array.prototype.slice.call(arguments);
        return args.join('_');
    },

    getLookUpKey: function (flowKey) {
        if (flowKey)
            return [flowKey.split('_')[0], flowKey.split('_')[3]].join('_');
    },

    extractElement: function (flowKey) {
        return flowKey.split('_')[4];
    },

    extractTenantId: function (flowKey) {
        return flowKey.split('_')[0];
    },

    extractFlowId: function (flowKey) {
        return flowKey.split('_')[1];
    },

    extractFlowVersionId: function (flowKey) {
        return flowKey.split('_')[2];
    },

    extractStateId: function (flowKey) {
        return flowKey.split('_')[3];
    },

    removeLoadingIndicator: function(id) {
        const element = document.getElementById(id);
        if (element)
            element.parentNode.removeChild(element);
    },

    isEmbedded: function () {
        return !document.documentElement.classList.contains('manywho');
    },

    isSmallScreen: function (flowKey) {
        const lookUpKey = exports.default.getLookUpKey(flowKey);
        return document.getElementById(lookUpKey).clientWidth < 768;
    },

    // Stolen from here: http://stackoverflow.com/questions/8817394/javascript-get-deep-value-from-object-by-passing-path-to-it-as-string
    getValueByPath: function(obj, path) {
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
    },

    removeFlowFromDOM: function(flowKey) {
        const lookUpKey = exports.default.getLookUpKey(flowKey);
        const rootElement = document.querySelector(Settings.global('containerSelector', flowKey, '#manywho'));

        for (let i = 0, len = rootElement.children.length; i < len; i++) {

            if (rootElement.children[i].id === lookUpKey) {
                ReactDOM.unmountComponentAtNode(rootElement.children[i]);
                rootElement.removeChild(rootElement.children[i]);
            }
        }
    },

    getObjectDataProperty: function (properties, propertyName) {
        return properties.find(property => exports.default.isEqual(property.developerName, propertyName, true));
    },

    setObjectDataProperty: function (properties, propertyName, value) {
        const property = properties.find(property => exports.default.isEqual(property.developerName, propertyName, true));
        if (property)
            property.contentValue = value;
    },

    isEmptyObjectData: function(model) {
        if (model.objectDataRequest && model.objectData && model.objectData.length === 1)
            return exports.default.isPlaceholderObjectData(model.objectData);
        else if (model.objectData)
            return false;

        return true;
    },

    isPlaceholderObjectData: function(objectData) {
        if (objectData.length === 1) {
            for (const prop in objectData[0].properties) {
                if (!exports.default.isNullOrWhitespace(objectData[0].properties[prop].contentValue))
                    return false;
            }
            return true;
        }

        return false;
    },

    // Stolen from: https://github.com/johndugan/javascript-debounce/blob/master/debounce.js
    debounce: function(func, wait, immediate) {
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
    },

    removeFlow: function (flowKey) {
        Model.deleteFlowModel(flowKey);
        exports.default.removeFlowFromDOM(flowKey);
        Settings.remove(flowKey);
        State.remove(flowKey);
        Social.remove(flowKey);
        Callbacks.remove(flowKey);

        if (Settings.flow('collaboration.isEnabled', flowKey)) {
            Collaboration.leave('Another user', flowKey);
            Collaboration.remove(flowKey);
        }
    },

    // Stolen from: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    guid: function guid() {
        let now = new Date().getTime();

        if (typeof performance !== 'undefined' && typeof performance.now === 'function')
            now += performance.now();

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = (now + Math.random() * 16) % 16 | 0;
            now = Math.floor(now / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    },

    // Stolen from: https://github.com/soundcloud/jquery-whenall
    whenAll: function (deferreds) {
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
    }

};
