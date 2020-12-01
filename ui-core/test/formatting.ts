import test from 'ava'; // tslint:disable-line:import-name
import * as moment from 'moment';
import * as Formatting from '../js/services/formatting';
import * as Settings from '../js/services/settings';

const flowKey = 'key1_key2_key3_key4';

test.beforeEach((t) => {
    Settings.initialize(
        {
            formatting: {
                isEnabled: true,
            },
        }, 
        null,
    );
});

test.serial('Initialize', (t) => {
    Formatting.initialize(flowKey);
    t.pass();
});

test.serial('Disabled', (t) => {
    Settings.initialize(
        {
            formatting: {
                isEnabled: false,
            },
        }, 
        null,
    );
    t.is(Formatting.format('test', 'format', null, flowKey), 'test');
});

test.serial('Unsupported ContentType', (t) => {
    t.is(Formatting.format('test', 'format', 'ContentObject', flowKey), 'test');
});

test.serial('Moment Format, Empty', (t) => {
    t.is(Formatting.toMomentFormat(null), null);
});

test.serial('Moment Format', (t) => {
    const mappings = [
        { format: 'd', moment: 'l' },
        { format: 'D', moment: 'dddd, MMMM DD, YYYY' },
        { format: 'f', moment: 'LLLL' },
        { format: 'F', moment: 'dddd, LL LTS' },
        { format: 'g', moment: 'L LT' },
        { format: 'G', moment: 'L LTS' },
        { format: 'm', moment: 'MMMM D' },
        { format: 'r', moment: 'ddd, DD MMM YYYY HH:mm:ss [GMT]' },
        { format: 's', moment: 'YYYY-MM-DD[T]HH:mm:ss' },
        { format: 't', moment: 'LT' },
        { format: 'T', moment: 'LTS' },
        { format: 'u', moment: 'YYYY-MM-DD HH:mm:ss[Z]' },
        { format: 'U', moment: 'dddd, LL LTS' },
        { format: 'y', moment: 'MMMM YYYY' },
        { format: 'zzz', moment: 'ZZ' },
    ];

    t.plan(mappings.length);

    mappings.forEach((mapping) => {
        t.is(Formatting.toMomentFormat(mapping.format), mapping.moment);
    });
});

test.serial('DateTime Disabled', (t) => {
    Settings.initialize(
        {
            formatting: {
                isEnabled: false,
            },
        }, 
        null,
    );

    const expected = moment();

    t.is(Formatting.dateTime(expected.format(), 'YYYY', flowKey), expected.format());
});

test.serial('DateTime', (t) => {
    const year = new Date().getFullYear();
    t.is(Formatting.format(moment().format(), 'YYYY', 'ContentDateTime', flowKey), year.toString());
});

test.serial('DateTime Year', (t) => {
    const year = new Date().getFullYear();
    t.is(Formatting.dateTime(moment().format(), 'YYYY', flowKey), year.toString());
});

test.serial('Override Timezone Offset', (t) => {
    Settings.initialize(
        {
            i18n: {
                overrideTimezoneOffset: true,
            },
        },
        null,
    );

    const now = moment();
    const expected = moment();
    expected.local();

    t.is(Formatting.dateTime(now.format(), 'G', flowKey), expected.format('L LTS'));
});

test.serial('DateTime Invalid', (t) => {
    t.is(Formatting.dateTime('not a date', 'YYYY', flowKey), 'not a date');
});

test.serial('Timezone Offset', (t) => {
    Settings.initialize(
        {
            i18n: {
                overrideTimezoneOffset: true,
                timezoneOffset: -8,
            },
        },
        null,
    );

    t.is(Formatting.dateTime(moment().format(), 'Z', flowKey), '-08:00');
});

test.serial('Number', (t) => {
    t.is(Formatting.format(99, '000', 'ContentNumber', flowKey), '099');
});

test.serial('Number Percentage', (t) => {
    t.is(Formatting.number(0.99, '%', flowKey), '99%');
});

test.serial('Number Decimal', (t) => {
    t.is(Formatting.number(12.345678, '##.00##', flowKey), '12.3457');
});

test.serial('Number Empty String', (t) => {
    t.is(Formatting.number('', '##%', flowKey), '');
});

test.serial('Number Currency', (t) => {
    t.plan(2);
    t.is(Formatting.number(99.9, 'c', flowKey), '$99.90');
    t.is(Formatting.number(99.9, 'C', flowKey), '$99.90');
});

test.serial('Number Exponent', (t) => {
    t.plan(2);
    t.is(Formatting.number(99.9, 'e', flowKey), '9.99e+1');
    t.is(Formatting.number(99.9, 'E', flowKey), '9.99e+1');
});

test.serial('Number Unformatted', (t) => {
    t.is(Formatting.number(99.9, null, flowKey), '99.9');
});

test.serial('Number Unsupported format', (t) => {
    t.is(Formatting.number(99.9, '##.11', flowKey), '99.90');
});
