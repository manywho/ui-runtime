import test from 'ava';
import * as Callbacks from '../js/services/callbacks';

test.serial('Register', (t) => {
    Callbacks.register('key1_key2_key3_key4', {} as Callbacks.ICallback);
    t.pass();
});

test.serial('Remove', (t) => {
    const flowKey = 'key1_key2_key3_key4';
    Callbacks.register(flowKey, {} as Callbacks.ICallback);
    Callbacks.remove(flowKey);
    t.pass();
});

test.serial.cb('Execute', (t) => {
    const flowKey = 'key1_key2_key3_key4';
    const execute = (_response, t) => {
        t.pass();
        t.end();
    };

    Callbacks.register(flowKey, {
        execute,
        type: 'done',
        name: 'name',
        args: [t],
        repeat: false,
    });

    Callbacks.execute(flowKey, 'done', 'name', null, null);
});

test.serial('Execute filter by name', (t) => {
    const flowKey = 'key1_key2_key3_key4';
    const execute = (_response, t) => t.fail();

    Callbacks.register(flowKey, {
        execute,
        type: 'done',
        name: 'name',
        args: [t],
        repeat: false,
    });

    Callbacks.execute(flowKey, 'done', 'fail', null, null);

    t.pass();
});

test.serial('Execute filter by type', (t) => {
    const flowKey = 'key1_key2_key3_key4';
    const execute = (_response, t) => t.fail();

    Callbacks.register(flowKey, {
        execute,
        type: 'done',
        name: 'name',
        args: [t],
        repeat: false,
    });

    Callbacks.execute(flowKey, 'move', 'name', null, null);

    t.pass();
});

test.serial('Execute filter by map element', (t) => {
    const flowKey = 'key1_key2_key3_key4';
    const execute = (_response, t) => t.fail();

    Callbacks.register(flowKey, {
        execute,
        type: 'move',
        mapElement: 'mapElement',
        name: 'name',
        args: [t],
        repeat: false,
    });

    Callbacks.execute(flowKey, 'move', 'name', 'fail', null);

    t.pass();
});

test.serial.cb('Execute no args', (t) => {
    const flowKey = 'key1_key2_key3_key4';
    const execute = (_response, t) => {
        t.pass();
        t.end();
    };

    Callbacks.register(flowKey, {
        execute,
        type: 'done',
        name: 'name',
        repeat: false,
    });

    Callbacks.execute(flowKey, 'done', 'name', null, [t]);
});
