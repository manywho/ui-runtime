import test from 'ava'; // tslint:disable-line:import-name
import * as mockery from 'mockery';
import * as sinon from 'sinon';

const model = {
    addNotification: sinon.stub(),
};

mockery.enable({
    useCleanCache: true,
    warnOnUnregistered: false,
});

mockery.registerMock('./model', model);

import * as Settings from '../js/services/settings';
import * as Validation from '../js/services/validation';

test.beforeEach((t) => {
    Settings.initialize(
        {
            validation: {
                isEnabled: true,
                scroll: {
                    isEnabled: true,
                },
            },
        },
        null,
    );

    t.pass();
});

test('Validate String', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null,
    };
    const actual = Validation.validateString('test', null, null, false, null);

    t.deepEqual(actual, expected);
});

test('Validate String, required', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This field is required',
    };
    const actual = Validation.validateString('', null, null, true, null);

    t.deepEqual(actual, expected);
});

test('Validate String, regex valid', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null,
    };
    const actual = Validation.validateString('ab', '.{2,}', null, false, null);

    t.deepEqual(actual, expected);
});

test('Validate String, regex invalid', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This value is invalid',
    };
    const actual = Validation.validateString('ab', '.{3,}', null, false, null);

    t.deepEqual(actual, expected);
});

test('Validate Boolean', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null,
    };
    const actual = Validation.validateBoolean(true, '', false, null);

    t.deepEqual(actual, expected);
});

test('Validate Boolean, required', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This field is required',
    };
    const actual = Validation.validateBoolean(false, null, true, null);

    t.deepEqual(actual, expected);
});

test('Validate Number', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null,
    };
    const actual = Validation.validateNumber(10, null, null, false, null);

    t.deepEqual(actual, expected);
});

test('Validate Number, required', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null,
    };
    const actual = Validation.validateNumber(10, null, null, true, null);

    t.deepEqual(actual, expected);
});

test('Validate Number, required and not defined', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This field is required',
    };
    const actual = Validation.validateNumber(null, null, null, true, null);

    t.deepEqual(actual, expected);
});

test('Validate Number, NaN', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This value is invalid',
    };
    const actual = Validation.validateNumber('number', null, null, false, null);

    t.deepEqual(actual, expected);
});

test('Validate Number, regex valid', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null,
    };
    const actual = Validation.validateNumber(10, '.{2,}', null, false, null);

    t.deepEqual(actual, expected);
});

test('Validate Number, regex invalid', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This value is invalid',
    };
    const actual = Validation.validateNumber(10, '.{3,}', null, false, null);

    t.deepEqual(actual, expected);
});

test('Validate Object', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null,
    };
    const actual = Validation.validateObject({}, null, false, null);

    t.deepEqual(actual, expected);
});

test('Validate Object, required', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This field is required',
    };
    const actual = Validation.validateBoolean(null, null, true, null);

    t.deepEqual(actual, expected);
});

test('Validate List', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null,
    };
    const actual = Validation.validateList([{}], null, false, null);

    t.deepEqual(actual, expected);
});

test('Validate List, required', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This field is required',
    };
    const actual = Validation.validateList([], null, true, null);

    t.deepEqual(actual, expected);
});

test('Validation Disabled', (t) => {
    Settings.initialize(
        {
            validation: {
                isEnabled: false,
            },
        },
        null,
    );

    const expected = {
        isValid: true,
        validationMessage: null,
    };
    const actual = Validation.validate(null, null, null);

    t.deepEqual(actual, expected);
});

test('Invalid Model', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This field is required',
    };
    const actual = Validation.validate({ isValid: false }, null, null);

    t.deepEqual(actual, expected);
});

test('Validate State String', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null,
    };

    const model = {
        contentType: 'ContentString',
        isRequired: true,
    };
    const state = {
        contentValue: 'test',
    };

    const actual = Validation.validate(model, state, null);

    t.deepEqual(actual, expected);
});

test('Validate State String with attributes', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'custom message',
    };

    const model = {
        contentType: 'ContentString',
        isRequired: true,
        attributes: {
            validation: '.{5,}',
            validationMessage: 'custom message',
        },
    };
    const state = {
        contentValue: 'test',
    };

    const actual = Validation.validate(model, state, null);

    t.deepEqual(actual, expected);
});

test('Validate State Number', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null,
    };

    const model = {
        contentType: 'ContentNumber',
        isRequired: true,
    };
    const state = {
        contentValue: 10,
    };

    const actual = Validation.validate(model, state, null);

    t.deepEqual(actual, expected);
});

test('Validate State Boolean (true)', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null,
    };

    const model = {
        contentType: 'ContentBoolean',
        isRequired: true,
    };
    const state = {
        contentValue: 'true',
    };

    const actual = Validation.validate(model, state, null);

    t.deepEqual(actual, expected);
});

test('Validate State Boolean (false)', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This field is required',
    };

    const model = {
        contentType: 'ContentBoolean',
        isRequired: true,
    };
    const state = {
        contentValue: 'false',
    };

    const actual = Validation.validate(model, state, null);

    t.deepEqual(actual, expected);
});

test('Scroll to invalid element', (t) => {
    const invalidElement = document.createElement('div');
    invalidElement.classList.add('has-error');
    document.body.appendChild(invalidElement);

    try {
        Validation.scrollToInvalidElement(null);
    }
    catch (e) {

    }

    t.pass();
});

test('Add Notification', (t) => {
    const flowKey = 'flowKey';
    const expected = {
        dismissible: true,
        message: 'Page contains invalid values',
        position: 'center',
        timeout: '0',
        type: 'danger',
    };

    Validation.addNotification(flowKey);

    t.true(model.addNotification.calledOnce);
    t.is(model.addNotification.firstCall.args[0], flowKey);
    t.deepEqual(model.addNotification.firstCall.args[1], expected);
});

test('Non-visible components validate as true - same as back-end rules', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null,
    };

    const model = {
        isVisible: false,
    };
    const actual = Validation.validate(model, null, null);

    t.deepEqual(actual, expected);
});

test('Visible components validate false when required but empty', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This field is required',
    };

    const model = {
        isVisible: true,
        isRequired: true,
        contentType: 'ContentString',
    };
    const state = {
        contentValue: '',
    };

    const actual = Validation.validate(model, state, null);

    t.deepEqual(actual, expected);
});

test('Visible components validate true when required but non-empty', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null,
    };

    const model = {
        isVisible: true,
        isRequired: true,
        contentType: 'ContentString',
    };
    const state = {
        contentValue: 'OK',
    };

    const actual = Validation.validate(model, state, null);

    t.deepEqual(actual, expected);
});

test('Disabled components validate as true - same as back-end rules', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null,
    };

    const model = {
        isEnabled: false,
    };
    const actual = Validation.validate(model, null, null);

    t.deepEqual(actual, expected);
});

test('Enabled components validate false when required but empty', (t) => {
    const expected = {
        isValid: false,
        validationMessage: 'This field is required',
    };

    const model = {
        isEnabled: true,
        isRequired: true,
        contentType: 'ContentString',
    };
    const state = {
        contentValue: '',
    };

    const actual = Validation.validate(model, state, null);

    t.deepEqual(actual, expected);
});

test('Enabled components validate true when required but non-empty', (t) => {
    const expected = {
        isValid: true,
        validationMessage: null,
    };

    const model = {
        isEnabled: true,
        isRequired: true,
        contentType: 'ContentString',
    };
    const state = {
        contentValue: 'OK',
    };

    const actual = Validation.validate(model, state, null);

    t.deepEqual(actual, expected);
});
