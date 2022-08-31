import * as React from 'react';
import { pathOr } from 'ramda';
import * as Log from 'loglevel';

import * as Collaboration from './collaboration';
import * as Engine from './engine';
import * as Settings from './settings';
import * as Utils from './utils';
import * as Ajax from './ajax';

const components = {};
const aliases = {};

const DEFAULT_PAGE_LIMIT = 10;

let customComponentsChecked = false;
let customComponentsLoadingCount = 0;
let isComponentWaitingForCustomComponents = false;

function getComponentType(item) {
    if ('containerType' in item) {
        return item.containerType;
    }
    if ('componentType' in item) {
        return item.componentType;
    }

    return null;
}

/**
 * @hidden
 */
export const mixins = {};

/**
 * Enum of the supported content types
 */
export const contentTypes = {
    string: 'CONTENTSTRING',
    number: 'CONTENTNUMBER',
    boolean: 'CONTENTBOOLEAN',
    password: 'CONTENTPASSWORD',
    encrypted: 'CONTENTENCRYPTED',
    datetime: 'CONTENTDATETIME',
    date: 'CONTENTDATE',
    content: 'CONTENTCONTENT',
    object: 'CONTENTOBJECT',
    list: 'CONTENTLIST',
};

/**
 * Register a React component, that can be fetched later by Name. Optionally provide aliases that will return the same component
 * @param name Name to register the component with
 * @param component
 * @param alias Extra names that can also be used to fetch the component later
 */
export const register = (name: string, component: React.Component | React.SFC, alias?: string[]) => {
    components[name.toLowerCase()] = component;

    if (alias) {
        alias.forEach((aliasName) => {
            aliases[aliasName.toLowerCase()] = name.toLowerCase();
        });
    }
};

/**
 * Register a React component, the name will be prepended with `mw-`. An alias of `mw-items-container` will also be added
 * @param name
 * @param component
 */
export const registerItems = (name: string, component: React.Component | React.SFC) => {
    components[`mw-${name.toLowerCase()}`] = component;
    aliases[name.toLowerCase()] = 'mw-items-container';
};

/**
 * Add an alias for a name
 * @param alias
 * @param name Name of a previously registered component
 */
export const registerAlias = (alias: string, name: string) => {
    aliases[alias.toLowerCase()] = name;
};

/**
 * Register a React component as a container, the name will be prepended with `mw-`
 * @param name
 * @param component
 */
export const registerContainer = (name: string, component: React.Component | React.SFC) => {
    components[`mw-${name.toLowerCase()}`] = component;
    aliases[name.toLowerCase()] = 'mw-container';
};

/**
 * Get the previously registered component based on the models `componentType` or `containerType`
 * @param model
 */
export const get = (model: any) => {
    let componentType = getComponentType(model).toLowerCase();

    if (aliases[componentType]) {
        componentType = aliases[componentType];
    }

    if (Object.prototype.hasOwnProperty.call(components, componentType)) {
        return components[componentType];
    }

    // Custom components are being loaded...
    // ... or haven't been checked yet ...
    if (customComponentsLoadingCount > 0 || customComponentsChecked === false) {
        // ..render a waiter until this is done
        isComponentWaitingForCustomComponents = true;
        return this.getByName('wait');
    }

    Log.error(`Component of type: ${componentType} could not be found`);

    return components['not-found-placeholder'](componentType);
};

/**
 * Get the previously registered component by name
 * @param name Name of the component
 */
export const getByName: any = (name: string) => {

    let componentName = name;

    if (name && aliases[name.toLowerCase()]) {
        componentName = aliases[name.toLowerCase()];
    }

    return components[componentName.toLowerCase()];
};

/**
 * Transform the child models into the relevant components
 * @param children
 * @param id
 * @param flowKey
 */
export const getChildComponents = (children: any[], id: string, flowKey: string) => children
    .sort((a, b) => a.order - b.order)
    .map(item => React.createElement(this.get(item), { flowKey, id: item.id, parentId: id, key: item.id }));

/**
 * Transform the outcome models into outcome components
 * @param outcomes
 * @param flowKey
 */
export const getOutcomes = (outcomes: any[], flowKey: string): any[] => outcomes
    .sort((a, b) => a.order - b.order)
    .map(item => React.createElement(getByName('outcome'), { flowKey, id: item.id, key: item.id }));

/**
 * If the model `hasEvents = true` perform an `Engine.sync` then re-render the flow and `forceUpdate` on the component
 * @param component
 * @param model
 * @param flowKey
 * @param callback Callback that is called after `Engine.sync` returns
 */
