import * as Ajax from './ajax';
import * as Callbacks from './callbacks';
import * as Json from './json';
import * as State from './state';
import * as Utils from './utils';

/**
 * @hidden
 */
export const setAuthenticationToken = (authenticationToken, flowKey) => {
    State.setAuthenticationToken(authenticationToken, flowKey);
};

/**
 * Determine if the running user is authorized based on the response from the platform
 * @param response Response from `Ajax.initialize`, `Ajax.join` or `Ajax.invoke`
 * @param flowKey
 */
export const isAuthorized = (response: any, flowKey: string): boolean => {
    return !(response.authorizationContext != null
        && response.authorizationContext.directoryId != null
        && Utils.isNullOrWhitespace(State.getAuthenticationToken(flowKey)));
};

/**
 * Redirect to a provided OAuth2 or SAML url, or display the login dialog component
 * @param response Response from `Ajax.join` or `Ajax.invoke`
 * @param flowKey
 * @param onAuthenticated Callback after the running user has successfully authenticated using the Login dialog.
 * This does not get called when authenticated with OAuth2 or SAML.
 */
export const invokeAuthorization = (response: any, flowKey, onAuthenticated: Callbacks.ICallback) => {
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
            callback: onAuthenticated,
        },             flowKey);
    }
};

/**
 * Check the running users authentication (token & url) with a 3rd party service
 * @param loginUrl Url of the 3rd party service that the running users session information will be sent to
 * @param flowKey
 * @param onAuthenticated Callback with the response from `Ajax.sessionAuthentication`
 */
export const authorizeBySession = (loginUrl: string, flowKey: string, onAuthenticated: Callbacks.ICallback) => {
    const requestData = Json.generateSessionRequest(State.getSessionData(flowKey).id, State.getSessionData(flowKey).url, loginUrl);
    const state = State.getState(flowKey);

    Callbacks.register(flowKey, onAuthenticated);

    Ajax.sessionAuthentication(Utils.extractTenantId(flowKey), state.id, requestData, null)
        .then((response) => {
            State.setAuthenticationToken(response, flowKey);
            Callbacks.execute(flowKey, 'done', null, null, [response]);
        });
};
