import test from 'ava';
import * as moment from 'moment';
import Formatting from '../js/services/formatting';
import Settings from '../js/services/settings';

const flowKey = 'key1_key2_key3_key4';

test.beforeEach(t => {
    Settings.initialize({
        formatting: {
            isEnabled: true
        }
    }, null);
})

test('Initialize', (t) => {
    Formatting.initialize(flowKey);
    t.pass();
});

test('Moment Format, Empty', (t) => {
    t.is(Formatting.toMomentFormat(null), null);
});

test('Moment Format', (t) => {
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

    mappings.forEach(mapping => {
        t.is(Formatting.toMomentFormat(mapping.format), mapping.moment);
    });
});

test('DateTime', (t) => {
    t.is(Formatting.format(moment().format(), 'YYYY', 'ContentDateTime', flowKey), '2017');
});

test('DateTime Year', (t) => {
    t.is(Formatting.dateTime(moment().format(), 'YYYY', flowKey), '2017');
});

test('Number', (t) => {
    t.is(Formatting.format(99, '%', 'ContentNumber', flowKey), '99%');
});

test('Number Percentage', (t) => {
    t.is(Formatting.number(99, '%', flowKey), '99%');
});

test('Number Decimal', (t) => {
    t.is(Formatting.number(12.345678, '##.00##', flowKey), '12.3457');
});

test('Number Empty String', (t) => {
    t.is(Formatting.number('', '##%', flowKey), '');
});

test('Number Currency', (t) => {
    t.plan(2);
    t.is(Formatting.number(99.9, 'c', flowKey), '$99.90');
    t.is(Formatting.number(99.9, 'C', flowKey), '$99.90');
});

test('Number Exponent', (t) => {
    t.plan(2);
    t.is(Formatting.number(99.9, 'e', flowKey), '9.99e+1');
    t.is(Formatting.number(99.9, 'E', flowKey), '9.99e+1');
});