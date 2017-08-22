import test from 'ava';
import Authorization from '../js/services/authorization';
import State from '../js/services/state';

const flowKey = 'key1_key2_key3_key4';

test.beforeEach(t => {
    Authorization.setAuthenticationToken(null, flowKey);
});

test('Is Authorized', (t) => {
    Authorization.setAuthenticationToken('token', flowKey);

    const response = {
        authorizationContext: {
            directoryId: 'test'
        }
    };

    t.is(Authorization.isAuthorized(response, flowKey), true);
});

test('Is Not Authorized 1', (t) => {
    const response = {
        authorizationContext: {
            directoryId: 'test'
        }
    };

    t.is(Authorization.isAuthorized(response, flowKey), false);
});

test('Is Not Authorized 2', (t) => {
    Authorization.setAuthenticationToken('token', flowKey);

    const response = {
        authorizationContext: {
            directoryId: null
        }
    };

    t.is(Authorization.isAuthorized(response, flowKey), false);
});

test('Is Not Authorized 3', (t) => {
    Authorization.setAuthenticationToken('token', flowKey);
    t.is(Authorization.isAuthorized({}, flowKey), false);
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
    }

    t.deepEqual(State.getLogin(flowKey), expected);
});

test('Invoke Authorization OAuth2', (t) => {
    const response = {
        authorizationContext: {
            authenticationType: 'oauth2',
            loginUrl: 'loginUrl'
        }
    };

    Authorization.invokeAuthorization(response, flowKey, null);

    t.is(window.location.href, response.authorizationContext.loginUrl);
});

test('Invoke Authorization SAML', (t) => {
    const response = {
        authorizationContext: {
            authenticationType: 'saml',
            loginUrl: 'loginUrl'
        }
    };

    Authorization.invokeAuthorization(response, flowKey, null);

    t.is(window.location.href, response.authorizationContext.loginUrl);
});