export const handleEvent = (component: React.Component | React.SFC, model: any, flowKey: any, callback: () => void) => {
    if (model.hasEvents) {
        // Re-sync with the server here so that any events attached to the component are processed
        Engine.sync(flowKey)
            .then(() => {
                Collaboration.sync(flowKey);
                Engine.render(flowKey);
            })
            .then(callback);
    }

    const reactComponent = component as React.Component;

    if (reactComponent && reactComponent.forceUpdate) {
        reactComponent.forceUpdate();
    }
};

/**
 * Get the ObjectData items from the model that match the selected ids
 * @param model
 * @param selectedIds The internal ids of the selected items
 */
export const getSelectedRows = (model: any, selectedIds: string[]): any[] => {
    let selectedObjectData = [];

    if (selectedIds) {
        selectedIds.forEach((selectedId) => {

            if (!Utils.isNullOrWhitespace(selectedId)) {
                selectedObjectData = selectedObjectData.concat(
                    model.objectData.filter(item => Utils.isEqual(item.internalId, selectedId, true))
                        .map((item) => {
                            const clone = JSON.parse(JSON.stringify(item));
                            clone.isSelected = true;
                            return clone;
                        }),
                );
            }
        });
    }

    return selectedObjectData;
};

/**
 * Get the columns that have `isDisplayValue` set to true, or contain a property with a developer name of `isDisplayValue`
 * and a content value of `true`
 * @param columns
 */
export const getDisplayColumns = (columns: any[]): any[] => {
    let displayColumns = null;

    if (columns) {
        displayColumns = columns.filter((column) => {
            if (column.properties) {
                const property = Utils.getObjectDataProperty(column.properties, 'isDisplayValue');
                return property ? Utils.isEqual(property.contentValue, 'true', true) : false;
            }

            return column.isDisplayValue;
        });
    }

    if (!displayColumns || displayColumns.length === 0) {
        Log.error('No display columns found');
    }

    return displayColumns;
};

/**
 * Adds a div element as the React target for the flow to the element targetted by the containerSelector setting
 * @param flowKey
 */
export const appendFlowContainer = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);

    let container = document.getElementById(lookUpKey);
    const containerType = Utils.extractElement(flowKey);

    // Added this fix because embedded Flows and normal Flows should not be positioned absolute on their main container,
    // that should only happen for modal containers

    let containerClasses = 'mw-bs flow-container';

    if (Utils.isEqual(containerType, 'modal', true)) {
        containerClasses += ' modal-container';
    }

    if (!container && !Utils.isEqual(containerType, 'modal-standalone', true)) {
        const manywhoContainer = document.querySelector(Settings.global('containerSelector', flowKey, '#manywho'));

        container = document.createElement('div');
        container.setAttribute('id', lookUpKey);
        container.className = containerClasses;
        manywhoContainer.appendChild(container);
    }
    else if (Utils.isEqual(containerType, 'modal-standalone', true)) {
        container = document.querySelector(Settings.global('containerSelector', flowKey, '#manywho'));
    }

    return container;
};

/**
 * Focus the first input or textarea control on larger screen devices i.e. width > 768px
 * @DEPRECATED this functionality is now implemented in model.ts
 * @param flowKey
 */
export const focusInput = (flowKey: string) => {
    // Focus the first input or textarea control on larger screen devices, this should help stop a keyboard from
    // becoming visible on mobile devices when the flow first renders
    if (Settings.flow('autofocusinput', flowKey) && window.innerWidth > 768) {
        const input = document.querySelector(`.main .mw-input input, .main .mw-content input,
            .main .mw-textarea textarea, .modal-container .mw-input input, .modal-container
            .mw-content input, .modal-container .mw-textarea textarea`) as HTMLInputElement;

        if (input) {
            input.focus();

            if (Utils.isEqual(input.type, 'text', true)) {
                input.setSelectionRange(input.value.length, input.value.length);
            }
        }
    }
};

/**
 * Scrolls the window to the top of the flow container
 * @param flowKey
 */
export const scrollToTop = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    const container = document.getElementById(lookUpKey);
    if (container) {
        window.scroll(0, container.offsetTop);
    }
};

/**
 * Calls `Engine.move` then `Engine.flowOut` if the `outcome.isOut` is true. Will open a new window instead if the `uri`
 * or `uriTypeElementPropertyId` attributes are defined
 * @param outcome
 * @param objectData
 * @param flowKey
 * @returns Deffered result from `Engine.move`
 */
