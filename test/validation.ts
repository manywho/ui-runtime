import test from 'ava';
import * as Settings from '../js/services/settings';
import * as Validation from '../js/services/validation';

test.beforeEach(t => {
    Settings.initialize({
        validation: {
            isEnabled: true
        }
    }, null);

    t.pass();
});

test('Validate String', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null
    };
    const actual = Validation.validateString('test', null, null, false, null);

    t.deepEqual(actual, expected);
});

test('Validate String, required', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This field is required'
    };
    const actual = Validation.validateString('', null, null, true, null);

    t.deepEqual(actual, expected);
});

test('Validate String, regex valid', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null
    };
    const actual = Validation.validateString('ab', '.{2,}', null, false, null);

    t.deepEqual(actual, expected);
});

test('Validate String, regex invalid', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This value is invalid'
    };
    const actual = Validation.validateString('ab', '.{3,}', null, false, null);

    t.deepEqual(actual, expected);
});

test('Validate Boolean', (t) => {
    const expected = {
        isValid: true,
        validationMessage: true
    };
    const actual = Validation.validateBoolean(true, '', false, null);

    t.deepEqual(actual, expected);
});

test('Validate Boolean, required', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This field is required'
    };
    const actual = Validation.validateBoolean(false, null, true, null);

    t.deepEqual(actual, expected);
});

test('Validate Number', (t) => {
    const expected = {
        isValid: true,
        validationMessage: true
    };
    const actual = Validation.validateNumber(10, null, null, false, null);

    t.deepEqual(actual, expected);
});

test('Validate Number, required', (t) => {
    const expected = {
        isValid: true,
        validationMessage: true
    };
    const actual = Validation.validateNumber(10, null, null, true, null);

    t.deepEqual(actual, expected);
});

test('Validate Number, required and not defined', (t) => {
    let expected = {
        isValid: false,
        validationMessage: 'This field is required'
    };
    let actual = Validation.validateNumber(null, null, null, true, null);

    t.deepEqual(actual, expected);
});

test('Validate Number, NaN', (t) => {
    let expected = {
        isValid: false,
        validationMessage: 'This value is invalid'
    };
    let actual = Validation.validateNumber('number', null, null, false, null);

    t.deepEqual(actual, expected);
});

test('Validate Number, regex valid', (t) => {
    let expected = {
        isValid: true,
        validationMessage: true
    };
    let actual = Validation.validateNumber(10, '.{2,}', null, false, null);

    t.deepEqual(actual, expected);
});

test('Validate Number, regex invalid', (t) => {
    let expected = {
        isValid: false,
        validationMessage: 'This value is invalid'
    };
    let actual = Validation.validateNumber(10, '.{3,}', null, false, null);

    t.deepEqual(actual, expected);
});

test('Validate Object', (t) => {
    const expected = {
        isValid: true,
        validationMessage: true
    };
    const actual = Validation.validateObject({}, null, false, null);

    t.deepEqual(actual, expected);
});

test('Validate Object, required', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This field is required'
    };
    const actual = Validation.validateBoolean(null, null, true, null);

    t.deepEqual(actual, expected);
});

test('Validate List', (t) => {
    const expected = {
        isValid: true,
        validationMessage: true
    };
    const actual = Validation.validateList([{}], null, false, null);

    t.deepEqual(actual, expected);
});

test.failing('Validate List, required', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This field is required'
    };
    const actual = Validation.validateList([], null, true, null);

    t.deepEqual(actual, expected);
});

test('Validation Disabled', (t) => {
    Settings.initialize({
        validation: {
            isEnabled: false
        }
    }, null);

    const expected = {
        isValid: true,
        validationMessage: null
    };
    const actual = Validation.validate(null, null, null);

    t.deepEqual(actual, expected);
});

test('Invalid Model', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This field is required'
    };
    const actual = Validation.validate({ isValid: false }, null, null);

    t.deepEqual(actual, expected);
});

test('Validate State String', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null
    };

    const model = {
        contentType: 'ContentString',
        isRequired: true
    };
    const state = {
        contentValue: 'test'
    };

    const actual = Validation.validate(model, state, null);

    t.deepEqual(actual, expected);
});

test('Validate State String with attributes', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'custom message'
    };

    const model = {
        contentType: 'ContentString',
        isRequired: true,
        attributes: {
            validation: '.{5,}',
            validationMessage: 'custom message'
        }
    };
    const state = {
        contentValue: 'test'
    };

    const actual = Validation.validate(model, state, null);

    t.deepEqual(actual, expected);
});

test.failing('Validate State Number', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null
    };

    const model = {
        contentType: 'ContentNumber',
        isRequired: true
    };
    const state = {
        contentValue: 10
    };

    const actual = Validation.validate(model, state, null);

    t.deepEqual(actual, expected);
});

test.failing('Validate State Boolean (true)', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null
    };

    const model = {
        contentType: 'ContentBoolean',
        isRequired: true
    };
    const state = {
        contentValue: 'true'
    };

    const actual = Validation.validate(model, state, null);

    t.deepEqual(actual, expected);
});

test.failing('Validate State Boolean (false)', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null
    };

    const model = {
        contentType: 'ContentBoolean',
        isRequired: true
    };
    const state = {
        contentValue: 'false'
    };

    const actual = Validation.validate(model, state, null);

    t.deepEqual(actual, expected);
});

test.failing('Validate State Object', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null
    };

    const model = {
        contentType: 'ContentObject',
        isRequired: true
    };
    const state = {
        objectData: [{}]
    };

    const actual = Validation.validate(model, state, null);

    t.deepEqual(actual, expected);
});

test.failing('Validate State List', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null
    };

    const model = {
        contentType: 'ContentList',
        isRequired: true
    };
    const state = {
        objectData: [{}]
    };

    const actual = Validation.validate(model, state, null);
    t.deepEqual(actual, expected);
});
