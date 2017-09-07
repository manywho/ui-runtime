

import * as React from 'react';

import Component from './component';
import Engine from './engine';
import * as Log from 'loglevel';
import Settings from './settings';
import State from './state';
import Utils from './utils';

declare const manywho: any;

let flowModel = {};

function decodeEntities(item, textArea) {

    if (item.contentValue) {
        textArea.innerHTML = item.contentValue;
        item.contentValue = textArea.textContent;
        textArea.textContent = '';
    }

    if (item.objectData) {

        item.objectData.forEach(objectData => {

            if (objectData.properties)
                objectData.properties = objectData.properties.map(prop => {

                    if (prop.contentValue) {
                        textArea.innerHTML = prop.contentValue;
                        prop.contentValue = textArea.textContent;
                        textArea.textContent = '';
                    }
                    return prop;
                });
        });
    }

    return item;
}

function updateData(collection, item, key) {

    Log.info('Updating item: ' + item.id);

    const data = Utils.get(collection, item.id, key);

    if (data != null) {

        if (item.hasOwnProperty('contentType') && item.contentType == null)
            item.contentType = Component.contentTypes.string;

        return Utils.extend({}, [item, data]);
    }

    return item;
}

function flattenContainers(containers, parent, result, propertyName) {

    propertyName = propertyName || 'pageContainerResponses';

    if (containers != null) {

        for (let index = 0; index < containers.length; index++) {

            const item = containers[index];

            if (parent) {
                item.parent = parent.id;
                parent.childCount = containers.length;
            }

            result.push(item);
            flattenContainers(item[propertyName], item, result, propertyName);
        }
    }

    return result;
}

function getNavigationItems(itemsResponse, dataResponse) {

    let navigationItems = {};

    if (itemsResponse) {

        itemsResponse.forEach(item => {

            const data = dataResponse.find(dataResponseItem => Utils.isEqual(dataResponseItem.navigationItemId, item.id, true));

            navigationItems[item.id] = Utils.extend({}, [item, data], false);

            if (item.navigationItems != null)
                navigationItems[item.id].items = getNavigationItems(item.navigationItems, dataResponse);

        });
    }

    return navigationItems;
}

function hideContainers(lookUpKey) {
    const containers = Object.keys(flowModel[lookUpKey].containers).map(function(key) { return flowModel[lookUpKey].containers[key]; });
    const components = Object.keys(flowModel[lookUpKey].components).map(function(key) { return flowModel[lookUpKey].components[key]; });
    const outcomes = Object.keys(flowModel[lookUpKey].outcomes).map(function(key) { return flowModel[lookUpKey].outcomes[key]; });

    containers
        .filter(function(container) { return !container.parent; })
        .forEach(function(container) { hideContainer(container, containers, components, outcomes); });
}

function hideContainer(container, containers, components, outcomes) {
    let childContainers = containers.filter(child => child.parent === container.id);
    childContainers.forEach(child => { hideContainer(child, containers, components, outcomes); });

    let childComponents = components.filter(component => component.pageContainerId === container.id && component.isVisible);
    let childOutcomes = outcomes.filter(outcome => outcome.pageContainerId === container.id);
    childContainers = childContainers.filter(child => child.isVisible);

    if (childComponents.length === 0 && childOutcomes.length === 0 && childContainers.length === 0 && Utils.isNullOrWhitespace(container.label))
        container.isVisible = false;
}