export const onOutcome = (outcome: any, objectData: any[], flowKey: string): JQueryDeferred<any> => {
    if (outcome.attributes) {
        if (outcome.attributes.uri) {
            window.open(outcome.attributes.uri, '_blank');
            return null;
        }

        if (outcome.attributes.uriTypeElementPropertyId && objectData) {
            const property = objectData[0].properties.find(
                prop => Utils.isEqual(prop.typeElementPropertyId, outcome.attributes.uriTypeElementPropertyId, true),
            );

            // The following contentValue change is only necessary because of the Flows (Flow Tiles) System Flow
            // If a runtime uri has been specified, then change the Flow tiles Run link to use it
            // Otherwise the run uri is generated from the Draw2 Service as https://development.manywho.net or https://flow.manywho.com
            if (
                property &&
                outcome.attributes.uriTypeElementPropertyId === '03db5fd4-e9c0-4f2c-af2f-bc86304969a5' &&
                !Utils.isNullOrWhitespace(Settings.global('runtimeUri'))
            ) {
                // Replace engine Draw2 Service base uri with runtime uri
                property.contentValue = property.contentValue.replace(
                    /(https:\/\/development\.manywho\.net|https:\/\/flow\.manywho\.com)/,
                    Settings.global('runtimeUri'),
                );
            }
            if (property) {
                window.open(property.contentValue, '_blank');
                return null;
            }
        }
    }

    return Engine.move(outcome, flowKey)
        .then(() => {
            if (outcome.isOut) {
                Engine.flowOut(outcome, flowKey);
            }
        });
};

/**
 * Using data from the model and settings to calculate the page size.
 * @param model
 * @param flowKey
 * @returns Page limit size
 */
export const getPageSize = (model, flowKey) => {

    const pageLimitFromAttributes = pathOr(null, ['attributes', 'paginationSize'], model);
    const pageLimitFromAttributesIsValid = pageLimitFromAttributes && !Number.isNaN(Number(pageLimitFromAttributes));

    const usePaginationAttribute =
        pageLimitFromAttributesIsValid &&
        (
            // Data is coming from a service, we can ignore "pagination" boolean attribute
            !Utils.isNullOrUndefined(model.objectDataRequest)
            // Data is coming from a list value, we need to check that the "pagination" attribute is also set to true
            || Utils.isEqual(model.attributes.pagination, 'true', true)
        );

    const pageLimitSettingForComponentType = Settings.flow(
        `paging.${model.componentType.toLowerCase()}`, flowKey,
    );

    const pageLimitSettingFromListFilter = pathOr(null, ['objectDataRequest', 'listFilter', 'limit'], model);

    const limit = usePaginationAttribute
        ? pageLimitFromAttributes // 1st priority
        : (
            pageLimitSettingFromListFilter // 2nd priority
            || pageLimitSettingForComponentType // 3rd priority
            || DEFAULT_PAGE_LIMIT // final default
        );

    return parseInt(limit, 10);
};

/**
 * Re-renders the flow if a component is known to be waiting for the custom components to be loaded
 * and the custom components have finished loading
 * @param flowKey
 */
const reRenderIfComponentIsWaiting = (flowKey: string): void => {
    if (
        // If there are no more scripts loading...
        customComponentsLoadingCount === 0 &&
        // ...re-render the flow if an element is waiting
        isComponentWaitingForCustomComponents
    ) {
        Engine.render(flowKey);
    }
};

/**
 * Decrement load count and re-render if all have loaded
 * @param flowKey
 */
const finishLoadingCustomComponent = (flowKey: string) => (): void => {
    // Decrement the script load count
    customComponentsLoadingCount -= 1;
    // Re-render if done loading
    reRenderIfComponentIsWaiting(flowKey);
};

/**
 * Insert custom components into script tags automatically
 * @param flowInfo tenant, flow and auth info needed for the component api call
 * @param flowKey
 * @returns awaitable Promise
 */
export const addCustomComponents = async (
    flowInfo: Ajax.CustomComponentRequest, flowKey: string,
): Promise<void> => Ajax.fetchCustomComponents(flowInfo).then((customComponentResponse) => {
    // Set the script load count
    customComponentsLoadingCount = customComponentResponse.length;

    customComponentResponse.forEach((component) => {
        const componentScriptTag = document.createElement('script');
        componentScriptTag.src = component.scriptURL;
        // On load or error, decrement the load count
        componentScriptTag.onload = finishLoadingCustomComponent(flowKey);
        componentScriptTag.onerror = finishLoadingCustomComponent(flowKey);
        document.head.appendChild(componentScriptTag);

        if (component.styleSheetURL) {
            const componentStylesheetTag = document.createElement('link');
            componentStylesheetTag.href = component.styleSheetURL;
            componentStylesheetTag.rel = 'stylesheet';
            document.head.appendChild(componentStylesheetTag);
        }
    });

    customComponentsChecked = true;

    // Re-render if done loading
    reRenderIfComponentIsWaiting(flowKey);
}).catch((e) => {
    Log.error(e);
    // Set the loading count to 0 and the checked bool to true...
    customComponentsLoadingCount = 0;
    customComponentsChecked = true;
    // ...and re-render the flow...
    reRenderIfComponentIsWaiting(flowKey);
    // ...so that now the temporary waiter goes and they can see 'not found' errors as normal
});
