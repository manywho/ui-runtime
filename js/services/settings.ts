/**
 * Store for the various settings that are supported in the UI framework, details on the available settings can be found here: https://github.com/manywho/ui-html5/wiki/Settings
 */

 /** this comment exists as a typedoc workaround */
import * as $ from 'jquery';

import * as Utils from './utils';

let globals = {
    localization: {
        initializing: '',
        executing: '',
        loading: '',
        navigating: '',
        syncing: '',
        joining: 'Joining',
        sending: 'Sending',
        returnToParent: 'Return To Parent',
        noResults: 'No Results',
        status: null,
        validation: {
            required: 'This field is required',
            invalid: 'This value is invalid',
            notification: 'Page contains invalid values'
        },
        searchFirst: 'Perform a search to display results here'
    },
    i18n: {
        overrideTimezoneOffset: false,
        timezoneOffset: null,
        culture: null
    },
    paging: {
        table: 10,
        files: 10,
        select: 250,
        tiles: 20
    },
    collaboration: {
        uri: 'https://realtime.manywho.com'
    },
    platform: {
        uri: ''
    },
    navigation: {
        isFixed: true,
        isWizard: false
    },
    files: {
        downloadUriPropertyId: '6611067a-7c86-4696-8845-3cdc79c73289',
        downloadUriPropertyName: 'Download Uri'
    },
    richText: {
        url: 'https://cdn.tinymce.com/4/tinymce.min.js',
        fontSize: '14px',
        plugins: [
            'advlist autolink link lists link image charmap print hr anchor',
            'searchreplace visualblocks fullscreen wordcount code insertdatetime',
            'media table directionality emoticons contextmenu paste textcolor'
        ],
        toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link mwimage'
    },
    errorMessage: 'Whoops, something went wrong inside ManyWho - if this keeps happening, contact us at support@manywho.com',
    outcomes: {
        display: null,
        isFixed: false,
    },
    shortcuts: {
        progressOnEnter: true
    },
    isFullWidth: false,
    collapsible: {
        default: {
            enabled: false,
            collapsed: false,
            group: null
        }
    },
    history: false,
    containerSelector: '#manywho',
    syncOnUnload: true,
    toggle: {
        shape: 'round',
        background: null
    },
    charts: {
        backgroundColors: ['#42a5f5', '#66bb6a', '#ef5350', '#ab47bc', '#ffa726', '#78909c', '#5c6bc0'],
        borderColors: ['#42a5f5', '#66bb6a', '#ef5350', '#ab47bc', '#ffa726', '#78909c', '#5c6bc0'],
        options: {},
        bar: {
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        },
        line: {
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        },
        polarArea: {
            backgroundColors: ['rgba(66, 165, 245, 0.4)', 'rgba(102, 187, 106, 0.4)', 'rgba(239, 83, 80, 0.4)', 'rgba(171, 71, 188, 0.4)', 'rgba(255, 167, 38, 0.4)', 'rgba(120, 144, 156, 0.4)', 'rgba(92, 107, 192, 0.4)']
        }
    },
    validation: {
        isEnabled: false,
        scroll: {
            isEnabled: false,
            selector: '.has-error'
        },
        notification: {
            isEnabled: true
        },
        when: ['move']
    },
    location: {
        isTrackingEnabled: false
    },
    formatting: {
        isEnabled: false,
        currency: '0.00'
    },
    tours: {
        defaults: {
            target: null,
            title: null,
            content: null,
            placement: 'bottom',
            showNext: true,
            showBack: true,
            offset: null,
            align: 'center',
            order: null,
            querySelector: false
        },
        autoStart: false,
        container: '.mw-bs'
    },
    components: {
        static: []
    }
};

let flows = {};

let themes = {
    url: '/css/themes'
};

let events = {
    initialization: {},
    invoke: {},
    sync: {},
    navigation: {},
    join: {},
    flowOut: {},
    login: {},
    log: {},
    objectData: {},
    fileData: {},
    getFlowByName: {},
    sessionAuthentication: {},
    social: {},
    ping: {}
};

/**
 * Initialize the default settings and provide any custom settings or overrides
 * @param custom Custom settings to append to or override the default settings
 * @param handlers Custom event handlers to append to or override the default event handlers
 */
export const initialize = (custom?: any, handlers?: any) => {
    globals = $.extend(true, {}, globals, custom);
    events = $.extend(true, {}, events, handlers);
};

/**
 * Intialize settings for a specific flow and provide and custom settings or overrides
 * @param settings Custom settings that are specific to this flow execution (based on the flowKey)
 * @param flowKey
 */
export const initializeFlow = (settings: any, flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    flows[lookUpKey] = $.extend(true, {}, globals, settings);
};

/**
 * Get the value of a specific setting. Checks global settings first, then flow specific settings (if the flowKey parameter is specified)
 * @param path The nested path of the flow specific setting to retrieve e.g. `formatting.isEnabled`
 * @param flowKey
 * @param defaultValue Value to return if no matching setting can be found
 */
export const global = (path: string, flowKey?: string, defaultValue?: any) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    const globalValue = Utils.getValueByPath(globals, path.toLowerCase());

    if (flowKey) {
        const flowValue = Utils.getValueByPath(flows[lookUpKey] || {}, path.toLowerCase());

        if (typeof flowValue !== 'undefined')
            return flowValue;
    }

    if (typeof globalValue !== 'undefined')
        return globalValue;
    else if (typeof defaultValue !== 'undefined')
        return defaultValue;

    return globalValue;
};

/**
 * Get a flow specific setting
 * @param path The nested path of the flow specific setting to retrieve e.g. `formatting.isEnabled`
 * @param flowKey
 */
export const flow = (path: string, flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (Utils.isNullOrWhitespace(path))
        return flows[lookUpKey];
    else
        return Utils.getValueByPath(flows[lookUpKey] || {}, path.toLowerCase());
};

/**
 * Get an event specific setting
 * @param path The nested path of the event specific setting to retrieve e.g. `invoke.done`
 */
export const event = (path: string) => {
    return Utils.getValueByPath(events, path.toLowerCase());
};

/**
 * Get a theme specific setting
 * @param path The nested path of the theme specific setting to retrieve
 */
export const theme = (path: string) => {
    return Utils.getValueByPath(themes, path.toLowerCase());
};

/**
 * Returns true if the execution mode of the flow is set to DEBUG or DEBUG_STEPTHROUGH. Set the value parameter to true to enable debug mode
 * @param flowKey
 * @param value True to set the debug mode to "DEBUG"
 */
export const isDebugEnabled = (flowKey: string, value?: boolean): boolean => {
    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (typeof value === 'undefined')
        return Utils.isEqual(this.flow('mode', flowKey), 'Debug', true) || Utils.isEqual(this.flow('mode', flowKey), 'Debug_StepThrough', true);
    else
        if (value)
            flows[lookUpKey].mode = 'Debug';
        else
            flows[lookUpKey].mode = '';
};

/**
 * Removes custom flow settings based on the flowkey
 * @param flowKey
 */
export const remove = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    flows[lookUpKey] == null;
    delete flows[lookUpKey];
};
