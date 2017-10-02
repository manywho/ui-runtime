

import Ajax from './ajax';
import * as Callbacks from './callbacks';
import Json from './json';
import State from './state';
import Utils from './utils';

declare var manywho: any;

export default {

    setAuthenticationToken(authenticationToken, flowKey) {
        State.setAuthenticationToken(authenticationToken, flowKey);
    },

    isAuthorized(response, flowKey) {
        return !(response.authorizationContext != null
            && response.authorizationContext.directoryId != null
            && Utils.isNullOrWhitespace(State.getAuthenticationToken(flowKey)));
    },

    invokeAuthorization(response, flowKey, doneCallback) {
        if (response.authorizationContext != null && response.authorizationContext.directoryId != null) {

            if (Utils.isEqual(response.authorizationContext.authenticationType, 'oauth2', true)) {
                window.location.href = response.authorizationContext.loginUrl;
                return;
            }

            if (Utils.isEqual(response.authorizationContext.authenticationType, 'saml', true)) {
                window.location.href = response.authorizationContext.loginUrl;
                return;
            }

            State.setLogin({
                isVisible: true,
                directoryId: response.authorizationContext.directoryId,
                directoryName: response.authorizationContext.directoryName,
                loginUrl: response.authorizationContext.loginUrl,
                stateId: response.stateId,
                callback: doneCallback
            }, flowKey);
        }
    },

    authorizeBySession(loginUrl, flowKey, doneCallback) {
        const requestData = Json.generateSessionRequest(State.getSessionData(flowKey).id, State.getSessionData(flowKey).url, loginUrl);
        const state = State.getState(flowKey);

        Callbacks.register(flowKey, doneCallback);

        Ajax.sessionAuthentication(Utils.extractTenantId(flowKey), state.id, requestData, null)
            .then(function (response) {
                State.setAuthenticationToken(response, flowKey);
                Callbacks.execute(flowKey, 'done', null, null, [response]);
            });
    }

};
