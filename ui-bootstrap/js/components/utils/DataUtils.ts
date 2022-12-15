/**
 * @description Some utility functions that can be shared across UI components
 */

 

export const checkBooleanString = (value: boolean | string): boolean => typeof value === "boolean" ? value :
    typeof value === "string" ? value.toLowerCase() === 'true' :
    false