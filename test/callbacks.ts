import test from 'ava'; // tslint:disable-line:import-name
import * as Callbacks from '../js/services/callbacks';

test('Register', (t) => {
    Callbacks.register('key1_key2_key3_key4', {} as Callbacks.ICallback);
    t.pass();
});

test('Remove', (t) => {
    const flowKey = 'key1_key2_key3_key4';
    Callbacks.register(flowKey, {} as Callbacks.ICallback);
    Callbacks.remove(flowKey);
    t.pass();
});

test('Execute', (t) => {
    const flowKey = 'key1_key2_key3_key4';
    const execute = (response, t) => t.pass();

    Callbacks.register(flowKey, {
        execute,
        type: 'done',
        name: 'name',
        args: [t],
        repeat: false,
    });

    Callbacks.execute(flowKey, 'done', 'name', null, null);
});

test('Execute filter by name', (t) => {
    const flowKey = 'key1_key2_key3_key4';
    const execute = (response, t) => t.fail();

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

test('Execute filter by type', (t) => {
    const flowKey = 'key1_key2_key3_key4';
    const execute = (response, t) => t.fail();

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

test('Execute filter by map element', (t) => {
    const flowKey = 'key1_key2_key3_key4';
    const execute = (response, t) => t.fail();

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

test('Execute no args', (t) => {
    const flowKey = 'key1_key2_key3_key4';
    const execute = (response, t) => t.pass();

    Callbacks.register(flowKey, {
        execute,
        type: 'done',
        name: 'name',
        repeat: false,
    });

    Callbacks.execute(flowKey, 'done', 'name', null, [t]);
});
