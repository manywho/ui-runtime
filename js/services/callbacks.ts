/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

const callbacks = {};

export default {

    register(flowKey, options) {
        const lookUpKey = manywho.utils.getLookUpKey(flowKey);

        callbacks[lookUpKey] = callbacks[lookUpKey] || [];

        if (!options.flowKey)
            options.flowKey = flowKey;

        callbacks[lookUpKey].push(options);
    },

    execute(flowKey, type, name, mapElementId, args) {
        const lookUpKey = manywho.utils.getLookUpKey(flowKey);

        if (callbacks[lookUpKey])
            callbacks[lookUpKey].filter(function (item) {

                if (type && !manywho.utils.isEqual(item.type, type, true))
                    return false;

                if (name && !manywho.utils.isEqual(item.name, name, true))
                    return false;

                if (!manywho.utils.isEqual(type, 'done', true) && mapElementId && !manywho.utils.isEqual(item.mapElement, mapElementId, true))
                    return false;

                return true;
            })
            .forEach(function (item) {

                item.execute.apply(undefined, [item].concat(item.args || [], args));

                if (callbacks[lookUpKey] && !item.repeat)
                    callbacks[lookUpKey].splice(callbacks[lookUpKey].indexOf(item), 1);
            });
    },

    remove(flowKey) {
        const lookUpKey = manywho.utils.getLookUpKey(flowKey);
        callbacks[lookUpKey] = null;
    }

};
