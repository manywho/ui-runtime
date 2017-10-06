
import 'script-loader!../node_modules/numbro/dist/numbro.min.js';
import 'script-loader!../node_modules/numbro/dist/languages.min.js';
import './lib/polyfills';

import * as Ajax from './services/ajax';
import * as Authorization from './services/authorization';
import * as Callbacks from './services/callbacks';
import * as Collaboration from './services/collaboration';
import * as Component from './services/component';
import * as Connection from './services/connection';
import * as Engine from './services/engine';
import * as Formatting from './services/formatting';
import * as Json from './services/json';
import Log from './services/log';
import * as Model from './services/model';
import * as Settings from './services/settings';
import * as Social from './services/social';
import * as State from './services/state';
import * as Styling from './services/styling';
import * as Tours from './services/tours';
import * as Utils from './services/utils';
import * as Validation from './services/validation';

const window2 = window as any;

if (window && window2.manywho) {
    window2.manywho.ajax = Ajax;
    window2.manywho.authorization = Authorization;
    window2.manywho.callbacks = Callbacks;
    window2.manywho.collaboration = Collaboration;
    window2.manywho.component = Component;
    window2.manywho.connection = Connection;
    window2.manywho.engine = Engine;
    window2.manywho.formatting = Formatting;
    window2.manywho.json = Json;
    window2.manywho.log = Log;
    window2.manywho.model = Model;
    window2.manywho.settings = Settings;
    window2.manywho.social = Social;
    window2.manywho.state = State;
    window2.manywho.styling = Styling;
    window2.manywho.tours = Tours;
    window2.manywho.utils = Utils;
    window2.manywho.validation = Validation;
}

export {
    Ajax,
    Authorization,
    Callbacks,
    Collaboration,
    Component,
    Connection,
    Engine,
    Formatting,
    Json,
    Log,
    Model,
    Settings,
    Social,
    State,
    Styling,
    Tours,
    Utils,
    Validation
};
