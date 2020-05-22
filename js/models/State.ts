import { clone } from '../services/Utils';
import { IState } from '../interfaces/IModels';

declare var manywho: any;

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
export const getStateValue = (id: any) => {
    if (values[id.id]) {
        const value = clone(values[id.id]);

        // If required, get a property value from an object
        if (id.typeElementPropertyId && value.objectData && value.objectData.length > 0) {
            const property = value.objectData[0].properties.find(prop => prop.typeElementPropertyId === id.typeElementPropertyId);
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
 * @param id
 * @param typeElementId
 * @param snapshot
 * @param value
 */
export const setStateValue = (id: any, typeElementId: string, snapshot: any, value: any) => {
    if (id.typeElementPropertyId) {
        if (!values[id.id] || !values[id.id].objectData || values[id.id].objectData.length === 0) {
            const typeElement = clone(snapshot.metadata.typeElements.find(type => type.id === typeElementId));

            typeElement.properties = typeElement.properties.map((property) => {
                property.typeElementPropertyId = property.id;
                delete property.id;
                return property;
            });

            values[id.id] = {
                objectData: [typeElement],
            };
        }

        const property = values[id.id].objectData[0].properties.find(prop => prop.typeElementPropertyId === id.typeElementPropertyId);
        if (property) {
            property.contentValue = value.contentValue;
            property.objectData = value.objectData;
        }

    } else {
        values[id.id] = clone(value);
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
        const page = snapshot.metadata.pageElements.find(pageElement => pageElement.id === mapElement.pageElementId);
        const component = page.pageComponents.find(pageComponent => pageComponent.id === input.pageComponentId);

        if (component.valueElementValueBindingReferenceId) {
            const value = snapshot.getValue(component.valueElementValueBindingReferenceId);
            setStateValue(component.valueElementValueBindingReferenceId, value.typeElementId, snapshot, input);
        }
    });
};
