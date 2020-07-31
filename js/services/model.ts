import * as React from 'react';

import * as Component from './component';
import * as Engine from './engine';
import * as Log from 'loglevel';
import * as Settings from './settings';
import * as State from './state';
import * as Utils from './utils';

interface Icontainer {
    attributes?: any[];
    childCount: number;
    containerType: string;
    developerName: string;
    id: string;
    isEditable: boolean;
    isEnabled: boolean;
    isVisible: boolean;
    label: string;
    order: number;
    pageContainerId: string;
    pageContainerResponses?: any[];
    parent?: string;
    tags?: any[];
}

const flowModel = {};

function decodeEntities(item, textArea) {

    if (item.contentValue) {
        textArea.innerHTML = item.contentValue;
        item.contentValue = textArea.textContent;
        textArea.textContent = '';
    }

    if (item.objectData) {

        item.objectData.forEach((objectData) => {

            if (objectData.properties) {
                objectData.properties = objectData.properties.map((prop) => {

                    if (prop.contentValue) {
                        textArea.innerHTML = prop.contentValue;
                        prop.contentValue = textArea.textContent;
                        textArea.textContent = '';
                    }
                    return prop;
                });
            }
        });
    }

    return item;
}

function updateData(collection, item, key) {

    Log.info('Updating item: ' + item.id);

    const data = Utils.get(collection, item.id, key);

    if (data != null) {

        if (item.hasOwnProperty('contentType') && item.contentType == null) {
            item.contentType = Component.contentTypes.string;
        }

        return Utils.extend({}, [item, data]);
    }

    return item;
}

