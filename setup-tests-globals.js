const Utils = require("./ui-core/js/services/utils");

/**
 * A setup files used by jest for adding
 * mock objects to the global namespace that
 * the Tooling expects to be there.
 */

const t = () => true;
const f = () => false;
const obj = () => ({});
const arr = () => [];
const noop = () => {};
const str = () => "xxx";

// eslint-disable-next-line import/no-extraneous-dependencies
window.moment = require("moment");

window.metaData = {};

jest.mock("localforage", () => ({
  setDriver: jest.fn(
    () =>
      new Promise((resolve) => {
        resolve(true);
      })
  ),
  removeItem: jest.fn(
    () =>
      new Promise((resolve) => {
        resolve(true);
      })
  ),
  getItem: jest.fn(
    () =>
      new Promise((resolve) => {
        resolve(true);
      })
  ),
  setItem: jest.fn(
    () =>
      new Promise((resolve) => {
        resolve(true);
      })
  ),
  createInstance: jest.fn(
    () =>
      new Promise((resolve) => {
        resolve(true);
      })
  ),
}));

window.manywho = {
  adminTenantId: "test",
  cdnUrl: "",
  component: {
    handleEvent: jest.fn(),
    getChildComponents: jest.fn(),
    getByName: jest.fn(),
    getOutcomes: jest.fn(),
    getSelectedRows: jest.fn(),
    onOutcome: jest.fn(),
    register: jest.fn(),
    registerItems: jest.fn(),
    registerContainer: jest.fn(),
    getDisplayColumns: jest.fn(arr),
    focusInput: jest.fn(),
    mixins: {
      enterKeyHandler: {
        onEnter: jest.fn(),
      },
    },
    contentTypes: {
      string: "CONTENTSTRING",
      number: "CONTENTNUMBER",
      boolean: "CONTENTBOOLEAN",
      password: "CONTENTPASSWORD",
      encrypted: "CONTENTENCRYPTED",
      datetime: "CONTENTDATETIME",
      date: "CONTENTDATE",
      content: "CONTENTCONTENT",
      object: "CONTENTOBJECT",
      list: "CONTENTLIST",
    },
  },
  log: {
    info: jest.fn(),
    error: jest.fn(),
  },
  styling: {
    registerContainer: jest.fn(),
    getClasses: jest.fn(arr),
  },
  model: {
    addNotification: jest.fn(),
    getChildren: jest.fn(arr),
    getComponent: jest.fn(obj),
    getContainer: jest.fn(() => ({
      containerType: "xxx",
    })),
    getAttributes: jest.fn(obj),
    getDefaultNavigationId: jest.fn(str),
    getInvokeType: jest.fn(() => "xxx"),
    getOutcomes: jest.fn(),
    getModal: jest.fn(),
    getLabel: jest.fn(),
    getNavigation: jest.fn(),
    getOutcome: jest.fn(() => ({
      attributes: {},
      pageActionType: "xxx",
    })),
    getNotifications: jest.fn(arr),
    getHistory: jest.fn(arr),
    getHistoricalNavigation: jest.fn(obj),
    getMapElement: jest.fn(obj),
  },
  state: {
    getComponent: jest.fn(),
    setComponent: jest.fn(obj),
    getComponents: jest.fn(obj),
    getAuthenticationToken: jest.fn(),
    getState: jest.fn(() => ({ token: "test" })),
  },
  utils: {
    convertToArray: jest.fn(arr),
    isNullOrUndefined: jest.fn(t),
    extractElement: jest.fn(),
    removeLoadingIndicator: jest.fn(),
    guid: jest.fn(str),
    extend: jest.fn(),
    extractFlowId: jest.fn(),
    extractStateId: jest.fn(),
    extractFlowVersionId: jest.fn(),
    extractTenantId: jest.fn(),
    getFlowKey: jest.fn(),
    isNullOrEmpty: jest.fn(
      (input) => typeof input === "undefined" || input === null || input === ""
    ),
    isNullOrWhitespace: jest.fn(
      (input) =>
        typeof input === "undefined" ||
        input === null ||
        input.replace(/\s/g, "").length < 1
    ),
    isEqual: jest.fn(Utils.isEqual),
  },
  tours: {
    getTargetElement: jest.fn(() => ({
      getBoundingClientRect: jest.fn(),
    })),
  },
  settings: {
    // global: jest.fn(arr),
    isDebugEnabled: jest.fn(f),
    flow: jest.fn(),
    initialize: jest.fn(),
    global: jest.fn((a) => {
      if (a === "offline.cache.requests.limit") {
        return 250;
      }

      if (a === "offline.cache.requests.pageSize") {
        return 10;
      }

      if (a === "platform.uri") {
        return "https://flow.manywho.com";
      }

      if (a === "components.static") {
        return [];
      }

      if (a === "files.downloadUriPropertyId") {
        return "aaa";
      }

      return "https://example.com";
    }),
  },
  social: {
    getStream: jest.fn(),
  },
  formatting: {
    toMomentFormat: jest.fn(str),
    format: jest.fn(),
  },
  engine: {
    objectDataRequest: jest.fn(),
    fileDataRequest: jest.fn(),
    navigate: jest.fn(),
  },
  ajax: {
    dispatchObjectDataRequest: jest.fn(() =>
      Promise.resolve({ objectData: [] })
    ),
    invoke: jest.fn(),
  },
  pollInterval: 1000,
};
