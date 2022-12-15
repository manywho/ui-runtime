import test from 'ava';
import mock from 'xhr-mock';
import * as Ajax from '../js/services/ajax';
import * as Settings from '../js/services/settings';

test.before((t) => {
    mock.setup();

    Settings.initialize(
        {
            platform: {
                uri: 'https://flow.manywho.com',
            },
        },
        null,
    );

    t.pass();
});

test.afterEach.always(() => {
    mock.reset();
});

const stateId = 'stateId';
const tenantId = 'tenantId';
const token = 'token';
const stateToken = 'stateToken';

const expectedHeaders = {
    accept: 'application/json, text/javascript, */*; q=0.01',
    authorization: token,
    'content-type': 'application/json',
    manywhotenant: tenantId,
};

const expectedStateHeaders = Object.assign({}, expectedHeaders, {
    manywhostate: stateId,
});

test.serial.cb('Login', (t) => {
    t.plan(4);

    const loginStateId = 'loginstateid';

    const url = `https://flow.manywho.com/api/run/1/authentication/${loginStateId}`;
    const expected = {
        username: 'username',
        password: 'password',
        token: null,
        sessionToken: 'sessionId',
        sessionUrl: 'sessionUrl',
        loginUrl: 'loginUrl',
    };

    mock.post(url, (req, res) => {
        t.deepEqual(JSON.parse(req.body()), expected, 'Body');
        t.is(req.url().toString(), url);
        t.is(req.method(), 'POST');
        t.deepEqual(
            req.headers(),
            {
                accept: 'application/json, text/javascript, */*; q=0.01',
                'content-type': 'application/json',
                manywhotenant: tenantId,
            },
            'Headers',
        );
        t.end();
        return res.status(200);
    });

    Ajax.login(
        expected.loginUrl,
        expected.username,
        expected.password,
        expected.sessionToken,
        expected.sessionUrl,
        loginStateId,
        tenantId,
    );
});

