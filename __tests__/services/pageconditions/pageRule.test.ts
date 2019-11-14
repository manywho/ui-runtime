import PageRule from '../../../js/services/pageconditions/PageRule';
import { CRITERIA } from '../../../js/constants';

describe('Page rule expected behaviour', () => {
    test('When testing for equality that rule returns true when values are equal', () => {
        const result = PageRule(
            CRITERIA.isEqual,
            'test 1',
            { defaultContentValue: 'test 1' },
            {},
        );
        expect(result).toBeTruthy();
    });
    test('When testing for equality that rule returns false when values are not equal', () => {
        const result = PageRule(
            CRITERIA.isEqual,
            'test 1',
            { defaultContentValue: 'test 2' },
            {},
        );
        expect(result).toBeFalsy();
    });
    test('When testing for inequality that rule returns true when values are not equal', () => {
        const result = PageRule(
            CRITERIA.isNotEqual,
            'test 1',
            { defaultContentValue: 'test 2' },
            {},
        );
        expect(result).toBeTruthy();
    });
    test('When testing for inequality that rule returns false when values are equal', () => {
        const result = PageRule(
            CRITERIA.isNotEqual,
            'test 1',
            { defaultContentValue: 'test 1' },
            {},
        );
        expect(result).toBeFalsy();
    });
    test('When testing is empty that rule returns false when values are null/empty string/no object data', () => {
        const result = PageRule(
            CRITERIA.isEmpty,
            null,
            { defaultContentValue: 'true' },
            { objectData: null },
        );
        expect(result).toBeTruthy();
    });
    test('When testing is empty that rule returns true when values are not null/empty string/no object data', () => {
        const result = PageRule(
            CRITERIA.isEmpty,
            'test 1',
            { defaultContentValue: 'true' },
            { objectData: null },
        );
        expect(result).toBeFalsy();
    });
    test('When testing is not empty that rule returns false when values are null/empty string/no object data', () => {
        const result = PageRule(
            CRITERIA.isEmpty,
            null,
            { defaultContentValue: 'false' },
            { objectData: null },
        );
        expect(result).toBeFalsy();
    });
    test('When testing is not empty that rule returns true when values are not null/empty string/no object data', () => {
        const result = PageRule(
            CRITERIA.isEmpty,
            'test 1',
            { defaultContentValue: 'false' },
            { objectData: null },
        );
        expect(result).toBeTruthy();
    });
});
