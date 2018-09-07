declare const manywho: any;

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
    return !manywho.utils.isNullOrUndefined(object) ? JSON.parse(JSON.stringify(object)) : object;
};

export const guid = () => {
    const s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

export const humanFileSize = (size: number) => {
    const units = ['B', 'kB', 'MB', 'GB', 'TB'];
    const index = Math.floor(Math.log(size) / Math.log(1024));
    const value = size / Math.pow(1024, index);
    const valueFixed = value.toFixed(1);
    return `${valueFixed} ${units[index]}`;
};
