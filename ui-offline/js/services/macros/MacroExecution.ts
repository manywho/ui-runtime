import { getMacroState, setMacroState } from './MacroState';
import MacroMethods, { extractContentValue, settingContentValue } from './MacroMethods';

/**
 * @param macro the stringified macro
 * @param metadata the flow snapshot
 * @param macroState current state values that offline middleware knows about
 * @description evaluates the macro and returns the modified state values.
 */
export const executeMacro = (macro: string, metadata: any, macroState: any) => {

    setMacroState(macroState);
    MacroMethods.initMethods(metadata);

    // The state object has nothing to do with "state"
    // it is just the naming for special macro functions
    // e.g. state.getArray({!["some value"]})
    // which get passed into the evaluation context
    const state = {
        setDateTimeValue: MacroMethods.setDateTimeValue,
        createObject: MacroMethods.createObject,
        getArray: MacroMethods.getArray,
        getBooleanValue: extractContentValue,
        getContentValue: extractContentValue,
        getDateTimeValue: MacroMethods.getDateTimeValue,
        getNumberValue: MacroMethods.getNumberValue,
        getObject: MacroMethods.getObject,
        getPasswordValue: extractContentValue,
        getStringValue: extractContentValue,
        getValue: extractContentValue,
        setArray: MacroMethods.setArray,
        setBooleanValue: settingContentValue,
        setContentValue: settingContentValue,
        setNumberValue: settingContentValue,
        setObject: MacroMethods.setObject,
        setPasswordValue: settingContentValue,
        setStringValue: settingContentValue,
        setValue: settingContentValue,
    };

    Function(`"use strict";return (${macro})`)()(
        state,
    );

    return getMacroState();
};
