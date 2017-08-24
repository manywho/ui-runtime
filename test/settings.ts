import test from 'ava';
import Settings from '../js/services/settings';

const flowKey = 'key1_key2_key3_key4';

test.beforeEach(t => {
    Settings.initialize(null, null);
    Settings.initializeFlow({
        validation: {
            isEnabled: true
        }
    }, flowKey);
});

test('Global', (t) => {
    t.is(Settings.global('isFullWidth', null, null), false);
});

test('Global with Flow override', (t) => {
    t.is(Settings.global('validation.isEnabled', flowKey), true);
});

test('Global with Default override', (t) => {
    t.is(Settings.global('doesntexist', null, true), true);
});

test('Flow', (t) => {
    t.is(Settings.flow('validation.isenabled', flowKey), true);
});

test('Flow All', (t) => {
    t.not(Settings.flow(null, flowKey), null);
});

test('Event', (t) => {
    t.not(Settings.event('sync'), null);
});

test('Theme', (t) => {
    t.is(Settings.theme('url'), '/css/themes');
});

test('Is Debug Enabled, True', (t) => {
    Settings.isDebugEnabled(flowKey, true);
    t.is(Settings.isDebugEnabled(flowKey), true);
});

test('Is Debug Enabled, False', (t) => {
    Settings.isDebugEnabled(flowKey, false);
    t.is(Settings.isDebugEnabled(flowKey), false);
});

test('Remove', (t) => {
    Settings.remove(flowKey);
    t.pass();
});
