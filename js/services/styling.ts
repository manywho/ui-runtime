

import Model from './model';

declare var manywho;

import Utils from './utils';

const components = {};
const containers = {};

export default {

    getClasses(parentId: string, id: string, type: string, flowKey: string): Array<string> {
        const parent = Model.getContainer(parentId, flowKey);
        const model = Model.getItem(id, flowKey);
        let classes = [];

        classes.push('mw-' + type.toLowerCase());

        if (parent) {
            const containerType = parent.containerType.toLowerCase();

            if (containers.hasOwnProperty(containerType))
                classes = classes.concat(containers[containerType].call(this, model, parent));
        }

        if (model) {
            const type = model.componentType || model.containerType;

            if (!Utils.isNullOrWhitespace(type)) {
                const typeLowerCase = type.toLowerCase();

                if (components.hasOwnProperty(typeLowerCase)) {
                    if (typeof components[typeLowerCase] === 'string' || components[typeLowerCase] instanceof String)
                        classes.push(components[typeLowerCase]);
                    else if ({}.toString.call(components[typeLowerCase]) === '[object Function]')
                        classes.push(components[typeLowerCase].call(this, model, parent));
                    else if (Array.isArray(components[typeLowerCase]))
                        classes = classes.concat(components[typeLowerCase]);
                }
            }
        }

        if (model.attributes && !Utils.isNullOrWhitespace(model.attributes.classes))
            classes.push(model.attributes.classes);

        if (Model.isContainer(model))
            classes.push('clearfix');

        return classes;
    },

    registerContainer(containerType, classes) {
        containers[containerType.toLowerCase()] = classes;
    },

    registerComponent(componentType, classes) {
        components[componentType.toLowerCase()] = classes;
    }

};