function flattenContainers(containers, parent, result, propertyName) {

    propertyName = propertyName || 'pageContainerResponses';

    if (containers != null) {

        for (let index = 0; index < containers.length; index += 1) {

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

    const navigationItems = {};

    if (itemsResponse) {

        itemsResponse.forEach((item) => {

            const data = dataResponse.find(dataResponseItem => Utils.isEqual(dataResponseItem.navigationItemId, item.id, true));

            navigationItems[item.id] = Utils.extend({}, [item, data], false);

            if (item.navigationItems != null) {
                navigationItems[item.id].items = getNavigationItems(item.navigationItems, dataResponse);
            }

        });
    }

    return navigationItems;
}

function hideContainers(lookUpKey) {
    const containers = Object.keys(flowModel[lookUpKey].containers).map(key => flowModel[lookUpKey].containers[key]);
    const components = Object.keys(flowModel[lookUpKey].components).map(key => flowModel[lookUpKey].components[key]);
    const outcomes = Object.keys(flowModel[lookUpKey].outcomes).map(key => flowModel[lookUpKey].outcomes[key]);

    containers
        .filter(container => !container.parent)
        .forEach((container) => {
            hideContainer(container, containers, components, outcomes);
        });
}

function hideContainer(container, containers, components, outcomes) {
    let childContainers = containers.filter(child => child.parent === container.id);
    childContainers.forEach((child) => {
        hideContainer(child, containers, components, outcomes);
    });

    const childComponents = components.filter(component => component.pageContainerId === container.id && component.isVisible);
    const childOutcomes = outcomes.filter(outcome => outcome.pageContainerId === container.id);
    childContainers = childContainers.filter(child => child.isVisible);

    if (childComponents.length === 0 && childOutcomes.length === 0 && childContainers.length === 0 && Utils.isNullOrWhitespace(container.label)) {
        container.isVisible = false;
    }
}

/**
 *
 * @param invokeType e.g SYNC, FORWARD etc
 * @param flowKey
 * @description Initiates a check to determine which component to auto focus
 */
const checkToAutoFocus = (invokeType: string, flowKey: string) => {

    // A Component should only auto focus if the flow
    // has either moved forward or navigated
    if (invokeType !== 'SYNC' && Settings.flow('autofocusinput', flowKey) && window.innerWidth > 768) {
        let foundFirstComponent = false;

        const validFieldsToFocus = ['INPUT', 'INPUT_DATETIME', 'INPUT_NUMBER', 'TEXTAREA'];
        const lookUpKey = Utils.getLookUpKey(flowKey);

        // Always need to start with the root container
        const mainContainer: Icontainer = Object.keys(flowModel[lookUpKey].containers).map((key) => {
            return flowModel[lookUpKey].containers[key];
        }).find(c => c.developerName.toUpperCase() === 'MAIN CONTAINER' && !c.parent);

        /**
         *
         * @param container
         * @param flowKey
         * @description Finds the very first component to be rendered in the flow
         * and sets a flag for it to either autofocus or not
         */
        const findFirstComponent = (container: Icontainer, flowKey: string) => {
            const children = getChildren(container.id, flowKey);
            for (const child of children) {

                // If the container has nested elements...
                if (child.childCount && child.childCount > 0) {
                    findFirstComponent(child, flowKey);
                }

                const isValidField = child.componentType ?
                    validFieldsToFocus.some(component => component === child.componentType.toUpperCase()) : false;

                // We have hit a component
                if (child.componentType && isValidField) {
                    if (foundFirstComponent) {
                        flowModel[lookUpKey].components[child.id]['autoFocus'] = false;
                    }
                    else {
                        flowModel[lookUpKey].components[child.id]['autoFocus'] = true;
                        foundFirstComponent = true;
                    }
                }
            }
        };

        // If theres no main container then it must be a step
        // element, so no need to bother
        if (mainContainer) {
            findFirstComponent(mainContainer, flowKey);
        }
    }
};

export interface INotification {
    timeout: number | string;
    message: string;
    type: string;
    dismissible: boolean;
    position: string;
}

/**
 * Parse the engine response into the model for this state from a `FORWARD` invoke request. This will setup the model
 * for things like: components, containers, outcomes, faults, votes, etc
 * @param engineInvokeResponse
 * @param flowKey
 */
export const parseEngineResponse = (engineInvokeResponse, flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    flowModel[lookUpKey].containers = {};
    flowModel[lookUpKey].components = {};
    flowModel[lookUpKey].outcomes = {};
    flowModel[lookUpKey].label = null;
    flowModel[lookUpKey].notifications = [];
    flowModel[lookUpKey].stateValues = [];
    flowModel[lookUpKey].preCommitStateValues = [];
    flowModel[lookUpKey].mapElement = {};

    flowModel[lookUpKey].rootFaults = [];

    if (engineInvokeResponse) {
        flowModel[lookUpKey].parentStateId = engineInvokeResponse.parentStateId;
    }

    if (
        engineInvokeResponse
        && engineInvokeResponse.mapElementInvokeResponses
        && engineInvokeResponse.mapElementInvokeResponses.length > 0
    ) {

        flowModel[lookUpKey].invokeType = engineInvokeResponse.invokeType;
        flowModel[lookUpKey].waitMessage = engineInvokeResponse.notAuthorizedMessage || engineInvokeResponse.waitMessage;
        flowModel[lookUpKey].vote = engineInvokeResponse.voteResponse || null;

        if (engineInvokeResponse.mapElementInvokeResponses[0].pageResponse) {

            flowModel[lookUpKey].label = engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.label;

            const mapElement = {
                name: engineInvokeResponse.mapElementInvokeResponses[0].label,
                id: engineInvokeResponse.mapElementInvokeResponses[0].mapElementId,
            };

            setMapElement(flowKey, mapElement);

            setAttributes(flowKey, engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.attributes || null);

            setContainers(flowKey,
                          engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.pageContainerResponses,
                          engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.pageContainerDataResponses);

            setComponents(flowKey,
                          engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.pageComponentResponses,
                          engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.pageComponentDataResponses);

            checkToAutoFocus(engineInvokeResponse.invokeType, flowKey);
        }

        if (engineInvokeResponse.mapElementInvokeResponses[0].outcomeResponses) {
            engineInvokeResponse.mapElementInvokeResponses[0].outcomeResponses.forEach((item) => {
                flowModel[lookUpKey].outcomes[item.id.toLowerCase()] = item;
            });
        }

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

                if (fault.responseBody) {
                    try {
                        fault.responseBody = JSON.parse(fault.responseBody);
                    }
                    catch (e) {
                        fault.responseBody = fault.responseBody;
                    }
                }

                fault.name = faultName;

                flowModel[lookUpKey].rootFaults.push(fault);

                let notificationMessage = fault.message;

                if (fault.responseBody && fault.responseBody.hasOwnProperty('invokeType')) {
                    // There is an original nested error
                    notificationMessage =
                        `Type: ${fault.responseBody.kind.toUpperCase()}
                        Message: ${fault.responseBody.message}
                        URI: ${fault.responseBody.uri}`;
                }

                flowModel[lookUpKey].notifications.push({
                    message: notificationMessage,
                    position: 'center',
                    type: 'danger',
                    timeout: '0',
                    dismissible: true,
                });
            }

            State.setComponentLoading(Utils.extractElement(flowKey), null, flowKey);
        }

        if (Settings.global('history', flowKey) && Utils.isEqual(engineInvokeResponse.invokeType, 'FORWARD', true)) {
            setHistory(engineInvokeResponse, flowKey);
        }

        flowModel[lookUpKey].preCommitStateValues = engineInvokeResponse.preCommitStateValues;
        flowModel[lookUpKey].stateValues = engineInvokeResponse.stateValues;

        switch (engineInvokeResponse.invokeType.toLowerCase()) {
        case 'wait':
            State.setComponentLoading('main', { message: engineInvokeResponse.waitMessage }, flowKey);
            break;
        }

    }
    else if (Utils.isEqual(engineInvokeResponse.invokeType, 'not_allowed', true)) {
        flowModel[lookUpKey].notifications.push({
            message: 'You are not authorized to access this content. Please contact your administrator for more details.',
            position: 'center',
            type: 'danger',
            timeout: '0',
            dismissible: false,

        });
    }
};

