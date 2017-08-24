import test from 'ava';
import * as mock from 'xhr-mock';
import * as FormData from 'form-data';
import Ajax from '../js/services/ajax';
import Settings from '../js/services/settings';

const flowKey = 'key1_key2_key3_key4';

test.before(t => {
    mock.setup();

    Settings.initialize({
        platform: {
            uri: 'https://flow.manywho.com'
        }
    }, null);

    t.pass();
});

test.cb('Initialize', async t => {
    t.plan(4);

    const expectedHeaders = {
        accept: 'application/json, text/javascript, */*; q=0.01',
        authorization: 'token',
        'content-type': 'application/json',
        manywhostate: 'stateId',
        manywhotenant: 'tenantId'
    };

    const url = 'https://flow.manywho.com/api/run/1';
    const request = {
        flowId: {
            id: 'id',
            versionId: 'versionId'
        }
    };

    mock.post(url, (req, res) => {
        t.is(req._body, JSON.stringify(request));
        t.is(req._url, url);
        t.is(req._method, 'POST');
        t.deepEqual(req._headers, expectedHeaders);
        t.end();
        return res.status(200).body();
    });

    Ajax.initialize(request, 'tenantId', 'token');
});
