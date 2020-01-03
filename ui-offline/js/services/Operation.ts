///<reference path="../../custom.d.ts"/>

import { getStateValue, setStateValue } from '../models/State';
import { clone, guid } from '../services/Utils';
import { IState } from '../interfaces/IModels';
import Worker from 'worker-loader?inline=true&name=js/worker.js!../workers/Worker';

declare var manywho: any;

const commands = ['NEW', 'EMPTY', 'SET_EQUAL', 'VALUE_OF', 'GET_FIRST', 'GET_NEXT', 'ADD', 'REMOVE'];

/**
 * Determine if an operation command is supported
 * currently subtract and concatenate are not supported
 * Todo: add support for unsupported commands
 * @param command
 */
const isCommandSupported = (command: string) => {
    if (manywho.utils.isNullOrWhitespace(command) || commands.indexOf(command) !== -1) {
        return true;
    }
    manywho.log.info(`The Operation command is not supported and this operation will be ignored: ${command}`);
    return false;
};

/**
 * @param operation
 * @param snapshot
 * @description instantiating a web worker for securely evaluating macros
 */
export const invokeMacroWorker = (operation: any, state: any, snapshot: any) => {
    return new Promise((resolve) => {
        const macro = snapshot.getMacro(operation.macroElementToExecuteId);
        if (macro) {
            const worker = new Worker();

            worker.postMessage(
                JSON.stringify({ state, metadata: snapshot.metadata, macro: macro.code }),
            );

            worker.onmessage = (workerResponse) => {
                if (workerResponse.data.error) {
                    console.error(workerResponse.data.error);
                    worker.terminate();
                    resolve();
                } else {
                    const updatedValues = workerResponse.data.values;

                    // When the web worker posts back the state values
                    // that have been modified by a macro we want to push these new
                    // values into the offline state
                    for (const key of Object.keys(updatedValues)) {
                        setStateValue(
                            { id: key },
                            '',
                            null,
                            updatedValues[key],
                        );
                    }

                    worker.terminate();
                    resolve();
                }
            };
        }
    });
};

/**
 * Execute the operation and update the values in the local state.
 * Supports the following command types: NEW, EMPTY, SET_EQUAL, VALUE_OF, GET_FIRST, GET_NEXT, ADD, REMOVE
 * @param operation
 * @param state
 * @param snapshot
 */
export const executeOperation = (operation: any, state: IState, snapshot: any) => {
    return new Promise((resolve) => {
        let valueToReference: any = { objectData: null, contentValue: null };

        if (operation.valueElementToReferenceId) {
            if (!isCommandSupported(operation.valueElementToReferenceId.command)) {
                return state;
            }

            valueToReference = snapshot.getValue(operation.valueElementToReferenceId);
            const valueToReferenceStateValue = getStateValue(
                operation.valueElementToReferenceId,
                valueToReference.typeElementId,
                valueToReference.contentType,
                operation.valueElementToReferenceId.command,
            );
            if (valueToReferenceStateValue) {
                valueToReference = valueToReferenceStateValue;
            }
        }

        if (operation.valueElementToApplyId) {
            if (!isCommandSupported(operation.valueElementToApplyId.command)) {
                return state;
            }

            let valueToApply = snapshot.getValue(operation.valueElementToApplyId);
            const typeElementId = valueToApply ? valueToApply.typeElementId : null;
            const type = typeElementId ? snapshot.metadata.typeElements.find(typeElement => typeElement.id === typeElementId) : null;

            const valueToApplyStateValue = getStateValue(
                operation.valueElementToApplyId,
                valueToApply.typeElementId,
                valueToApply.contentType,
                operation.valueElementToApplyId.command,
            );
            if (valueToApplyStateValue) {
                valueToApply = valueToApplyStateValue;
            }

            switch (operation.valueElementToApplyId.command) {
            case 'NEW':
                valueToReference.objectData = [{
                    externalId: guid(),
                    internalId: guid(),
                    developerName: type.developerName,
                    order: 0,
                    isSelected: false,
                    properties: clone(type.properties).map((property) => {
                        property.contentValue = null;
                        property.objectData = null;
                        property.typeElementPropertyId = property.id;
                        return property;
                    }),
                }];
                break;

            case 'ADD':
                valueToReference.objectData = valueToReference.objectData || [];

                let hadExisting = false;

                const objectData = clone(valueToApply.objectData || valueToApply.defaultObjectData || []).map((objectData) => {
                    if (valueToReference.objectData.length > 0) {
                        const existingItem = valueToReference.objectData.find(
                            item => (item.externalId === objectData.externalId && item.externalId !== undefined),
                        );
                        if (existingItem) {
                            valueToReference.objectData.splice(valueToReference.objectData.indexOf(existingItem), 1);
                            hadExisting = true;
                            return existingItem;
                        }
                    }
                    return objectData;
                });

                console.log(objectData);

                if (!hadExisting) {
                    valueToReference.objectData = [{
                        typeElementId,
                        externalId: null,
                        internalId: guid(),
                        developerName: valueToReference.objectData[0].developerName,
                        order: 0,
                        isSelected: false,
                        properties: clone(type.properties).map((property) => {
                            const newProp = valueToReference.objectData[0].properties.filter(
                                prop => prop.typeElementPropertyId === property.id,
                            );
                            property.contentValue = newProp[0].contentValue ? newProp[0].contentValue : null;
                            property.objectData = newProp[0].objectData ? newProp[0].objectData : null;
                            property.typeElementPropertyId = newProp[0].typeElementPropertyId ? newProp[0].typeElementPropertyId : null;
                            return property;
                        }),
                    }];
                }

                const concatenatedObjectData = objectData.concat(clone(valueToReference.objectData));
                valueToReference.objectData = concatenatedObjectData;
                break;

            case 'REMOVE':
                valueToReference.objectData = valueToReference.objectData || [];

                valueToReference.objectData = clone(valueToApply.objectData || valueToApply.defaultObjectData || [])
                    .filter(objectData => !valueToReference.objectData.find(item => item.externalId === objectData.externalId));
                break;
            }

            setStateValue(operation.valueElementToApplyId, typeElementId, snapshot, valueToReference);
        }

        resolve(state);
    });
};
