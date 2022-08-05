import { f, str } from '../test-utils';

import * as React from 'react';

import { shallow } from 'enzyme';

import TableInput from '../js/components/table-input';

import * as moment from 'moment';


describe('Table input component behaviour', () => {

    let tableInputWrapper;
    let val:any;
    val = str();

    const globalAny:any = global;

    const mockOnCommitted = jest.fn();

    function manyWhoMount(
        {
            contentType = 'string',
            value = val,
        } = {},
    ) {

        const props = {
            value,
            contentType,
            id: 'string',
            parentId: 'string',
            flowKey: 'string',
            contentFormat: 'string',
            propertyId: 'string',
            onCommitted: mockOnCommitted,
        };

        globalAny.window.manywho.component['contentTypes'] = {
            boolean: 'CONTENTBOOLEAN',
            content: 'CONTENTCONTENT',
            datetime: 'CONTENTDATETIME',
            date: 'CONTENTDATE',
            list: 'CONTENTLIST',
            number: 'CONTENTNUMBER',
            object: 'CONTENTOBJECT',
            password: 'CONTENTPASSWORD',
            string: 'CONTENTSTRING',
        };

        globalAny.window.manywho.model.setModal = jest.fn();
        return shallow(<TableInput {...props} />);
    }

    afterEach(() => {
        tableInputWrapper.unmount();
        mockOnCommitted.mockClear();
    });

    test('Table input component renders without crashing', () => {
        tableInputWrapper = manyWhoMount();
        expect(tableInputWrapper.length).toEqual(1);
    });

    test('Table input component gets registered', () => {
        tableInputWrapper = manyWhoMount();
        expect(globalAny.window.manywho.component.register).toHaveBeenCalled();
    });

    test('isEmptyDate identifies 01/01/0001 as empty date string', () => {
        tableInputWrapper = manyWhoMount();
        const date = '01/01/0001';

        expect(TableInput.prototype.isEmptyDate(date)).toBe(true);
    });

    test('isEmptyDate identifies 1/1/0001 as empty date string', () => {
        tableInputWrapper = manyWhoMount();
        const date = '1/1/0001';

        expect(TableInput.prototype.isEmptyDate(date)).toBe(true);
    });

    test('isEmptyDate identifies 0001-01-01 as empty date string', () => {
        tableInputWrapper = manyWhoMount();
        const date = '0001-01-01';

        expect(TableInput.prototype.isEmptyDate(date)).toBe(true);
    });

    test('isEmptyDate identifies null date', () => {
        tableInputWrapper = manyWhoMount();
        const date = null;

        expect(TableInput.prototype.isEmptyDate(date)).toBe(true);
    });

    test('isEmptyDate identifies empty date', () => {
        tableInputWrapper = manyWhoMount();
        const date = '';

        expect(TableInput.prototype.isEmptyDate(date)).toBe(true);
    });
    
    test('isEmptyDate identifies valid date', () => {
        tableInputWrapper = manyWhoMount();
        const date = Date();

        expect(TableInput.prototype.isEmptyDate(date)).toBe(false);
    });
    
    test('getInputType returns the correct type for CONTENTSTRING', () => {
        tableInputWrapper = manyWhoMount();
        
        expect(TableInput.prototype.getInputType('CONTENTSTRING')).toBe('text');
    });
    
    test('getInputType returns the correct type for CONTENTPASSWORD', () => {
        tableInputWrapper = manyWhoMount();
        
        expect(TableInput.prototype.getInputType('CONTENTPASSWORD')).toBe('password');
    });
    
    test('getInputType returns the correct type for CONTENTOBJECT', () => {
        tableInputWrapper = manyWhoMount();
        
        expect(TableInput.prototype.getInputType('CONTENTOBJECT')).toBe('text');
    });
    
    test('getInputType returns the correct type for CONTENTNUMBER', () => {
        tableInputWrapper = manyWhoMount();
        
        expect(TableInput.prototype.getInputType('CONTENTNUMBER')).toBe('number');
    });
    
    test('getInputType returns the correct type for CONTENTLIST', () => {
        tableInputWrapper = manyWhoMount();
        
        expect(TableInput.prototype.getInputType('CONTENTLIST')).toBe('text');
    });
    
    test('getInputType returns the correct type for CONTENTDATETIME', () => {
        tableInputWrapper = manyWhoMount();
        
        expect(TableInput.prototype.getInputType('CONTENTDATETIME')).toBe('datetime');
    });
    
    test('getInputType returns the correct type for CONTENTCONTENT', () => {
        tableInputWrapper = manyWhoMount();
        
        expect(TableInput.prototype.getInputType('CONTENTCONTENT')).toBe('text');
    });
    
    test('getInputType returns the correct type for CONTENTBOOLEAN', () => {
        tableInputWrapper = manyWhoMount();
        
        expect(TableInput.prototype.getInputType('CONTENTBOOLEAN')).toBe('checkbox');
    });
    
    test('change event on boolean input toggles value between true and false', () => {
        const setStateSpy = jest.spyOn(TableInput.prototype, 'setState');
        
        globalAny.window.manywho.utils.isEqual = x => x === 'CONTENTBOOLEAN';

        tableInputWrapper = manyWhoMount({
            contentType: 'CONTENTBOOLEAN',
            value: false,
        });

        tableInputWrapper.simulate('change');
        
        expect(setStateSpy).toHaveBeenLastCalledWith(expect.objectContaining({
            value: true,
        }));
    });
    
    test('change event on text input sets value on state', () => {
        const setStateSpy = jest.spyOn(TableInput.prototype, 'setState');
        const value1 = str();
        const value2 = str();

        const myEvent = {
            currentTarget: {
                value: value2,
            },
        };

        globalAny.window.manywho.utils.isEqual = f;

        tableInputWrapper = manyWhoMount({
            contentType: 'CONTENTSTRING',
            value: value1,
        });

        tableInputWrapper.simulate('change', myEvent);
        
        expect(setStateSpy).toHaveBeenLastCalledWith(expect.objectContaining({
            value: value2,
        }));
    });
    
    test('Pressing enter on input calls onCommit', () => {
        const setStateSpy = jest.spyOn(TableInput.prototype, 'setState');
        const value1 = str();
        const value2 = str();

        const myEvent = {
            currentTarget: {
                value: value2,
            },
        };

        globalAny.window.manywho.utils.isEqual = f;

        tableInputWrapper = manyWhoMount({
            contentType: 'CONTENTSTRING',
            value: value1,
        });

        tableInputWrapper.simulate('change', myEvent);
        
        expect(setStateSpy).toHaveBeenLastCalledWith(expect.objectContaining({
            value: value2,
        }));
    });
    
    test('Focussing on input sets isFocused on state to true', () => {
        const setStateSpy = jest.spyOn(TableInput.prototype, 'setState');

        tableInputWrapper = manyWhoMount();

        tableInputWrapper.simulate('focus');
        
        expect(setStateSpy).toHaveBeenLastCalledWith(expect.objectContaining({
            isFocused: true,
        }));
    });
    
    test('Blurring focus on input sets isFocused on state to false', () => {
        const setStateSpy = jest.spyOn(TableInput.prototype, 'setState');

        tableInputWrapper = manyWhoMount();

        tableInputWrapper.simulate('blur');
        
        expect(setStateSpy).toHaveBeenLastCalledWith(expect.objectContaining({
            isFocused: false,
        }));
    });

    test('input value is set to props.value', () => {
        const value1 = str();

        tableInputWrapper = manyWhoMount({
            contentType: 'CONTENTSTRING',
            value: value1,
        });

        expect(tableInputWrapper.find('input').first().props().value).toBe(value1);
    });

    test('Clicking datetime input renders modal', () => {
        const value1 = str();

        globalAny.window.manywho.utils.isEqual = jest.fn(() => true);

        tableInputWrapper = manyWhoMount({
            contentType: 'CONTENTDATETIME',
            value: value1,
        });

        tableInputWrapper.simulate('click', {
            stopPropagation: () => {
            },
        });

        expect(globalAny.window.manywho.model.setModal).toHaveBeenCalled();
    });

    test('Committing content boolean commits successfully', () => {
        // This must be false so that the isDateTimeInput fails
        globalAny.window.manywho.utils.isEqual = jest.fn(() => false);

        const value = true;

        tableInputWrapper = manyWhoMount({
            contentType: globalAny.window.manywho.component.contentTypes.boolean,
            value,
        });

        tableInputWrapper.instance().onCommit();

        expect(mockOnCommitted).toHaveBeenCalledWith('string', 'string', value);
    });

    test('Committing content string commits successfully', () => {
        // This must be false so that the isDateTimeInput fails
        globalAny.window.manywho.utils.isEqual = jest.fn(() => false);

        const value = 'true';

        tableInputWrapper = manyWhoMount({
            contentType: globalAny.window.manywho.component.contentTypes.string,
            value,
        });

        tableInputWrapper.instance().onCommit();

        expect(mockOnCommitted).toHaveBeenCalledWith('string', 'string', value);
    });

    test('Committing content number commits successfully', () => {
        // This must be false so that the isDateTimeInput fails
        globalAny.window.manywho.utils.isEqual = jest.fn(() => false);

        const value = 37;

        tableInputWrapper = manyWhoMount({
            contentType: globalAny.window.manywho.component.contentTypes.number,
            value,
        });

        tableInputWrapper.instance().onCommit();

        expect(mockOnCommitted).toHaveBeenCalledWith('string', 'string', value);
    });

    test('Committing content password commits successfully', () => {
        // This must be false so that the isDateTimeInput fails
        globalAny.window.manywho.utils.isEqual = jest.fn(() => false);

        const value = 'password';

        tableInputWrapper = manyWhoMount({
            contentType: globalAny.window.manywho.component.contentTypes.password,
            value,
        });

        tableInputWrapper.instance().onCommit();

        expect(mockOnCommitted).toHaveBeenCalledWith('string', 'string', value);
    });

    test('Committing content datetime commits successfully', () => {
        // This must be true so that the isDateTimeInput succeeds
        globalAny.window.manywho.utils.isEqual = jest.fn(() => true);

        const value = '02/02/0002';

        tableInputWrapper = manyWhoMount({
            contentType: globalAny.window.manywho.component.contentTypes.datetime,
            value,
        });

        tableInputWrapper.instance().onCommit();

        const expectedDate = moment(
            value, 
            ['MM/DD/YYYY hh:mm:ss A ZZ', moment.ISO_8601, 'string' || ''],
        ).format();

        expect(mockOnCommitted).toHaveBeenCalledWith('string', 'string', expectedDate);
    });

    test('Committing content date commits successfully', () => {
        globalAny.window.manywho.utils.isEqual = jest.fn((input, comparison) => { 
            if (comparison === 'CONTENTDATETIME') {
                return false;
            } 
            return true;
        });

        const value = '02/02/0002';

        tableInputWrapper = manyWhoMount({
            contentType: globalAny.window.manywho.component.contentTypes.date,
            value,
        });

        tableInputWrapper.instance().onCommit();

        const expectedDate = moment(
            value, 
            ['MM/DD/YYYY', 'string' || ''],
        ).format();

        expect(mockOnCommitted).toHaveBeenCalledWith('string', 'string', expectedDate);
    });
});
