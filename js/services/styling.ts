declare var manywho;

manywho.styling = (function (manywho) {

    const components = {};
    const containers = {};

    return {

        getClasses: function (parentId: string, id: string, type: string, flowKey: string): Array<string> {
            const parent = manywho.model.getContainer(parentId, flowKey);
            const model = manywho.model.getItem(id, flowKey);
            let classes = [];

            classes.push('mw-' + type.toLowerCase());

            if (parent) {
                const containerType = parent.containerType.toLowerCase();

                if (containers.hasOwnProperty(containerType))
                    classes = classes.concat(containers[containerType].call(this, model, parent));
            }

            if (model) {
                const type = model.componentType || model.containerType;

                if (!manywho.utils.isNullOrWhitespace(type)) {
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

            if (model.attributes && !manywho.utils.isNullOrWhitespace(model.attributes.classes))
                classes.push(model.attributes.classes);

            if (manywho.model.isContainer(model))
                classes.push('clearfix');

            return classes;
        },

        registerContainer: function (containerType, classes) {
            containers[containerType.toLowerCase()] = classes;
        },

        registerComponent: function (componentType, classes) {
            components[componentType.toLowerCase()] = classes;
        },

    };

} (manywho));
