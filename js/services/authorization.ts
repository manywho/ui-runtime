/// <reference path="../../typings/index.d.ts" />

import Ajax from './ajax';

declare var manywho: any;

export default {

    setAuthenticationToken(authenticationToken, flowKey) {
        manywho.state.setAuthenticationToken(authenticationToken, flowKey);
    },

    isAuthorized(response, flowKey) {
        return !(response.authorizationContext != null
            && response.authorizationContext.directoryId != null
            && manywho.utils.isNullOrWhitespace(manywho.state.getAuthenticationToken(flowKey)));
    },

    invokeAuthorization(response, flowKey, doneCallback) {
        if (response.authorizationContext != null && response.authorizationContext.directoryId != null) {

            if (manywho.utils.isEqual(response.authorizationContext.authenticationType, 'oauth2', true)) {
                window.location.href = response.authorizationContext.loginUrl;
                return;
            }

            if (manywho.utils.isEqual(response.authorizationContext.authenticationType, 'saml', true)) {
                window.location.href = response.authorizationContext.loginUrl;
                return;
            }

            manywho.state.setLogin({
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
        const requestData = manywho.json.generateSessionRequest(manywho.state.getSessionData(flowKey).id, manywho.state.getSessionData(flowKey).url, loginUrl);
        const state = manywho.state.getState(flowKey);

        manywho.callbacks.register(flowKey, doneCallback);

        Ajax.sessionAuthentication(manywho.utils.extractTenantId(flowKey), state.id, requestData, null)
            .then(function (response) {
                manywho.state.setAuthenticationToken(response, flowKey);
                manywho.callbacks.execute(flowKey, 'done', null, null, [response]);
            });
    }

};
