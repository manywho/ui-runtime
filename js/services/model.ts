import * as React from 'react';

import * as Component from './component';
import * as Engine from './engine';
import * as Log from 'loglevel';
import * as Settings from './settings';
import * as State from './state';
import * as Utils from './utils';

const flowModel = {};

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

export interface INotification {
    timeout: number | string,
    message: string,
    type: string,
    dismissible: boolean,
    position: string
}

export const parseEngineResponse = (engineInvokeResponse, flowKey: string) => {

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

            setAttributes(flowKey, engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.attributes || null);

            setContainers(flowKey,
                                engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.pageContainerResponses,
                                engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.pageContainerDataResponses);

            setComponents(flowKey,
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
            setHistory(engineInvokeResponse, flowKey);

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
};

export const parseEngineSyncResponse = (response, flowKey: string) => {

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
};

export const parseNavigationResponse = (id: string, response, flowKey: string, currentMapElementId: string) => {

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

    let parentStateId = getParentStateId(flowKey);

    if (parentStateId)
        flowModel[lookUpKey].navigation[id].returnToParent = React.createElement(Component.getByName('returnToParent'), { flowKey: flowKey, parentStateId: parentStateId });
};

export const getLabel = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].label;
};

export const getChildren = (containerId: string, flowKey: string) => {

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
};

export const getContainer = (containerId: string, flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].containers[containerId];
};

export const getComponent = (componentId: string, flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].components[componentId];
};

export const getComponentByName = (name: string, flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);
    let components = flowModel[lookUpKey].components;

    if (components) {
        for (let id in components) {
            if (Utils.isEqual(name, components[id].developerName, true))
                return components[id];
        }
    }

    return null;
};

export const getComponents = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].components;
};

export const getOutcome = (id: string, flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flowModel[lookUpKey].outcomes)
        return flowModel[lookUpKey].outcomes[id.toLowerCase()];
};

/**
 * @param id Id of the component or container that the outcomes are associated with
 */
export const getOutcomes = (id: string, flowKey: string): Array<any> => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flowModel[lookUpKey] === undefined || flowModel[lookUpKey].outcomes === undefined)
        return [];

    let outcomesArray = Utils.convertToArray(flowModel[lookUpKey].outcomes) || [];

    outcomesArray.sort((a, b) => a.order - b.order);

    return outcomesArray.filter(outcome => {
        return (!Utils.isNullOrWhitespace(id) && Utils.isEqual(outcome.pageObjectBindingId, id, true))
            || ((Utils.isNullOrWhitespace(id) || Utils.isEqual(id, 'root', true)) && Utils.isNullOrWhitespace(outcome.pageObjectBindingId));
    });
};

export const getNotifications = (flowKey: string, position: string): Array<INotification> => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flowModel[lookUpKey].notifications)
        return flowModel[lookUpKey].notifications.filter(notification => Utils.isEqual(notification.position, position, true));

    return [];
};

export const removeNotification = (flowKey: string, notification: INotification) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flowModel[lookUpKey]) {

        let index = flowModel[lookUpKey].notifications.indexOf(notification);
        flowModel[lookUpKey].notifications.splice(index, 1);

        Engine.render(flowKey);
    }
};

export const addNotification = (flowKey: string, notification: INotification) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flowModel[lookUpKey]) {

        flowModel[lookUpKey].notifications = flowModel[lookUpKey].notifications || [];

        flowModel[lookUpKey].notifications.push(notification);
        Engine.render(flowKey);
    }
};

export const getSelectedNavigation = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].selectedNavigation;
};

export const setSelectedNavigation = (navigationId: string, flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    flowModel[lookUpKey].selectedNavigation = navigationId;
};

export const getNavigation = (navigationId: string, flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (navigationId)
        return flowModel[lookUpKey].navigation[navigationId];
};

export const getDefaultNavigationId = (flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flowModel[lookUpKey].navigation)
        return Object.keys(flowModel[lookUpKey].navigation)[0];
};

/**
 * Search the model for a matching container, component, outcome or navigation (in that order) for the given `id`
 */
export const getItem = (id: string, flowKey: string) => {

    let item = getContainer(id, flowKey);
    if (item != null)
        return item;

    item = getComponent(id, flowKey);
    if (item != null)
        return item;

    item = getOutcome(id, flowKey);
    if (item != null)
        return item;

    item = getNavigation(id, flowKey);
    if (item != null)
        return item;
};

export const getInvokeType = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].invokeType;
};

export const getWaitMessage = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].waitMessage;
};

export const getPreCommitStateValues = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].preCommitStateValues;
};

export const getStateValues = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].stateValues;
};

export const getExecutionLog = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].executionLog;
};

export const setExecutionLog = (flowKey: string, executionLog) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    flowModel[lookUpKey].executionLog = executionLog;
};

/**
 * @hidden
 */
export const getHistory = (flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (!flowModel[lookUpKey].history)
        flowModel[lookUpKey].history = [];

    return flowModel[lookUpKey].history;
};

/**
 * @hidden
 */
export const setHistory = (engineInvokeResponse, flowKey: string) => {

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
};

/**
 * @hidden
 */
export const setHistorySelectedOutcome = (selectedOutcome, invokeType: string, flowKey: string) => {

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
};

/**
 * @hidden
 */
export const popHistory = (mapElementId: string, flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    let length = flowModel[lookUpKey].history.length;

    for (let i = length; i > 0; i--) {

        let mapElement = flowModel[lookUpKey].history[i - 1];

        if (mapElement.id === mapElementId)
            break;

        flowModel[lookUpKey].history.pop();
    }
};

export const isContainer = (item) => {
    return !Utils.isNullOrWhitespace(item.containerType);
};

/**
 * Create a new empty model for this state
 */
export const initializeModel = (flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (!flowModel[lookUpKey])
        flowModel[lookUpKey] = {};
};

export const getAttributes = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].attributes;
};

export const getParentStateId = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].parentStateId;
};

/**
 * Remove the local cache of the model for this state
 */
export const deleteFlowModel = (flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    flowModel[lookUpKey] = null;
    delete flowModel[lookUpKey];
};

export const getRootFaults = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].rootFaults || [];
};

export const setContainers = (flowKey: string, containers: Array<any>, data: any, propertyName?: string) => {

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
};

export const setComponents = (flowKey: string, components: Array<any>, data: any) => {

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
};

export const setAttributes = (flowKey: string, attributes: any) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    flowModel[lookUpKey].attributes = attributes;
};

export const setModal = (flowKey: string, modal) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    flowModel[lookUpKey].modal = modal;
    Engine.render(flowKey);
};

export const getModal = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].modal;
};