export default {

    parseEngineResponse: function (engineInvokeResponse, flowKey) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        flowModel[lookUpKey].containers = {};
        flowModel[lookUpKey].components = {};
        flowModel[lookUpKey].outcomes = {};
        flowModel[lookUpKey].label = null;
        flowModel[lookUpKey].notifications = [];
        flowModel[lookUpKey].stateValues = [];
        flowModel[lookUpKey].preCommitStateValues = [];

        flowModel[lookUpKey].rootFaults = [];

        if (engineInvokeResponse)
            flowModel[lookUpKey].parentStateId = engineInvokeResponse.parentStateId;

        if (engineInvokeResponse && engineInvokeResponse.mapElementInvokeResponses) {

            flowModel[lookUpKey].invokeType = engineInvokeResponse.invokeType;
            flowModel[lookUpKey].waitMessage = engineInvokeResponse.notAuthorizedMessage || engineInvokeResponse.waitMessage;
            flowModel[lookUpKey].vote = engineInvokeResponse.voteResponse || null;

            if (engineInvokeResponse.mapElementInvokeResponses[0].pageResponse) {

                flowModel[lookUpKey].label = engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.label;

                exports.default.setAttributes(flowKey, engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.attributes || null);

                exports.default.setContainers(flowKey,
                                    engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.pageContainerResponses,
                                    engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.pageContainerDataResponses);

                exports.default.setComponents(flowKey,
                                    engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.pageComponentResponses,
                                    engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.pageComponentDataResponses);

            }

            if (engineInvokeResponse.mapElementInvokeResponses[0].outcomeResponses)
                engineInvokeResponse.mapElementInvokeResponses[0].outcomeResponses.forEach(item => {
                    flowModel[lookUpKey].outcomes[item.id.toLowerCase()] = item;
                });

            hideContainers(lookUpKey);

            if (engineInvokeResponse.mapElementInvokeResponses[0].rootFaults) {

                flowModel[lookUpKey].rootFaults = [];
                flowModel[lookUpKey].notifications = flowModel[lookUpKey].notifications || [];

                for (const faultName in engineInvokeResponse.mapElementInvokeResponses[0].rootFaults) {

                    let fault = null;

                    try {
                        fault = JSON.parse(engineInvokeResponse.mapElementInvokeResponses[0].rootFaults[faultName]);
                    }
                    catch (ex) {
                        fault = { message: engineInvokeResponse.mapElementInvokeResponses[0].rootFaults[faultName] };
                    }

                    fault.name = faultName;

                    flowModel[lookUpKey].rootFaults.push(fault);

                    flowModel[lookUpKey].notifications.push({
                        message: fault.message,
                        position: 'center',
                        type: 'danger',
                        timeout: '0',
                        dismissible: true
                    });
                }

                State.setComponentLoading(Utils.extractElement(flowKey), null, flowKey);
            }

            if (Settings.global('history', flowKey) && Utils.isEqual(engineInvokeResponse.invokeType, 'FORWARD', true))
                exports.default.setHistory(engineInvokeResponse, flowKey);

            flowModel[lookUpKey].preCommitStateValues = engineInvokeResponse.preCommitStateValues;
            flowModel[lookUpKey].stateValues = engineInvokeResponse.stateValues;

            switch (engineInvokeResponse.invokeType.toLowerCase()) {
                case 'wait':
                    State.setComponentLoading('main', { message: engineInvokeResponse.waitMessage }, flowKey);
                    break;
            }

        }
        else if (Utils.isEqual(engineInvokeResponse.invokeType, 'not_allowed', true))
            flowModel[lookUpKey].notifications.push({
                message: 'You are not authorized to access this content. Please contact your administrator for more details.',
                position: 'center',
                type: 'danger',
                timeout: '0',
                dismissible: false

            });
    },

    parseEngineSyncResponse: function(response, flowKey) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        if (response.invokeType)
            flowModel[lookUpKey].invokeType = response.invokeType;

        if (response.mapElementInvokeResponses) {

            response.mapElementInvokeResponses[0].pageResponse.pageContainerDataResponses.forEach(item => {
                let containerId = item.pageContainerId;

                // Steps will only ever have one container, the id is re-generated server side so it won't match up here, grab the existing id instead
                if (Utils.isEqual(response.mapElementInvokeResponses[0].developerName, 'step', true))
                    containerId = Object.keys(flowModel[lookUpKey].containers)[0];

                flowModel[lookUpKey].containers[containerId] = Utils.extend(flowModel[lookUpKey].containers[containerId], item);
            });

            response.mapElementInvokeResponses[0].pageResponse.pageComponentDataResponses.forEach(item => {
                flowModel[lookUpKey].components[item.pageComponentId] = Utils.extend(flowModel[lookUpKey].components[item.pageComponentId], item, true);
            });

            hideContainers(lookUpKey);
        }
    },

    parseNavigationResponse: function (id, response, flowKey, currentMapElementId) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        flowModel[lookUpKey].navigation = {};

        flowModel[lookUpKey].navigation[id] = {
            culture: response.culture,
            developerName: response.developerName,
            label: response.label,
            tags: response.tags
        };

        flowModel[lookUpKey].navigation[id].items = getNavigationItems(response.navigationItemResponses, response.navigationItemDataResponses);
        flowModel[lookUpKey].navigation[id].isVisible = response.isVisible;
        flowModel[lookUpKey].navigation[id].isEnabled = response.isEnabled;

        let selectedItem = null;
        for (const itemId in flowModel[lookUpKey].navigation[id].items) {

            if (flowModel[lookUpKey].navigation[id].items[itemId].isCurrent) {
                selectedItem = flowModel[lookUpKey].navigation[id].items[itemId];
                break;
            }

        }

        if (selectedItem == null && currentMapElementId) {

            for (const itemId in flowModel[lookUpKey].navigation[id].items) {

                if (Utils.isEqual(flowModel[lookUpKey].navigation[id].items[itemId].locationMapElementId, currentMapElementId, true)) {
                    flowModel[lookUpKey].navigation[id].items[itemId].isCurrent = true;
                    break;
                }

            }

        }

        let parentStateId = exports.default.getParentStateId(flowKey);

        if (parentStateId)
            flowModel[lookUpKey].navigation[id].returnToParent = React.createElement(Component.getByName('returnToParent'), { flowKey: flowKey, parentStateId: parentStateId });
    },

    getLabel: function (flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return flowModel[lookUpKey].label;
    },

    getChildren: function (containerId, flowKey) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        if (flowModel[lookUpKey] === undefined || flowModel[lookUpKey].containers === undefined)
            return [];

        if (containerId === 'root')
            return Utils.getAll(flowModel[lookUpKey].containers, undefined, 'parent');

        let children = [];
        let container = flowModel[lookUpKey].containers[containerId];

        if (container != null) {
            children = children.concat(Utils.getAll(flowModel[lookUpKey].containers, containerId, 'parent'));
            children = children.concat(Utils.getAll(flowModel[lookUpKey].components, containerId, 'pageContainerId'));
        }

        children.sort((a, b) => a.order - b.order);

        return children;
    },

    getContainer: function (containerId, flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return flowModel[lookUpKey].containers[containerId];
    },

    getComponent: function (componentId, flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return flowModel[lookUpKey].components[componentId];
    },

    getComponentByName: function(name, flowKey) {

        const lookUpKey = Utils.getLookUpKey(flowKey);
        let components = flowModel[lookUpKey].components;

        if (components) {
            for (let id in components) {
                if (Utils.isEqual(name, components[id].developerName, true))
                    return components[id];
            }
        }

        return null;
    },

    getComponents: function (flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return flowModel[lookUpKey].components;
    },

    getOutcome: function (outcomeId, flowKey) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        if (flowModel[lookUpKey].outcomes)
            return flowModel[lookUpKey].outcomes[outcomeId.toLowerCase()];
    },

    getOutcomes: function (pageObjectId, flowKey) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        if (flowModel[lookUpKey] === undefined || flowModel[lookUpKey].outcomes === undefined)
            return [];

        let outcomesArray = Utils.convertToArray(flowModel[lookUpKey].outcomes) || [];

        outcomesArray.sort((a, b) => a.order - b.order);

        return outcomesArray.filter(outcome => {
            return (!Utils.isNullOrWhitespace(pageObjectId) && Utils.isEqual(outcome.pageObjectBindingId, pageObjectId, true))
                || ((Utils.isNullOrWhitespace(pageObjectId) || Utils.isEqual(pageObjectId, 'root', true)) && Utils.isNullOrWhitespace(outcome.pageObjectBindingId));
        });
    },

    getNotifications: function(flowKey, position) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        if (flowModel[lookUpKey].notifications)
            return flowModel[lookUpKey].notifications.filter(notification => Utils.isEqual(notification.position, position, true));

        return [];
    },

    removeNotification: function(flowKey, notification) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        if (flowModel[lookUpKey]) {

            let index = flowModel[lookUpKey].notifications.indexOf(notification);
            flowModel[lookUpKey].notifications.splice(index, 1);

            Engine.render(flowKey);
        }
    },

    addNotification: function(flowKey, notification) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        if (flowModel[lookUpKey]) {

            flowModel[lookUpKey].notifications = flowModel[lookUpKey].notifications || [];

            flowModel[lookUpKey].notifications.push(notification);
            Engine.render(flowKey);
        }
    },

    getSelectedNavigation: function (flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return flowModel[lookUpKey].selectedNavigation;
    },

    setSelectedNavigation: function (navigationId, flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        flowModel[lookUpKey].selectedNavigation = navigationId;
    },

    getNavigation: function (navigationId, flowKey) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        if (navigationId)
            return flowModel[lookUpKey].navigation[navigationId];
    },

    getDefaultNavigationId: function(flowKey) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        if (flowModel[lookUpKey].navigation)
            return Object.keys(flowModel[lookUpKey].navigation)[0];
    },

    getItem: function(id, flowKey) {

        let item = exports.default.getContainer(id, flowKey);
        if (item != null)
            return item;

        item = exports.default.getComponent(id, flowKey);
        if (item != null)
            return item;

        item = exports.default.getOutcome(id, flowKey);
        if (item != null)
            return item;

        item = exports.default.getNavigation(id, flowKey);
        if (item != null)
            return item;
    },

    getInvokeType: function(flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return flowModel[lookUpKey].invokeType;
    },

    getWaitMessage: function (flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return flowModel[lookUpKey].waitMessage;
    },

    getPreCommitStateValues: function (flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return flowModel[lookUpKey].preCommitStateValues;
    },

    getStateValues: function (flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return flowModel[lookUpKey].stateValues;
    },

    getExecutionLog: function (flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return flowModel[lookUpKey].executionLog;
    },

    setExecutionLog: function (flowKey, executionLog) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        flowModel[lookUpKey].executionLog = executionLog;
    },

    getHistory: function (flowKey) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        if (!flowModel[lookUpKey].history)
            flowModel[lookUpKey].history = [];

        return flowModel[lookUpKey].history;
    },

    setHistory: function (engineInvokeResponse, flowKey) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        if (!flowModel[lookUpKey].history)
            flowModel[lookUpKey].history = [];

        if (!flowModel[lookUpKey].lastInvoke)
            flowModel[lookUpKey].lastInvoke = 'FORWARD';

        let length = flowModel[lookUpKey].history.length;
        let outcomes = null;

        if (Utils.isEqual(flowModel[lookUpKey].lastInvoke, 'FORWARD', true)) {

            if (engineInvokeResponse.mapElementInvokeResponses[0].outcomeResponses)
                outcomes = engineInvokeResponse.mapElementInvokeResponses[0].outcomeResponses.map(outcome => {
                    return { name: outcome.developerName, id: outcome.id, label: outcome.label, order: outcome.order };
                });

            flowModel[lookUpKey].history[length] = Utils.extend(flowModel[lookUpKey].history[length] || {}, [{
                name: engineInvokeResponse.mapElementInvokeResponses[0].developerName,
                id: engineInvokeResponse.mapElementInvokeResponses[0].mapElementId,
                label: engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.label,
                content: engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.pageComponentDataResponses[0].content || '',
                outcomes: outcomes
            }]);
        }
    },

    setHistorySelectedOutcome: function (selectedOutcome, invokeType, flowKey) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        flowModel[lookUpKey].lastInvoke = invokeType;

        if (selectedOutcome) {

            if (!flowModel[lookUpKey].history)
                flowModel[lookUpKey].history = [];

            let length = flowModel[lookUpKey].history.length - 1;

            if (!flowModel[lookUpKey].history[length])
                flowModel[lookUpKey].history[length] = {};

            flowModel[lookUpKey].history[length].selectedOutcome = selectedOutcome;
        }
    },

    popHistory: function (mapElementId, flowKey) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        let length = flowModel[lookUpKey].history.length;

        for (let i = length; i > 0; i--) {

            let mapElement = flowModel[lookUpKey].history[i - 1];

            if (mapElement.id === mapElementId)
                break;

            flowModel[lookUpKey].history.pop();
        }
    },

    isContainer: function (item) {
        return !Utils.isNullOrWhitespace(item.containerType);
    },

    initializeModel: function (flowKey) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        if (!flowModel[lookUpKey])
            flowModel[lookUpKey] = {};
    },

    getAttributes: function (flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return flowModel[lookUpKey].attributes;
    },

    getParentStateId: function(flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return flowModel[lookUpKey].parentStateId;
    },

    deleteFlowModel: function(flowKey) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        flowModel[lookUpKey] = null;
        delete flowModel[lookUpKey];
    },

    getRootFaults: function(flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return flowModel[lookUpKey].rootFaults || [];
    },

    setContainers: function(flowKey, containers, data, propertyName) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        propertyName = propertyName || 'pageContainerResponses';

        if (containers) {

            flowModel[lookUpKey].containers = {};

            let flattenedContainers = flattenContainers(containers, null, [], propertyName);
            flattenedContainers.forEach(item => {

                flowModel[lookUpKey].containers[item.id] = item;

                if (data && Utils.contains(data, item.id, 'pageContainerId'))
                    flowModel[lookUpKey].containers[item.id] = updateData(data, item, 'pageContainerId');
            });
        }
    },

    setComponents: function(flowKey, components, data) {

        const lookUpKey = Utils.getLookUpKey(flowKey);

        if (components) {

            flowModel[lookUpKey].components = {};

            let decodeTextArea = document.createElement('textarea');

            components.forEach(item => {

                item.attributes = item.attributes || {};

                flowModel[lookUpKey].components[item.id] = item;

                if (!flowModel[lookUpKey].containers[item.pageContainerId].childCount)
                    flowModel[lookUpKey].containers[item.pageContainerId].childCount = 0;

                flowModel[lookUpKey].containers[item.pageContainerId].childCount++;

                if (data && Utils.contains(data, item.id, 'pageComponentId'))
                    flowModel[lookUpKey].components[item.id] = updateData(data, item, 'pageComponentId');

                flowModel[lookUpKey].components[item.id] = decodeEntities(flowModel[lookUpKey].components[item.id], decodeTextArea);

            });
        }
    },

    setAttributes: function (flowKey, attributes) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        flowModel[lookUpKey].attributes = attributes;
    },

    setModal: function(flowKey, modal) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        flowModel[lookUpKey].modal = modal;
        Engine.render(flowKey);
    },

    getModal: function(flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return flowModel[lookUpKey].modal;
    }

};
