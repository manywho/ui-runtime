// /<reference path="../../index.d.ts"/>

import { getStateValue, setStateValue } from '../models/State';
import { clone, guid } from './Utils';
import { IState } from '../interfaces/IModels';
// @ts-expect-error worker-loader inline configuration
// eslint-disable-next-line import/no-unresolved
import * as Worker from 'worker-loader?inline=true&name=js/worker.js!../workers/Worker';

declare let manywho: any;

const commands = [
    'NEW',
    'EMPTY',
    'SET_EQUAL',
    'VALUE_OF',
    'GET_FIRST',
    'GET_NEXT',
    'ADD',
    'REMOVE',
];

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
    manywho.log.info(
        `The Operation command is not supported and this operation will be ignored: ${command}`,
    );
    return false;
};

/**
 * @param operation
 * @param snapshot
 * @description instantiating a web worker for securely evaluating macros
 */
export const invokeMacroWorker = (operation: any, state: any, snapshot: any) =>
    new Promise((resolve) => {
        const macro = snapshot.getMacro(operation.macroElementToExecuteId);
        if (macro) {
            const worker = new Worker();

            // https://stackoverflow.com/a/59094308
            const removeComments = (string: string): string =>
                string.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();

            worker.postMessage(
                JSON.stringify({
                    state,
                    metadata: snapshot.metadata,
                    macro: removeComments(macro.code),
                }),
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
                            { id: key, typeElementPropertyId: null },
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

/**
 * Execute the operation and update the values in the local state.
 * Supports the following command types: NEW, EMPTY, SET_EQUAL, VALUE_OF, GET_FIRST, GET_NEXT, ADD, REMOVE
 * @param operation
 * @param state
 * @param snapshot
 */
export const executeOperation = (operation: any, state: IState, snapshot: any) =>
    new Promise((resolve) => {
        let valueToReference: any = { objectData: null, contentValue: null };

        if (operation.valueElementToReferenceId) {
            if (!isCommandSupported(operation.valueElementToReferenceId.command)) {
                return resolve(state);
            }

            valueToReference = snapshot.getValue(operation.valueElementToReferenceId);
            const valueToReferenceStateValue = getStateValue(operation.valueElementToReferenceId);
            if (valueToReferenceStateValue) {
                valueToReference = valueToReferenceStateValue;
            }

            if (valueToReference.objectData) {
                // Handle list iteration noting that GET_NEXT will get the first element if GET_FIRST has not been called beforehand
                // Note that for iteration we need to persist the current array index by calling setStateValue()
                if (
                    manywho.utils.isEqual(
                        operation.valueElementToReferenceId.command,
                        'GET_FIRST',
                        true,
                    )
                ) {
                    const v = clone(valueToReference);
                    valueToReference.objectData = [v.objectData[0]];
                    v.index = 1;
                    setStateValue(
                        operation.valueElementToReferenceId,
                        valueToReference.typeElementId,
                        snapshot,
                        v,
                    );
                } else if (
                    manywho.utils.isEqual(
                        operation.valueElementToReferenceId.command,
                        'GET_NEXT',
                        true,
                    )
                ) {
                    const v = clone(valueToReference);
                    const idx: number = v.index ? v.index : 0;
                    valueToReference.objectData =
                        idx < v.objectData.length ? [v.objectData[idx]] : [];
                    v.index = idx + 1;
                    setStateValue(
                        operation.valueElementToReferenceId,
                        valueToReference.typeElementId,
                        snapshot,
                        v,
                    );
                }
            }
        }

        if (operation.valueElementToApplyId) {
            if (!isCommandSupported(operation.valueElementToApplyId.command)) {
                return resolve(state);
            }

            let valueToApply = snapshot.getValue(operation.valueElementToApplyId);
            const typeElementId = valueToApply ? valueToApply.typeElementId : null;
            const type = typeElementId
                ? snapshot.metadata.typeElements.find(
                      (typeElement) => typeElement.id === typeElementId,
                  )
                : null;

            const valueToApplyStateValue = getStateValue(operation.valueElementToApplyId);
            if (valueToApplyStateValue) {
                valueToApply = valueToApplyStateValue;
            }

            switch (operation.valueElementToApplyId.command) {
                case 'NEW':
                    valueToReference.objectData = [
                        {
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
                        },
                    ];
                    break;

                case 'ADD': {
                    const isStringOperation =
                        valueToReference.contentType === 'ContentString' &&
                        valueToApply.contentType === 'ContentString';
                    const isNumericalOperation =
                        valueToReference.contentType === 'ContentNumber' &&
                        valueToApply.contentType === 'ContentNumber';
                    const isListOperation =
                        valueToReference.contentType === 'ContentObject' &&
                        valueToApply.contentType === 'ContentList';

                    if (!isStringOperation && !isNumericalOperation && !isListOperation) {
                        console.error(
                            `The value being changed is a ${valueToReference.contentType} and the value being referenced is a ${valueToApply.contentType} which are not valid for use with the ADD command`,
                        );
                    }

                    if (isStringOperation) {
                        valueToReference.contentValue = `${valueToApply.contentValue}${valueToReference.contentValue}`;
                    }

                    if (isNumericalOperation) {
                        valueToReference.contentValue =
                            parseFloat(valueToReference.contentValue ?? 0) +
                            parseFloat(valueToApply.contentValue ?? 0);
                    }

                    if (isListOperation) {
                        valueToReference.objectData = valueToReference.objectData || [];

                        let hadExisting = false;

                        const objectData = clone(
                            valueToApply.objectData || valueToApply.defaultObjectData || [],
                        ).map((objData) => {
                            if (valueToReference.objectData.length > 0) {
                                const existingItem = valueToReference.objectData.find(
                                    (item) =>
                                        (item.externalId &&
                                            item.externalId === objData.externalId) ||
                                        (item.internalId && item.internalId === objData.internalId),
                                );
                                if (existingItem) {
                                    valueToReference.objectData.splice(
                                        valueToReference.objectData.indexOf(existingItem),
                                        1,
                                    );
                                    hadExisting = true;
                                    return existingItem;
                                }
                            }
                            return objData;
                        });

                        if (!hadExisting) {
                            valueToReference.objectData = [
                                {
                                    typeElementId,
                                    externalId: null,
                                    internalId: guid(),
                                    developerName: valueToReference.objectData[0].developerName,
                                    order: 0,
                                    isSelected: false,
                                    properties: clone(type.properties).map((property) => {
                                        const newProp =
                                            valueToReference.objectData[0].properties.filter(
                                                (prop) =>
                                                    prop.typeElementPropertyId === property.id,
                                            );
                                        property.contentValue = newProp[0].contentValue
                                            ? newProp[0].contentValue
                                            : null;
                                        property.objectData = newProp[0].objectData
                                            ? newProp[0].objectData
                                            : null;
                                        property.typeElementPropertyId = newProp[0]
                                            .typeElementPropertyId
                                            ? newProp[0].typeElementPropertyId
                                            : null;
                                        return property;
                                    }),
                                },
                            ];
                        }

                        const concatenatedObjectData = objectData.concat(
                            clone(valueToReference.objectData),
                        );
                        valueToReference.objectData = concatenatedObjectData;
                    }
                    break;
                }

                case 'REMOVE':
                    valueToReference.objectData = valueToReference.objectData || [];

                    valueToReference.objectData = clone(
                        valueToApply.objectData || valueToApply.defaultObjectData || [],
                    ).filter(
                        (objectData) =>
                            !valueToReference.objectData.find(
                                (item) =>
                                    (item.externalId &&
                                        item.externalId === objectData.externalId) ||
                                    (item.internalId && item.internalId === objectData.internalId),
                            ),
                    );
                    break;
                default:
                    // TODO - Raise error ?
                    break;
            }

            setStateValue(
                operation.valueElementToApplyId,
                typeElementId,
                snapshot,

                /**
                 * Some operations use values with different content types e.g. performing an Add on a List value.
                 * We do this so that the content type of the value in state does not get overwritten with the incorrect one
                 */
                { ...valueToReference, contentType: valueToApply.contentType },
            );
        }

        return resolve(state);
    });
