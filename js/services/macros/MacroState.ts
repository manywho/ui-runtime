import { clone } from '../Utils';

const currentState: any = {};

/**
 * @description returns an object of state values
 * that have been modified by macro methods
 */
export const getMacroState = () => clone(currentState);

/**
 * @param state a modified copy of state values
 * @description mutates current stored state values
 * into state values passed in
 */
export const setMacroState = (state: any) => {
    for (const key of Object.keys(state)) {
        currentState[key] = state[key];
    }
};
