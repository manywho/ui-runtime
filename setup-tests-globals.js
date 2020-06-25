// eslint-disable-next-line import/no-extraneous-dependencies
window.moment = require('moment');

window.metaData = {};

window.localforage = {
    setDriver: jest.fn(),
    removeItem: jest.fn(() => new Promise((resolve) => {
        resolve(true);
    })),
    getItem: jest.fn(() => new Promise((resolve) => {
        resolve(true);
    })),
    setItem: jest.fn(() => new Promise((resolve) => {
        resolve(true);
    })),
    createInstance: jest.fn(() => new Promise((resolve) => {
        resolve(true);
    })),
};

window.manywho = {
    ajax: {
        dispatchObjectDataRequest: jest.fn(() => Promise.resolve({ objectData: [] })),
        invoke: jest.fn(),
    },
    settings: {
        initialize: jest.fn(),
        global: jest.fn((a) => {
            if (a === 'offline.cache.requests.limit') {
                return 250;
            }

            if (a === 'offline.cache.requests.pageSize') {
                return 10;
            }

            if (a === 'platform.uri') {
                return 'https://flow.manywho.com';
            }

            return 'https://example.com';
        }),
    },
    utils: {
        extractFlowId: jest.fn(),
        extractStateId: jest.fn(),
        extractFlowVersionId: jest.fn(),
        extractTenantId: jest.fn(),
        getFlowKey: jest.fn(),
        isNullOrEmpty: jest.fn((input) => typeof input === 'undefined' || input === null || input === ''),
        isEqual: jest.fn(() => false),
    },
    state: {
        getAuthenticationToken: jest.fn(),
        getState: jest.fn(() => ({ token: 'test' })),
    },
    component: {
        contentTypes: {
            string: 'CONTENTSTRING',
            number: 'CONTENTNUMBER',
            boolean: 'CONTENTBOOLEAN',
            password: 'CONTENTPASSWORD',
            encrypted: 'CONTENTENCRYPTED',
            datetime: 'CONTENTDATETIME',
            content: 'CONTENTCONTENT',
            object: 'CONTENTOBJECT',
            list: 'CONTENTLIST',
        },
    },
    model: {
        addNotification: jest.fn(),
    },
    pollInterval: 1000,
};
