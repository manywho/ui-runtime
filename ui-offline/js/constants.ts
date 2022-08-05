export const METADATA_TYPES = {
    visible: 'METADATA.VISIBLE',
    required: 'METADATA.REQUIRED',
    enabled: 'METADATA.ENABLED',
};

export const CRITERIA = {
    isEmpty: 'IS_EMPTY',
    isEqual: 'EQUAL',
    isNotEqual: 'NOT_EQUAL',
};

export const DEFAULT_POLL_INTERVAL = 30000; // 30 seconds

export const DEFAULT_OBJECTDATA_CACHING_INTERVAL = 300000; // 5 minutes

export const STRIP_VALUE_TAGS_REGEX = /[^a-zA-Z0-9 ]/g;

export const CONTENT_TYPES = {
    OBJECT: 'ContentObject',
    BOOLEAN: 'ContentBoolean',
    STRING: 'ContentString',
    LIST: 'ContentList',
    NUMBER: 'ContentNumber',
    DATETIME: 'ContentDateTime',
    DATE: 'ContentDate',
    PASSWORD: 'ContentPassword',
    CONTENT: 'ContentContent',
};

export const BANNER_TEXT = {
    online: 'You are working online - you can now sync your work when ready',
    offline: 'You are working offline - remember to sync work when re-connected',
};
