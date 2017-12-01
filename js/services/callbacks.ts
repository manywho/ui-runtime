import * as Utils from './utils';

export interface ICallback {
    type: string,
    execute: Function,
    name?: string,
    mapElement?: string,
    args?: Array<any>,
    flowKey?: string,
    repeat?: boolean
}

const callbacks = {};

/**
 * Register a callback to be executed later
 * @param flowKey
 * @param options
 */
export const register = (flowKey: string, options: ICallback) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);

    callbacks[lookUpKey] = callbacks[lookUpKey] || [];

    if (!options.flowKey)
        options.flowKey = flowKey;

    callbacks[lookUpKey].push(options);
};

/**
 * Execute a previously registered callback if a type & name are provided they will be checked against the registered callbacks first (in that order)
 * @param flowKey
 * @param type The type of context that callbacks are being executed in. Generally this is either the InvokeType in the invoke response from Boomi Flow e.g. FORWARD, WAIT, DONE, etc
 * @param name The name of the callback to execute
 * @param mapElementId The Map Element Id of the callback to execute. During normal flow execution this will be populated by the currentMapElementId from the invoke response
 * @param args Arguments to pass to the callback. During normal flow execution this will be the invoke response itself
 */
export const execute = (flowKey: string, type: string, name: string, mapElementId: string, args: Array<any>) => {
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
};

/**
 * Remove all callbacks
 * @param flowKey
 */
export const remove = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    callbacks[lookUpKey] = null;
};
