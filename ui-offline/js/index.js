import { request, uploadFiles, initialize } from './services/Connection';

// Component required to be included in bundle and register itself
import App from './components/App';
import '../css/offline.less';

const window2 = window;

/**
 * The request module needs to hang off of the manywho global
 * so that api requests can be intercepted
 * when a flow is running offline
 */
if (window && window2.manywho) {
    window2.manywho.connection.request = request;
    window2.manywho.connection.uploadFiles = uploadFiles;

    // The ui cores initialize function needs to be overridden
    // because when there are already cached requests for that flow
    // when it is initialized we actually want to force the ui's join behaviour.
    // This is to prevent the the flow from moving once initialzed,
    // (the default behaviour) when what we actually want the flow to do is
    // pick up where it had been left which is determined in the cached data in indexdb.
    window2.manywho.engine.originalInitialize = window2.manywho.engine.initialize;
    window2.manywho.engine.initialize = initialize;
    window2.manywho.settings.initialize({
        components: {
            static: [
                App,
            ],
        },
    });
}