/**
 * Parse the engine response into the model for this state from a `SYNC` invoke request
 * @param response Response from `Ajax.invoke`
 * @param flowKey
 */
export const parseEngineSyncResponse = (response, flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (response.invokeType) {
        flowModel[lookUpKey].invokeType = response.invokeType;
    }

    if (response.mapElementInvokeResponses) {

        response.mapElementInvokeResponses[0].pageResponse.pageContainerDataResponses.forEach((item) => {
            let containerId = item.pageContainerId;

            // Steps will only ever have one container, the id is re-generated server side so it won't match up here, grab the existing id instead
            if (Utils.isEqual(response.mapElementInvokeResponses[0].developerName, 'step', true)) {
                containerId = Object.keys(flowModel[lookUpKey].containers)[0];
            }

            flowModel[lookUpKey].containers[containerId] = Utils.extend(flowModel[lookUpKey].containers[containerId], item);
        });

        response.mapElementInvokeResponses[0].pageResponse.pageComponentDataResponses.forEach((item) => {
            flowModel[lookUpKey].components[item.pageComponentId] = Utils.extend(flowModel[lookUpKey].components[item.pageComponentId], item, false);
        });

        hideContainers(lookUpKey);
    }
};

/**
 * Parse the navigation response from `Ajax.getNavigation` into the model for this state
 * @param id Id of the navigation configuration in the flow
 * @param response Navigation response returned by `Ajax.getNavigation`
 * @param flowKey
 * @param currentMapElementId
 */
export const parseNavigationResponse = (id: string, response, flowKey: string, currentMapElementId: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    flowModel[lookUpKey].navigation = {};

    flowModel[lookUpKey].navigation[id] = {
        culture: response.culture,
        developerName: response.developerName,
        label: response.label,
        tags: response.tags,
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

    const parentStateId = getParentStateId(flowKey);

    if (parentStateId) {
        flowModel[lookUpKey].navigation[id].returnToParent = React.createElement(Component.getByName('returnToParent'), { flowKey, parentStateId });
    }
};

/**
 * Get the label of the current page
 */
export const getLabel = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].label;
};

/**
 * Get an ordered array of all the child models of a container
 */
export const getChildren = (containerId: string, flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flowModel[lookUpKey] === undefined || flowModel[lookUpKey].containers === undefined) {
        return [];
    }

    if (containerId === 'root') {
        return Utils.getAll(flowModel[lookUpKey].containers, undefined, 'parent');
    }

    let children = [];
    const container = flowModel[lookUpKey].containers[containerId];

    if (container != null) {
        children = children.concat(Utils.getAll(flowModel[lookUpKey].containers, containerId, 'parent'));
        children = children.concat(Utils.getAll(flowModel[lookUpKey].components, containerId, 'pageContainerId'));
    }

    children.sort((a, b) => a.order - b.order);

    return children;
};

/**
 * Get a container by id
 */
export const getContainer = (containerId: string, flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].containers[containerId];
};

/**
 * Get a component by id
 */
export const getComponent = (componentId: string, flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].components[componentId];
};

/**
 * Get a component by name
 */
export const getComponentByName = (name: string, flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);
    const components = flowModel[lookUpKey].components;

    if (components) {
        for (const id in components) {
            if (Utils.isEqual(name, components[id].developerName, true)) {
                return components[id];
            }
        }
    }

    return null;
};

/**
 * Get all the components
 */
export const getComponents = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].components;
};

/**
 * Get an outcome by id
 */
export const getOutcome = (id: string, flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flowModel[lookUpKey].outcomes) {
        return flowModel[lookUpKey].outcomes[id.toLowerCase()];
    }
};

