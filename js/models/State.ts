import { clone } from '../services/Utils';
import { IState, Id } from '../interfaces/IModels';

declare let manywho: any;

let currentMapElementId = null;
let id = null;
let token = null;
let values = {};

/**
 * Returns an object referencing the current state
 * @param state
 */
export const StateInit = (state: IState) => {
    currentMapElementId = state.currentMapElementId;
    id = state.id;
    token = state.token;
    values = state.values || values;

    return {
        currentMapElementId,
        id,
        token,
        values,
    };
};

/**
 * @param id
 */
export const getStateValue = (valueId: Id) => {
    if (values[valueId.id]) {
        const value = clone(values[valueId.id]);

        // If required, get a property value from an object
        if (valueId.typeElementPropertyId && value.objectData && value.objectData.length > 0) {
            const property = value.objectData[0].properties.find((prop) => prop.typeElementPropertyId === valueId.typeElementPropertyId);
            if (property) {
                value.contentValue = property.contentValue ? property.contentValue : null;
                value.objectData = property.objectData ? property.objectData : null;
            }
        }

        return value;
    }

    return null;
};

/**
 * @param valueId
 * @param typeElementId
 * @param snapshot
 * @param value
 */
export const setStateValue = (valueId: Id, typeElementId: string, snapshot: any, value: any) => {
    if (valueId.typeElementPropertyId) {
        if (!values[valueId.id] || !values[valueId.id].objectData || values[valueId.id].objectData.length === 0) {
            const typeElement = clone(snapshot.metadata.typeElements.find((type) => type.id === typeElementId));

            typeElement.properties = typeElement.properties.map((property) => {
                property.typeElementPropertyId = property.id;
                delete property.id;
                return property;
            });
            typeElement.elementType = 'VARIABLE';

            values[valueId.id] = {
                objectData: [typeElement],
            };
        }

        const property = values[valueId.id].objectData[0].properties.find((prop) => prop.typeElementPropertyId === valueId.typeElementPropertyId);
        if (property) {
            property.contentValue = value.contentValue;
            property.objectData = value.objectData;
        }

    } else {
        values[valueId.id] = clone(value);
    }
};

/**
 * Update multiple values in the state from a collection of `PageComponentInputResponses`
 * @param inputs
 * @param mapElement
 * @param snapshot
 */
export const StateUpdate = (inputs: any[], mapElement: any, snapshot: any) => {
    inputs.forEach((input) => {
        const page = snapshot.metadata.pageElements.find((pageElement) => pageElement.id === mapElement.pageElementId);
        const component = page.pageComponents.find((pageComponent) => pageComponent.id === input.pageComponentId);

        if (component.valueElementValueBindingReferenceId) {
            const value = snapshot.getValue(component.valueElementValueBindingReferenceId);
            setStateValue(component.valueElementValueBindingReferenceId, value.typeElementId, snapshot, input);
        }
    });
};