test.serial.cb('Initialize', (t) => {
    t.plan(4);

    const url = 'https://flow.manywho.com/api/run/1';
    const request = {
        flowId: {
            id: 'id',
            versionId: 'versionId',
        },
    };

    mock.post(url, (req, res) => {
        t.is(req.body(), JSON.stringify(request));
        t.is(req.url().toString(), url);
        t.is(req.method(), 'POST');
        t.deepEqual(req.headers(), expectedHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.initialize(request, tenantId, token);
});

test.serial.cb('Flow Out', (t) => {
    t.plan(3);

    const url = `https://flow.manywho.com/api/run/1/state/out/${stateId}/outcomeId`;

    mock.post(url, (req, res) => {
        t.is(req.url().toString(), url);
        t.is(req.method(), 'POST');
        t.deepEqual(req.headers(), expectedStateHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.flowOut(stateId, tenantId, 'outcomeId', token);
});

test.serial.cb('Join', (t) => {
    t.plan(3);

    const url = `https://flow.manywho.com/api/run/1/state/${stateId}`;

    mock.get(url, (req, res) => {
        t.is(req.url().toString(), url);
        t.is(req.method(), 'GET');
        t.deepEqual(req.headers(), expectedStateHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.join(stateId, tenantId, token);
});

test.serial.cb('Invoke', (t) => {
    t.plan(4);

    const url = `https://flow.manywho.com/api/run/1/state/${stateId}`;
    const request = {
        stateId,
    };

    mock.post(url, (req, res) => {
        t.is(req.body(), JSON.stringify(request));
        t.is(req.url().toString(), url);
        t.is(req.method(), 'POST');
        t.deepEqual(req.headers(), expectedStateHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.invoke(request, tenantId, token);
});

test.serial.cb('Get Navigation', (t) => {
    t.plan(4);

    const url = `https://flow.manywho.com/api/run/1/navigation/${stateId}`;
    const request = {
        stateId,
        stateToken,
        navigationElementId: 'navigationElementId',
    };

    mock.post(url, (req, res) => {
        t.is(req.body(), JSON.stringify(request));
        t.is(req.url().toString(), url);
        t.is(req.method(), 'POST');
        t.deepEqual(req.headers(), expectedStateHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.getNavigation(stateId, stateToken, request.navigationElementId, tenantId, token);
});

test.serial.cb('Get Flow By Name', (t) => {
    t.plan(3);

    const flowName = 'myflow';
    const url = `https://flow.manywho.com/api/run/1/flow/name/${flowName}`;

    mock.get(url, (req, res) => {
        t.is(req.url().toString(), url);
        t.is(req.method(), 'GET');
        t.deepEqual(req.headers(), expectedHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.getFlowByName(flowName, tenantId, token);
});

test.serial.cb('ObjectData Request', (t) => {
    t.plan(4);

    const url = `https://flow.manywho.com/api/run/1/service/data`;
    const expected = {
        listFilter: {
            search: 'search',
            limit: 10,
            orderByPropertyDeveloperName: 'orderBy',
            orderByDirectionType: 'ASC',
            offset: 20,
        },
    };

    mock.post(url, (req, res) => {
        t.is(req.body(), JSON.stringify(expected));
        t.is(req.url().toString(), url);
        t.is(req.method(), 'POST');
        t.deepEqual(req.headers(), expectedStateHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.dispatchObjectDataRequest(
        {},
        tenantId,
        stateId,
        token,
        expected.listFilter.limit,
        expected.listFilter.search,
        expected.listFilter.orderByPropertyDeveloperName,
        expected.listFilter.orderByDirectionType,
        3,
    );
});

test.serial.cb('FileData Request', (t) => {
    t.plan(4);

    const url = `https://flow.manywho.com/api/run/1/service/file`;
    const expected = {
        listFilter: {
            search: 'search',
            limit: 10,
            orderByPropertyDeveloperName: 'orderBy',
            orderByDirectionType: 'ASC',
            offset: 20,
        },
    };

    mock.post(url, (req, res) => {
        t.is(req.body(), JSON.stringify(expected));
        t.is(req.url().toString(), url);
        t.is(req.method(), 'POST');
        t.deepEqual(req.headers(), expectedStateHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.dispatchFileDataRequest(
        {},
        tenantId,
        stateId,
        token,
        null,
        expected.listFilter.search,
        expected.listFilter.orderByPropertyDeveloperName,
        expected.listFilter.orderByDirectionType,
        3,
    );
});

test.serial.cb('Session Authentication', (t) => {
    t.plan(4);

    const url = `https://flow.manywho.com/api/run/1/authentication/${stateId}`;

    const expected = {
        session: 'session',
    };

    mock.post(url, (req, res) => {
        t.is(req.body(), JSON.stringify(expected));
        t.is(req.url().toString(), url);
        t.is(req.method(), 'POST');
        t.deepEqual(req.headers(), expectedStateHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.sessionAuthentication(tenantId, stateId, expected, token);
});

test.serial.cb('Ping', (t) => {
    t.plan(3);

    const url = `https://flow.manywho.com/api/run/1/state/${stateId}/ping/${stateToken}`;

    mock.get(url, (req, res) => {
        t.is(req.url().toString(), url);
        t.is(req.method(), 'GET');
        t.deepEqual(req.headers(), expectedStateHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.ping(tenantId, stateId, stateToken, token);
});

test.serial.cb('Get Execution Log', (t) => {
    t.plan(3);

    const flowId = 'flowId';
    const url = `https://flow.manywho.com/api/run/1/state/${stateId}/log`;

    mock.get(url, (req, res) => {
        t.is(req.url().toString(), url);
        t.is(req.method(), 'GET');
        t.deepEqual(req.headers(), expectedStateHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.getExecutionLog(tenantId, flowId, stateId, token);
});

test.serial.cb('Get Social Me', (t) => {
    t.plan(3);

    const streamId = 'streamId';
    const url = `https://flow.manywho.com/api/run/1/social/stream/${streamId}/user/me`;

    mock.get(url, (req, res) => {
        t.is(req.url().toString(), url);
        t.is(req.method(), 'GET');
        t.deepEqual(req.headers(), expectedStateHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.getSocialMe(tenantId, streamId, stateId, token);
});

test.serial.cb('Get Social Followers', (t) => {
    t.plan(3);

    const streamId = 'streamId';
    const url = `https://flow.manywho.com/api/run/1/social/stream/${streamId}/follower`;

    mock.get(url, (req, res) => {
        t.is(req.url().toString(), url);
        t.is(req.method(), 'GET');
        t.deepEqual(req.headers(), expectedStateHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.getSocialFollowers(tenantId, streamId, stateId, token);
});

test.serial.cb('Get Social Messages', (t) => {
    t.plan(3);

    const streamId = 'streamId';
    const page = 1;
    const pageSize = 10;
    const url = `https://flow.manywho.com/api/run/1/social/stream/${streamId}?page=${page}&pageSize=${pageSize}`;

    mock.get(url, (req, res) => {
        t.is(req.url().toString(), url);
        t.is(req.method(), 'GET');
        t.deepEqual(req.headers(), expectedStateHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.getSocialMessages(tenantId, streamId, stateId, page, pageSize, token);
});

test.serial.cb('Send Social Message', (t) => {
    t.plan(4);

    const streamId = 'streamId';
    const url = `https://flow.manywho.com/api/run/1/social/stream/${streamId}/message`;

    const expected = {
        message: 'hello',
    };

    mock.post(url, (req, res) => {
        t.is(req.body(), JSON.stringify(expected));
        t.is(req.url().toString(), url);
        t.is(req.method(), 'POST');
        t.deepEqual(req.headers(), expectedStateHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.sendSocialMessage(tenantId, streamId, stateId, expected, token);
});

test.serial.cb('Follow', (t) => {
    t.plan(3);

    const streamId = 'streamId';
    const url = `https://flow.manywho.com/api/run/1/social/stream/${streamId}?follow=true`;

    mock.post(url, (req, res) => {
        t.is(req.url(), url);
        t.is(req.method(), 'POST');
        t.deepEqual(req.headers(), expectedStateHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.follow(tenantId, streamId, stateId, true, token);
});

test.serial.cb('Get Social Users', (t) => {
    t.plan(3);

    const streamId = 'streamId';
    const name = 'name';
    const url = `https://flow.manywho.com/api/run/1/social/stream/${streamId}/user?name=${name}`;

    mock.get(url, (req, res) => {
        t.is(req.url().toString(), url);
        t.is(req.method(), 'GET');
        t.deepEqual(req.headers(), expectedStateHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.getSocialUsers(tenantId, streamId, stateId, name, token);
});

test.serial.cb('Download Pdf', (t) => {
    t.plan(3);

    const url = 'https://flow.manywho.com/api/run/1/state/stateId/download/fileId/filename';

    const expectedDownloadHeaders = {
        accept: '*/*',
        authorization: 'token',
        manywhostate: 'stateId',
        manywhotenant: 'tenantId',
    };

    mock.get(url, (req, res) => {
        t.is(req.method(), 'GET');
        t.is(req.url().toString(), url);
        t.deepEqual(req.headers(), expectedDownloadHeaders);
        t.end();
        return res.status(200);
    });

    Ajax.downloadPdf('stateId', 'fileId', 'filename', 'tenantId', 'token');
});
