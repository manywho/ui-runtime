import { getStateValue } from '../models/State';
import { clone, parseContent } from '../services/Utils';
import { IState } from '../interfaces/IModels';
import PageCondition from './pageconditions/PageCondition';

declare const manywho: any;

/**
 * Extract page container objects into new array
 * @param container
 */
export const getPageContainers = (container: any) => {
    if (container.pageContainers) {
        container.pageContainerResponses = container.pageContainers.map(getPageContainers);
        // delete container.pageContainers;
    }
    return container;
};

/**
 * Create a new flattened array of page containers
 * @param containers
 * @param parent
 * @param result
 * @param propertyName
 */
export const flattenContainers = (containers: any[], parent: any, result: any[], propertyName: string) => {
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
};

/**
 * @param request
 * @param mapElement
 * @param state
 * @param snapshot
 * @param tenantId
 */
export const generatePage = function (request: any, mapElement: any, state: IState, snapshot: any, tenantId: String) {
    const pageElement = snapshot.metadata.pageElements.find(page => mapElement.pageElementId === page.id);
    let pageContainerDataResponses = [];
    if (pageElement.pageContainers) {
        pageContainerDataResponses = flattenContainers(pageElement.pageContainers, null, [], 'pageContainers').map((container) => {
            return {
                isEditable: true,
                isEnabled: true,
                isVisible: true,
                pageContainerId: container.id,
            };
        });
    }

    const pageComponentDataResponses = (pageElement.pageComponents || []).map((component) => {

        let value: any = {
            isVisible: true,
            isEnabled: true,
            isRequired: component.isRequired,
            pageComponentId: component.id,
            content: component.content ? parseContent(component.content, snapshot) : null,
            contentValue: null,
            objectData: null,
            contentType: manywho.component.contentTypes.string,
            isValid: true,
        };

        let selectedValue = null;
        let sourceValue = null;
        let selectedSnapshotValue = undefined;

        if (component.valueElementValueBindingReferenceId) {
            selectedSnapshotValue = snapshot.getValue(component.valueElementValueBindingReferenceId);
            selectedValue = selectedSnapshotValue;
            value.contentType = snapshot.getContentTypeForValue(component.valueElementValueBindingReferenceId);
            const stateValue = getStateValue(component.valueElementValueBindingReferenceId);
            if (stateValue) {
                selectedValue = stateValue;
            }
        }

        if (component.columns) {
            let typeElementId = null;
            if (component.objectDataRequest) {
                typeElementId = component.objectDataRequest.typeElementId;
            } else if (component.valueElementDataBindingReferenceId) {
                sourceValue = snapshot.getValue(component.valueElementDataBindingReferenceId);
                typeElementId = sourceValue.typeElementId;

                const stateValue = getStateValue(component.valueElementDataBindingReferenceId);
                if (stateValue) {
                    sourceValue = stateValue;
                }
            }

            const orderColumns = (a, b) => {
                return a.order - b.order;
            };

            if (typeElementId) {
                component.columns = component.columns.map((column) => {
                    const typeElement = snapshot.metadata.typeElements.find((element) => {
                        return element.properties.find((property) => {
                            return property.id === column.typeElementPropertyId;
                        });
                    });
                    column.developerName = typeElement.properties.find(prop => prop.id === column.typeElementPropertyId).developerName;
                    return column;
                }).sort(orderColumns);
            }
        }

        if (selectedValue) {
            if (!selectedValue.hasOwnProperty('contentValue') ||
            typeof (selectedValue.contentValue) === undefined || selectedValue.contentValue === null) {

                // If there is no contentValue then use the default value
                value.contentValue = selectedSnapshotValue.defaultContentValue === null ?
                selectedSnapshotValue.defaultContentValue :
                String(selectedSnapshotValue.defaultContentValue);

                // If there is object data then assign it to the values object data key
                if (selectedValue.objectData) {
                    value.objectData = selectedValue.objectData;
                }

            } else {
                value.contentValue = selectedValue.contentValue === null ?
                selectedValue.contentValue :
                String(selectedValue.contentValue);
            }
        }

        if (sourceValue) {
            value.objectData = sourceValue.objectData || sourceValue.defaultObjectData;
            if (selectedValue) {
                if (selectedValue.objectData && (sourceValue.objectData || sourceValue.defaultObjectData)) {
                    value.objectData = (sourceValue.objectData || sourceValue.defaultObjectData).map((objectData) => {
                        objectData.isSelected = !!selectedValue.objectData.find(
                            item => item.externalId === objectData.externalId && item.isSelected,
                        );
                        return objectData;
                    });
                }
            }
        }

        if (pageElement.pageConditions) {
            try {
                value = PageCondition(pageElement, snapshot, component, value);
            } catch (error) {
                console.error(error.message);
            }
        }

        return Object.assign(clone(component), value, { attributes: component.attributes || {} });
    });
    return {
        developerName: mapElement.developerName,
        mapElementId: mapElement.id,
        outcomeResponses: mapElement.outcomes,
        pageResponse: {
            pageContainerDataResponses,
            pageComponentDataResponses,
            pageContainerResponses: pageElement.pageContainers.map(getPageContainers),
            pageComponentResponses: pageElement.pageComponents,
        },
    };
};
