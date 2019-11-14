import { getStateValue } from '../models/State';

/**
 * @param content
 * @param snapshot
 * @description for replacing value references inside a content string with
 * the value content values. Applicable to step elements and presentation page components
 */
export const parseContent = (content: string, snapshot: any) => {
    let contentCopy = content;

    // Check for any value references (these are wrapped in square brackets)
    const valueNames = content.match(/{([^}]*)}/g);
    if (valueNames && valueNames.length > 0) {

        // For every value reference, retrieve the value
        // from the flow snaphot
        valueNames.forEach((valueName) => {
            let valueObject;
            try {
                valueObject = snapshot.getValueByName(
                    valueName.split('.')[0].replace(/[^a-zA-Z0-9: -]/g, ''), // this is for when a value property is referenced
                );
            } catch (err) {
                valueObject = null;
            }

            const currentValue = valueObject ? getStateValue(
                { id: valueObject.id },
                null,
                valueObject.contentType,
                '',
            ) : { contentValue : null };

            if (valueObject && valueObject.contentType === 'ContentObject') {

                // If an object value is being referenced then the
                // correct property content value needs to be extracted
                if (currentValue.objectData && currentValue.objectData.length > 0) {
                    const property = currentValue.objectData[0].properties.find(
                        property => property.developerName === valueName.split('.')[1].replace(/[^a-zA-Z0-9 ]/g, ''),
                    );
                    contentCopy = contentCopy.replace(valueName, property.contentValue);
                }
            }
            contentCopy = contentCopy.replace(valueName, (currentValue.contentValue === null ? '' : currentValue.contentValue));
        });
        if (contentCopy.indexOf('undefined') !== -1) {
            return '';
        }
        return contentCopy;
    }

    return content;
};

/**
 * @param items
 * @param parent
 * @param result
 * @param childKey
 * @param parentKey
 */
export const flatten = (items: any[], parent: any, result: any[], childKey: string, parentKey: string) => {
    if (items) {
        for (let index = 0; index < items.length; index += 1) {
            const item = items[index];

            if (parent && parentKey) {
                item.parentKey = parent.id;
            }

            result.push(item);
            flatten(item[childKey], item, result, childKey, parentKey);
        }
    }

    return result;
};

/**
 * @param object
 */
export const clone = (object: Object) => {
    return !isNullOrUndefined(object) ? JSON.parse(JSON.stringify(object)) : object;
};

export const guid = () => {
    const s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

const isNullOrUndefined = (value: any): boolean => {
    return typeof value === 'undefined' || value === null;
};

export const humanFileSize = (size: number) => {
    const units = ['B', 'kB', 'MB', 'GB', 'TB'];
    const index = Math.floor(Math.log(size) / Math.log(1024));
    const value = size / Math.pow(1024, index);
    const valueFixed = value.toFixed(1);
    return `${valueFixed} ${units[index]}`;
};
