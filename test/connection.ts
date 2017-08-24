import test from 'ava';
import * as mock from 'xhr-mock';
import * as FormData from 'form-data';
import Connection from '../js/services/connection';
import Settings from '../js/services/settings';

const flowKey = 'key1_key2_key3_key4';

test.before(t => {
    mock.setup();

    Settings.initialize({
        platform: {
            uri: 'https://flow.manywho.com/'
        }
    },
    {
        myevent: {
                beforeSend: (xhr, request) => {
                t.not(request, null);
            }
        }
    });

    t.pass();
});

test.cb('Request', t => {
    t.plan(4);

    const payload = { request: 'test' };
    const url = 'https://flow.manywho.com/testurl';

    const expectedHeaders = {
        accept: 'application/json, text/javascript, */*; q=0.01',
        authorization: 'token',
        'content-type': 'application/json',
        manywhostate: 'stateId',
        manywhotenant: 'tenantId'
    };

    mock.post(url, (req, res) => {
        t.is(req._body, JSON.stringify(payload));
        t.is(req._method, 'POST');
        t.is(req._url, url);
        t.deepEqual(req._headers, expectedHeaders);
        t.end();
        return res.status(200).body();
    });

    Connection.request(null, 'myevent', 'testurl', 'POST', 'tenantId', 'stateId', 'token', payload);
});

test.cb('Upload', (t) => {
    t.plan(3);

    const url = 'https://flow.manywho.com/fileupload';
    const formData = new FormData();
    formData.append('key', 'value');

    const onProgress = () => {
        return;
    };

    const expectedHeaders = {
        authorization: 'token',
        manywhotenant: 'tenantId'
    };

    mock.post(url, (req, res) => {
        t.is(req._method, 'POST');
        t.is(req._url, url);
        t.deepEqual(req._headers, expectedHeaders);
        t.end();
        return res.status(200).body();
    });

    Connection.upload(null, 'myevent', 'fileupload', formData, 'tenantId', 'token', onProgress);
});
