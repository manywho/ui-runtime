import test from 'ava';
import mock from 'xhr-mock';
import * as Connection from '../js/services/connection';
import * as Settings from '../js/services/settings';

test.before((t) => {
    mock.setup();

    Settings.initialize(
        {
            platform: {
                uri: 'https://flow.manywho.com/',
            },
        },
        {
            myevent: {
                beforeSend: (xhr, request) => {
                    t.not(request, null);
                },
            },
        },
    );

    t.pass();
});

test.cb('Request', (t) => {
    t.plan(4);

    const payload = { request: 'test' };
    const url = 'https://flow.manywho.com/testurl';

    const expectedHeaders = {
        accept: 'application/json, text/javascript, */*; q=0.01',
        authorization: 'token',
        'content-type': 'application/json',
        manywhostate: 'stateId',
        manywhotenant: 'tenantId',
    };

    mock.post(url, (req, res) => {
        t.is(req.body(), JSON.stringify(payload));
        t.is(req.method(), 'POST');
        t.is(req.url().toString(), url);
        t.deepEqual(req.headers(), expectedHeaders);
        t.end();
        return res.status(200);
    });

    Connection.request(null, 'myevent', 'testurl', 'POST', 'tenantId', 'stateId', 'token', payload);
});

test.cb('Download Pdf', (t) => {
    t.plan(3);

    const url = 'https://flow.manywho.com/downloadpdf';

    const expectedHeaders = {
        accept: '*/*',
        authorization: 'token',
        manywhostate: 'stateId',
        manywhotenant: 'tenantId',
    };

    mock.get(url, (req, res) => {
        t.is(req.method(), 'GET');
        t.is(req.url().toString(), url);
        t.deepEqual(req.headers(), expectedHeaders);
        t.end();
        return res.status(200);
    });

    Connection.downloadPdf('myevent', 'downloadpdf', 'tenantId', 'token', 'stateId', 'filename');
});
