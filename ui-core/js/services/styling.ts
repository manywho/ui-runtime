import * as Model from './model';
import * as Utils from './utils';

const components = {};
const containers = {};

/**
 * Get an array of class names that were previously registered. Also includes classes from the `classes` attribute
 * @param parentId Id of the parent container
 * @param id Id of the target component, container or outcome
 * @param type Adds a default class of this type prefixed with `mw-` .e.g `mw-input` for an input type
 */
export const getClasses = (
    parentId: string,
    id: string,
    type: string,
    flowKey: string,
): string[] => {
    const parent = Model.getContainer(parentId, flowKey);
    const model = Model.getItem(id, flowKey);
    let classes = [];

    classes.push(`mw-${type.toLowerCase()}`);

    if (parent) {
        const containerType = parent.containerType.toLowerCase();

        if (Utils.objectHasProperty(containers, containerType)) {
            classes = classes.concat(containers[containerType].call(this, model, parent));
        }
    }

    if (model) {
        const type = model.componentType || model.containerType;

        if (!Utils.isNullOrWhitespace(type)) {
            const typeLowerCase = type.toLowerCase();

            if (Utils.objectHasProperty(components, typeLowerCase)) {
                if (
                    typeof components[typeLowerCase] === 'string' ||
                    components[typeLowerCase] instanceof String
                ) {
                    classes.push(components[typeLowerCase]);
                } else if ({}.toString.call(components[typeLowerCase]) === '[object Function]') {
                    classes.push(components[typeLowerCase].call(this, model, parent));
                } else if (Array.isArray(components[typeLowerCase])) {
                    classes = classes.concat(components[typeLowerCase]);
                }
            }
        }
    }

    if (model.attributes && !Utils.isNullOrWhitespace(model.attributes.classes)) {
        classes.push(model.attributes.classes);
    }

    if (Model.isContainer(model)) {
        classes.push('clearfix');
    }

    return classes;
};

/**
 * Register class names for a specific container type, these are returned from `getClasses`
 * @param containerType Type name of the container as it appears in the metadata e.g. `VERTICAL_FLOW`
 * @param classes Class names to include with this container type
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const registerContainer = (containerType: string, classes: string | string[] | Function) => {
    containers[containerType.toLowerCase()] = classes;
};

/**
 * Register class names for a specific component type, these are returned from `getClasses`
 * @param componentType Type name of the component as it appears in the metadata e.g. `input`
 * @param classes Class names to include with this component type
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const registerComponent = (componentType: string, classes: string | string[] | Function) => {
    components[componentType.toLowerCase()] = classes;
};