/**
 * Get all the outcomes for a container / component
 * @param id Id of the component or container that the outcomes are associated with
 */
export const getOutcomes = (id: string, flowKey: string): any[] => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flowModel[lookUpKey] === undefined || flowModel[lookUpKey].outcomes === undefined) {
        return [];
    }

    const outcomesArray = Utils.convertToArray(flowModel[lookUpKey].outcomes) || [];

    outcomesArray.sort((a, b) => a.order - b.order);

    return outcomesArray.filter((outcome) => {
        return (!Utils.isNullOrWhitespace(id) && Utils.isEqual(outcome.pageObjectBindingId, id, true))
            || ((Utils.isNullOrWhitespace(id) || Utils.isEqual(id, 'root', true)) && Utils.isNullOrWhitespace(outcome.pageObjectBindingId));
    });
};

/**
 * Get currently active notifications for a given position
 * @param flowKey
 * @param position `center`, `left`, `right`
 */
export const getNotifications = (flowKey: string, position: string): INotification[] => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flowModel[lookUpKey].notifications) {
        return flowModel[lookUpKey].notifications.filter(notification => Utils.isEqual(notification.position, position, true));
    }

    return [];
};

/**
 * Remove a notification
 */
export const removeNotification = (flowKey: string, notification: INotification) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flowModel[lookUpKey]) {

        const index = flowModel[lookUpKey].notifications.indexOf(notification);
        flowModel[lookUpKey].notifications.splice(index, 1);

        Engine.render(flowKey);
    }
};

/**
 * Add a new notification
 */
export const addNotification = (flowKey: string, notification: INotification) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flowModel[lookUpKey]) {

        flowModel[lookUpKey].notifications = flowModel[lookUpKey].notifications || [];

        flowModel[lookUpKey].notifications.push(notification);
        Engine.render(flowKey);
    }
};

/**
 * @ignore
 */
export const getSelectedNavigation = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].selectedNavigation;
};

/**
 * @ignore
 */
export const setSelectedNavigation = (navigationId: string, flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    flowModel[lookUpKey].selectedNavigation = navigationId;
};

/**
 * Get the model for a configured navigation by id
 */
export const getNavigation = (navigationId: string, flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (navigationId) {
        return flowModel[lookUpKey].navigation[navigationId];
    }
};

/**
 * Get the first navigation model configured for this flow
 */
export const getDefaultNavigationId = (flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flowModel[lookUpKey].navigation) {
        return Object.keys(flowModel[lookUpKey].navigation)[0];
    }
};

/**
 * Search the model for a matching container, component, outcome or navigation (in that order) for the given `id`
 */
export const getItem = (id: string, flowKey: string) => {

    let item = getContainer(id, flowKey);
    if (item != null) {
        return item;
    }

    item = getComponent(id, flowKey);
    if (item != null) {
        return item;
    }

    item = getOutcome(id, flowKey);
    if (item != null) {
        return item;
    }

    item = getNavigation(id, flowKey);
    if (item != null) {
        return item;
    }
};

/**
 * @ignore
 */
export const getInvokeType = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].invokeType;
};

/**
 * @ignore
 */
export const getWaitMessage = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].waitMessage;
};

/**
 * @ignore
 */
export const getPreCommitStateValues = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].preCommitStateValues;
};

/**
 * @ignore
 */
export const getStateValues = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].stateValues;
};

/**
 * @ignore
 */
export const getHistoricalNavigation = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].historicalNavigation;
};

/**
 * @ignore
 */
export const setHistoricalNavigation = (flowKey: string, historicalNavigation) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    flowModel[lookUpKey].historicalNavigation = historicalNavigation;
};

/**
 * @ignore
 */
export const getExecutionLog = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].executionLog;
};

/**
 * @ignore
 */
export const setExecutionLog = (flowKey: string, executionLog) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    flowModel[lookUpKey].executionLog = executionLog;
};

/**
 * @hidden
 */
export const getHistory = (flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (!flowModel[lookUpKey].history) {
        flowModel[lookUpKey].history = [];
    }

    return flowModel[lookUpKey].history;
};

/**
 * @hidden
 */
