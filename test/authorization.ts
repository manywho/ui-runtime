import test from 'ava';
import Authorization from '../js/services/authorization';
import State from '../js/services/state';

const flowKey = 'key1_key2_key3_key4';

test.beforeEach(t => {
    Authorization.setAuthenticationToken(null, flowKey);
    State.setLogin(null, flowKey);
});

test('Is Authorized', (t) => {
    Authorization.setAuthenticationToken('token', flowKey);
    t.is(Authorization.isAuthorized({}, flowKey), true);
});

test('Is Not Authorized', (t) => {
    const response = {
        authorizationContext: {
            directoryId: 'test'
        }
    };

    t.is(Authorization.isAuthorized(response, flowKey), false);
});

test('Invoke Authorization', (t) => {
    const response = {
        authorizationContext: {
            directoryId: 'id',
            directoryName: 'name',
            loginUrl: 'loginUrl'
        },
        stateId: 'stateId'
    };

    Authorization.invokeAuthorization(response, flowKey, null);

    const expected = {
        isVisible: true,
        directoryId: response.authorizationContext.directoryId,
        directoryName: response.authorizationContext.directoryName,
        loginUrl: response.authorizationContext.loginUrl,
        stateId: response.stateId,
        callback: null
    };

    t.deepEqual(State.getLogin(flowKey), expected);
});

test('Invoke Authorization OAuth2', (t) => {
    const response = {
        authorizationContext: {
            directoryId: 'id',
            authenticationType: 'oauth2',
            loginUrl: 'https://flow.manywho.com'
        }
    };

    Authorization.invokeAuthorization(response, flowKey, null);

    t.is(State.getLogin(flowKey), null);
});

test('Invoke Authorization SAML', (t) => {
    const response = {
        authorizationContext: {
            directoryId: 'id',
            authenticationType: 'saml',
            loginUrl: 'https://flow.manywho.com'
        }
    };

    Authorization.invokeAuthorization(response, flowKey, null);

    t.is(State.getLogin(flowKey), null);
});

