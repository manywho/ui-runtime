import * as React from 'react';
import { shallow } from 'enzyme';

import Content, { checkCharacterLength } from '../js/components/content';

describe('Content component behaviour', () => {

    let componentWrapper;

    const globalAny:any = global;

    window.tinymce = {
        get: () => {
            return true;
        },
        trim: (): string => 'abc123',
        dom: {
            Event: {
                cancel: (): Function => jest.fn(),
            },
        },
    };

    function manyWhoMount(label = null) {

        return shallow(<Content />);
    }

    afterEach(() => {
        if (componentWrapper) {
            componentWrapper.unmount();
        }
    });

    test('Component renders without crashing', () => {
        componentWrapper = manyWhoMount();
        expect(componentWrapper.length).toEqual(1);
    });

    test('Component gets registered', () => {
        componentWrapper = manyWhoMount();
        expect(globalAny.window.manywho.component.register)
        .toHaveBeenCalledWith('content', Content); 
    });

    test('Max character length has been reached', () => {
        const result: boolean = checkCharacterLength('KeyD', 6, 'abc1234');
        expect(result).toBe(true);
    });

    test('Max character length has not been reached', () => {
        const result: boolean = checkCharacterLength('KeyD', 6, 'abc12');
        expect(result).toBe(false);
    });

    test('Max character length can be reduced', () => {
        const resultOne: boolean = checkCharacterLength('Backspace', 6, 'abc1234');
        expect(resultOne).toBe(false);

        const resultTwo: boolean = checkCharacterLength('Delete', 6, 'abc1234');
        expect(resultTwo).toBe(false);

        const resultThree: boolean = checkCharacterLength('ArrowUp', 6, 'abc1234');
        expect(resultThree).toBe(false);

        const resultFour: boolean = checkCharacterLength('ArrowDown', 6, 'abc1234');
        expect(resultFour).toBe(false);

        const resultFive: boolean = checkCharacterLength('ArrowRight', 6, 'abc1234');
        expect(resultFive).toBe(false);

        const resultSix: boolean = checkCharacterLength('ArrowLeft', 6, 'abc1234');
        expect(resultSix).toBe(false);
    });
});