export const setHistory = (engineInvokeResponse, flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (!flowModel[lookUpKey].history) {
        flowModel[lookUpKey].history = [];
    }

    if (!flowModel[lookUpKey].lastInvoke) {
        flowModel[lookUpKey].lastInvoke = 'FORWARD';
    }

    const length = flowModel[lookUpKey].history.length;
    let outcomes = null;

    if (Utils.isEqual(flowModel[lookUpKey].lastInvoke, 'FORWARD', true)) {

        if (engineInvokeResponse.mapElementInvokeResponses[0].outcomeResponses) {
            outcomes = engineInvokeResponse.mapElementInvokeResponses[0].outcomeResponses.map((outcome) => {
                return { name: outcome.developerName, id: outcome.id, label: outcome.label, order: outcome.order };
            });
        }

        flowModel[lookUpKey].history[length] = Utils.extend(flowModel[lookUpKey].history[length] || {}, [{
            outcomes,
            name: engineInvokeResponse.mapElementInvokeResponses[0].developerName,
            id: engineInvokeResponse.mapElementInvokeResponses[0].mapElementId,
            label: engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.label,
            content: engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.pageComponentDataResponses[0].content || '',
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

        if (!flowModel[lookUpKey].history) {
            flowModel[lookUpKey].history = [];
        }

        const length = flowModel[lookUpKey].history.length - 1;

        if (!flowModel[lookUpKey].history[length]) {
            flowModel[lookUpKey].history[length] = {};
        }

        flowModel[lookUpKey].history[length].selectedOutcome = selectedOutcome;
    }
};

/**
 * @hidden
 */
export const popHistory = (mapElementId: string, flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    const length = flowModel[lookUpKey].history.length;

    for (let i = length; i > 0; i -= 1) {

        const mapElement = flowModel[lookUpKey].history[i - 1];

        if (mapElement.id === mapElementId) {
            break;
        }

        flowModel[lookUpKey].history.pop();
    }
};

/**
 * Check if an item has the property `containerType`
 */
export const isContainer = (item) => {
    return !Utils.isNullOrWhitespace(item.containerType);
};

/**
 * Create a new empty model for this state
 */
export const initializeModel = (flowKey: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (!flowModel[lookUpKey]) {
        flowModel[lookUpKey] = {};
    }
};

/**
 * @ignore
 */
export const getMapElement = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].mapElement;
};

/**
 * @ignore
 */
export const setMapElement = (flowKey: string, mapElement: any) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    flowModel[lookUpKey].mapElement = mapElement;
};

/**
 * @ignore
 */
export const getAttributes = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].attributes;
};

/**
 * @ignore
 */
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

/**
 * @ignore
 */
export const getRootFaults = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].rootFaults || [];
};

/**
 * Set this flow models `containers` property by iterating through the `containers` array merge with the matching container data in `data`
 */
export const setContainers = (flowKey: string, containers: any[], data: any, propertyName?: string) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    propertyName = propertyName || 'pageContainerResponses';

    if (containers) {

        flowModel[lookUpKey].containers = {};

        const flattenedContainers = flattenContainers(containers, null, [], propertyName);
        flattenedContainers.forEach((item) => {

            flowModel[lookUpKey].containers[item.id] = item;

            if (data && Utils.contains(data, item.id, 'pageContainerId')) {
                flowModel[lookUpKey].containers[item.id] = updateData(data, item, 'pageContainerId');
            }
        });
    }
};

/**
 * Set this flow models `components` property by iterating through the `components` array merge with the matching container data in `data`
 */
export const setComponents = (flowKey: string, components: any[], data: any) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (components) {

        flowModel[lookUpKey].components = {};

        const decodeTextArea = document.createElement('textarea');

        components.forEach((item) => {

            item.attributes = item.attributes || {};

            flowModel[lookUpKey].components[item.id] = item;

            if (!flowModel[lookUpKey].containers[item.pageContainerId].childCount) {
                flowModel[lookUpKey].containers[item.pageContainerId].childCount = 0;
            }

            flowModel[lookUpKey].containers[item.pageContainerId].childCount += 1;

            if (data && Utils.contains(data, item.id, 'pageComponentId')) {
                flowModel[lookUpKey].components[item.id] = updateData(data, item, 'pageComponentId');
            }

            flowModel[lookUpKey].components[item.id] = decodeEntities(flowModel[lookUpKey].components[item.id], decodeTextArea);

        });
    }
};

/**
 * @ignore
 */
export const setAttributes = (flowKey: string, attributes: any) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    flowModel[lookUpKey].attributes = attributes;
};

/**
 * @ignore
 */
export const setModal = (flowKey: string, modal) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    flowModel[lookUpKey].modal = modal;
    Engine.render(flowKey);
};

/**
 * @ignore
 */
export const getModal = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flowModel[lookUpKey].modal;
};
