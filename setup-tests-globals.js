window.metaData = {};

window.localforage = {
    setDriver: jest.fn(),
    removeItem: jest.fn(() => {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }),
    getItem: jest.fn(() => {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }),
    setItem: jest.fn(() => {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }),
    createInstance: jest.fn(() => {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }),
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
        })
    },
    utils: {
        extractFlowId: jest.fn(),
        extractStateId: jest.fn(),
        extractFlowVersionId: jest.fn(),
        extractTenantId: jest.fn(),
        getFlowKey: jest.fn(),
        isNullOrEmpty: jest.fn(() => false),
        isEqual: jest.fn(() => false),
    },
    state: {
        getAuthenticationToken: jest.fn(),
        getState: jest.fn(() => {
            return {token: 'test'};
        }),
    },
    component: {
        contentTypes: {
            string: '',
        }
    },
    model: {
        addNotification: jest.fn(),
    },
    pollInterval: 1000,
};
