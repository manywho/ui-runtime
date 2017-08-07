/// <reference path="../../typings/index.d.ts" />

import Log from './log';
import Collaboration from './collaboration';
import Engine from './engine';
import Settings from './settings';
import Utils from './utils';

declare var manywho: any;
declare var io: any;

const components = {};
const aliases = {};

function getComponentType(item) {
    if ('containerType' in item)
        return item.containerType;
    else if ('componentType' in item)
        return item.componentType;

    return null;
}

export default {

    mixins: {},

    contentTypes: {
        string: 'CONTENTSTRING',
        number: 'CONTENTNUMBER',
        boolean: 'CONTENTBOOLEAN',
        password: 'CONTENTPASSWORD',
        datetime: 'CONTENTDATETIME',
        content: 'CONTENTCONTENT',
        object: 'CONTENTOBJECT',
        list: 'CONTENTLIST'
    },

    register(name, component, alias) {
        components[name.toLowerCase()] = component;

        if (alias)
            alias.forEach(aliasName => {
                aliases[aliasName.toLowerCase()] = name.toLowerCase();
            });
    },

    registerItems(name, component) {
        components['mw-' + name.toLowerCase()] = component;
        aliases[name.toLowerCase()] = 'mw-items-container';
    },

    registerAlias(alias, name) {
        aliases[alias.toLowerCase()] = name;
    },

    registerContainer(name, component) {
        components['mw-' + name.toLowerCase()] = component;
        aliases[name.toLowerCase()] = 'mw-container';
    },

    get(item) {
        let componentType = getComponentType(item).toLowerCase();

        if (aliases[componentType])
            componentType = aliases[componentType];

        if (components.hasOwnProperty(componentType))
            return components[componentType];
        else {
            Log.error('Component of type: ' + componentType + ' could not be found');
            throw 'Component of type: ' + componentType + ' could not be found';
        }
    },

    getByName(name) {
        if (name && aliases[name.toLowerCase()])
            name = aliases[name.toLowerCase()];

        return components[name.toLowerCase()];
    },

    getChildComponents(children, id, flowKey) {
        return children
            .sort((a, b) => a.order - b.order)
            .map(item => React.createElement(this.get(item), { id: item.id, parentId: id, flowKey: flowKey, key: item.id }));
    },

    getOutcomes(outcomes, flowKey) {
        return outcomes
            .sort((a, b) => a.order - b.order)
            .map(item => React.createElement(components['outcome'], { id: item.id, flowKey: flowKey, key: item.id }));
    },

    handleEvent(component, model, flowKey, callback) {
        if (model.hasEvents) {
            // Re-sync with the server here so that any events attached to the component are processed
            Engine.sync(flowKey)
                .then(() => {
                    Collaboration.sync(flowKey);
                    Engine.render(flowKey);
                })
                .then(callback);
        }

        component.forceUpdate();
    },

    getSelectedRows(model, selectedIds) {
        let selectedObjectData = [];

        if (selectedIds) {
            selectedIds.forEach(selectedId => {

                if (!Utils.isNullOrWhitespace(selectedId))
                    selectedObjectData = selectedObjectData.concat(
                        model.objectData.filter(item => Utils.isEqual(item.externalId, selectedId, true))
                                        .map(item => {
                                            const clone = JSON.parse(JSON.stringify(item));
                                            clone.isSelected = true;
                                            return clone;
                                        })
                    );
            });
        }

        return selectedObjectData;
    },

    getDisplayColumns(columns) {
        let displayColumns = null;

        if (columns)
            displayColumns = columns.filter(column => {
                if (column.properties) {
                    const property = Utils.getObjectDataProperty(column.properties, 'isDisplayValue');
                    return property ? Utils.isEqual(property.contentValue, 'true', true) : false;
                }
                else
                    return column.isDisplayValue;
            });

        if (!displayColumns || displayColumns.length === 0)
            Log.error('No display columns found');

        return displayColumns;
    },

    appendFlowContainer(flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        let container = document.getElementById(lookUpKey);
        const containerType = Utils.extractElement(flowKey);

        // Added this fix because embedded Flows and normal Flows should not be positioned absolute on their main container, that should only happen for modal containers

        let containerClasses = 'mw-bs flow-container';

        if (Utils.isEqual(containerType, 'modal', true))
            containerClasses += ' modal-container';

        if (!container && !Utils.isEqual(containerType, 'modal-standalone', true)) {
            const manywhoContainer = document.querySelector(Settings.global('containerSelector', flowKey, '#manywho'));

            container = document.createElement('div');
            container.setAttribute('id', lookUpKey);
            container.className = containerClasses;
            manywhoContainer.appendChild(container);
        }
        else if (Utils.isEqual(containerType, 'modal-standalone', true))
            container = document.querySelector(Settings.global('containerSelector', flowKey, '#manywho'));

        return container;
    },

    focusInput(flowKey) {
        // Focus the first input or textarea control on larger screen devices, this should help stop a keyboard from becoming visible on mobile devices when the flow first renders
        if (Settings.flow('autofocusinput', flowKey) && window.innerWidth > 768) {
            const input = document.querySelector('.main .mw-input input, .main .mw-content input, .main .mw-textarea textarea, .modal-container .mw-input input, .modal-container .mw-content input, .modal-container .mw-textarea textarea') as HTMLInputElement;
            if (input) {
                input.focus();

                if (Utils.isEqual(input.type, 'text', true))
                    input.setSelectionRange(input.value.length, input.value.length);
            }
        }
    },

    scrollToTop(flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        const container = document.getElementById(lookUpKey);
        if (container)
            window.scroll(0, container.offsetTop);
    },

    onOutcome(outcome, objectData, flowKey) {
        if (outcome.attributes) {
            if (outcome.attributes.uri) {
                window.open(outcome.attributes.uri, '_blank');
                return;
            }

            if (outcome.attributes.uriTypeElementPropertyId && objectData) {
                const property = objectData[0].properties.find(prop => Utils.isEqual(prop.typeElementPropertyId, outcome.attributes.uriTypeElementPropertyId, true));

                if (property) {
                    window.open(property.contentValue, '_blank');
                    return;
                }
            }
        }

        Engine.move(outcome, flowKey)
            .then(() => {
                if (outcome.isOut)
                    Engine.flowOut(outcome, flowKey);
            });
    }

};
