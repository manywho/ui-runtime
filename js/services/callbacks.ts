/// <reference path="../../typings/index.d.ts" />

import Utils from './utils';

declare var manywho: any;

const callbacks = {};

export default {

    register(flowKey, options) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        callbacks[lookUpKey] = callbacks[lookUpKey] || [];

        if (!options.flowKey)
            options.flowKey = flowKey;

        callbacks[lookUpKey].push(options);
    },

    execute(flowKey, type, name, mapElementId, args) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        if (callbacks[lookUpKey])
            callbacks[lookUpKey].filter(function (item) {

                if (type && !Utils.isEqual(item.type, type, true))
                    return false;

                if (name && !Utils.isEqual(item.name, name, true))
                    return false;

                if (!Utils.isEqual(type, 'done', true) && mapElementId && !Utils.isEqual(item.mapElement, mapElementId, true))
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
        const lookUpKey = Utils.getLookUpKey(flowKey);
        callbacks[lookUpKey] = null;
    }

};
