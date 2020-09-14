import Rules from '../../js/services/Rules';

declare let manywho: any;

// Helper to create a value object for Rules
const value = (val:any):any => ({ contentValue: val, defaultContentValue: null });

describe('Rules service Outcomes', () => {

    const original = Rules.evaluateComparisons;

    afterEach(() => {
        Rules.evaluateComparisons = original;
    });

    test('No Outcomes returns null', () => {
        expect(Rules.getOutcome(null, null, null)).toBeNull();
    });

    test('Empty Outcomes returns null', () => {
        expect(Rules.getOutcome([], null, null)).toBeNull();
    });

    test('Outcomes without comparison returns first outcome', () => {
        const outcomes = [
            { name: 'Outcome 0', order: 0 },
        ];
        expect(Rules.getOutcome(outcomes, null, null)).toEqual(outcomes[0]);

        const outcomes2 = [
            { name: 'Outcome 1', order: 1 },
            { name: 'Outcome 0', order: 0 },
        ];
        expect(Rules.getOutcome(outcomes2, null, null)).toEqual(outcomes2[1]);
    });

    test('Outcomes with a comparison returns first outcome that evaluates true', () => {

        Rules.evaluateComparisons = jest.fn().mockImplementation((comparison) => comparison[0].mockReturn);

        const outcomes = [
            { name: 'Outcome 0', order: 0, comparison: { mockReturn: false } },
            { name: 'Outcome 1', order: 1, comparison: { mockReturn: true } },
            { name: 'Outcome 2', order: 2, comparison: { mockReturn: true } },
        ];
        expect(Rules.getOutcome(outcomes, null, null)).toEqual(outcomes[1]);
    });

    test('Outcomes with a mixture of comparisons returns first without a comparison', () => {

        Rules.evaluateComparisons = jest.fn().mockImplementation((comparison) => comparison[0].mockReturn);

        const outcomes = [
            { name: 'Outcome 0', order: 0, comparison: { mockReturn: false } },
            { name: 'Outcome 1', order: 1, comparison: { mockReturn: false } },
            { name: 'Outcome 2', order: 2 },
            { name: 'Outcome 3', order: 3, comparison: { mockReturn: true } },
        ];
        expect(Rules.getOutcome(outcomes, null, null)).toEqual(outcomes[2]);
    });
});

describe('Rules service Comparisons', () => {

    const original = Rules.evaluateRules;

    beforeEach(() => {
        Rules.evaluateRules = jest.fn().mockImplementation((rules) => rules.mockReturn);
    });

    afterEach(() => {
        Rules.evaluateRules = original;
    });

    test('No comparisons returns false', () => {
        expect(Rules.evaluateComparisons([], null, null)).toBeFalsy();
    });

    test('No rules returns false', () => {
        expect(Rules.evaluateComparisons([{ rules: null, comparisons: null, comparisonType: 'OR' }], null, null)).toBeFalsy();
    });

    test('That a Rule is evaluated', () => {
        const comparisons = [
            { rules: { mockReturn: true }, comparisons: null, comparisonType: 'OR' },
        ];

        expect(Rules.evaluateComparisons(comparisons, null, null)).toBeTruthy();
        expect(Rules.evaluateRules).toBeCalledTimes(1);
    });

    test('That a single Rule is evaluated with the AND comparison', () => {
        const comparisons = [
            { rules: { mockReturn: true }, comparisons: null, comparisonType: 'AND' },
        ];

        expect(Rules.evaluateComparisons(comparisons, null, null)).toBeTruthy();
        expect(Rules.evaluateRules).toBeCalledTimes(1);
    });

    test('That only the first Rule is evaluated with an OR', () => {
        const comparisons = [
            { rules: { mockReturn: true }, comparisons: null, comparisonType: 'OR' },
            { rules: { mockReturn: true }, comparisons: null, comparisonType: 'OR' },
        ];

        expect(Rules.evaluateComparisons(comparisons, null, null)).toBeTruthy();
        expect(Rules.evaluateRules).toBeCalledTimes(1);
    });

    test('That both the Rules are evaluated with an OR, first Rule evaluates to false', () => {
        const comparisons = [
            { rules: { mockReturn: false }, comparisons: null, comparisonType: 'OR' },
            { rules: { mockReturn: true }, comparisons: null, comparisonType: 'OR' },
        ];

        expect(Rules.evaluateComparisons(comparisons, null, null)).toBeTruthy();
        expect(Rules.evaluateRules).toBeCalledTimes(2);
    });

    test('That false is returned if all Rules are false', () => {
        const comparisons = [
            { rules: { mockReturn: false }, comparisons: null, comparisonType: 'OR' },
            { rules: { mockReturn: false }, comparisons: null, comparisonType: 'OR' },
        ];

        expect(Rules.evaluateComparisons(comparisons, null, null)).toBeFalsy();
        expect(Rules.evaluateRules).toBeCalledTimes(2);
    });

    test('That false is returned if all Rules are false with AND comparisonType', () => {
        const comparisons = [
            { rules: { mockReturn: false }, comparisons: null, comparisonType: 'AND' },
            { rules: { mockReturn: false }, comparisons: null, comparisonType: 'AND' },
        ];

        expect(Rules.evaluateComparisons(comparisons, null, null)).toBeFalsy();
        expect(Rules.evaluateRules).toBeCalledTimes(1);
    });

    test('That true is returned if all Rules are true with AND comparisonType', () => {
        const comparisons = [
            { rules: { mockReturn: true }, comparisons: null, comparisonType: 'AND' },
            { rules: { mockReturn: true }, comparisons: null, comparisonType: 'AND' },
        ];

        expect(Rules.evaluateComparisons(comparisons, null, null)).toBeTruthy();
        expect(Rules.evaluateRules).toBeCalledTimes(2);
    });

    test('That false is returned if the first Rule evaluates false with AND comparisonType', () => {
        const comparisons = [
            { rules: { mockReturn: true }, comparisons: null, comparisonType: 'AND' },
            { rules: { mockReturn: false }, comparisons: null, comparisonType: 'AND' },
        ];

        expect(Rules.evaluateComparisons(comparisons, null, null)).toBeFalsy();
        expect(Rules.evaluateRules).toBeCalledTimes(2);
    });

    test('That false is returned if the second Rule evaluates false with AND comparisonType', () => {
        const comparisons = [
            { rules: { mockReturn: false }, comparisons: null, comparisonType: 'AND' },
            { rules: { mockReturn: true }, comparisons: null, comparisonType: 'AND' },
        ];

        expect(Rules.evaluateComparisons(comparisons, null, null)).toBeFalsy();
        expect(Rules.evaluateRules).toBeCalledTimes(1);
    });

    test('That the last rule is not evaluated due to AND short-circuit', () => {
        const comparisons = [
            { rules: { mockReturn: true }, comparisons: null, comparisonType: 'AND' },
            { rules: { mockReturn: true }, comparisons: null, comparisonType: 'AND' },
            { rules: { mockReturn: false }, comparisons: null, comparisonType: 'AND' },
            { rules: { mockReturn: true }, comparisons: null, comparisonType: 'AND' },
        ];

        expect(Rules.evaluateComparisons(comparisons, null, null)).toBeFalsy();
        expect(Rules.evaluateRules).toBeCalledTimes(3);
    });

    test('That all four Rules are evaluated', () => {
        const comparisons = [
            { rules: { mockReturn: true }, comparisons: null, comparisonType: 'AND' },
            { rules: { mockReturn: true }, comparisons: null, comparisonType: 'AND' },
            { rules: { mockReturn: true }, comparisons: null, comparisonType: 'AND' },
            { rules: { mockReturn: true }, comparisons: null, comparisonType: 'AND' },
        ];

        expect(Rules.evaluateComparisons(comparisons, null, null)).toBeTruthy();
        expect(Rules.evaluateRules).toBeCalledTimes(4);
    });

    test('That nested comparisons are evaluated', () => {
        const comparisons = [
            {
                comparisons: [
                    {
                        comparisons: [
                            {
                                comparisons: null,
                                comparisonType: 'AND',
                                rules: { mockReturn: true },
                            },
                        ],
                        comparisonType: 'AND',
                        rules: { mockReturn: true },
                    },
                ],
                comparisonType: 'AND',
                rules: { mockReturn: true },
            },
        ];

        expect(Rules.evaluateComparisons(comparisons, null, null)).toBeTruthy();
        expect(Rules.evaluateRules).toBeCalledTimes(3);
    });

    test('That inner nested false AND comparisons are honoured', () => {
        const comparisons = [
            {
                comparisons: [
                    {
                        comparisons: [
                            {
                                comparisons: null,
                                comparisonType: 'AND',
                                rules: { mockReturn: false },
                            },
                        ],
                        comparisonType: 'AND',
                        rules: { mockReturn: true },
                    },
                ],
                comparisonType: 'AND',
                rules: { mockReturn: true },
            },
        ];

        expect(Rules.evaluateComparisons(comparisons, null, null)).toBeFalsy();
        expect(Rules.evaluateRules).toBeCalledTimes(3);
    });

    test('That inner nested true OR comparisons are honoured', () => {
        const comparisons = [
            {
                comparisons: [
                    {
                        comparisons: [
                            {
                                comparisons: null,
                                comparisonType: 'AND',
                                rules: { mockReturn: true },
                            },
                        ],
                        comparisonType: 'OR',
                        rules: { mockReturn: false },
                    },
                ],
                comparisonType: 'AND',
                rules: { mockReturn: true },
            },
        ];

        expect(Rules.evaluateComparisons(comparisons, null, null)).toBeTruthy();
        expect(Rules.evaluateRules).toBeCalledTimes(3);
    });
});

describe('Rules service Rules', () => {

    jest.mock('../../js/models/State', () => ({
        getStateValue: jest.fn((stateValue) => stateValue),
    }));

    const snapshot = {
        getValue(v) {
            return v;
        },
    };

    test('Empty rules returns false', () => {
        expect(Rules.evaluateRules([], null, null, null)).toBeFalsy();
    });

    test('Single rule EQUAL with AND returns true', () => {
        const rules = [
            {
                criteriaType: 'EQUAL',
                leftValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
                rightValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
            },
        ];

        expect(Rules.evaluateRules(rules, 'AND', null, snapshot)).toBeTruthy();
    });

    test('Single rule EQUAL with OR returns true', () => {
        const rules = [
            {
                criteriaType: 'EQUAL',
                leftValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
                rightValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
            },
        ];

        expect(Rules.evaluateRules(rules, 'OR', null, snapshot)).toBeTruthy();
    });

    test('Multiple rules honour OR comparison', () => {
        const rules = [
            {
                criteriaType: 'EQUAL',
                leftValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
                rightValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
            },
            {
                criteriaType: 'GREATER_THAN',
                leftValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
                rightValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
            },
        ];

        // First rule === true, Second rule === false
        expect(Rules.evaluateRules(rules, 'OR', null, snapshot)).toBeTruthy();
    });

    test('Multiple rules honour OR comparison when false', () => {
        const rules = [
            {
                criteriaType: 'EQUAL',
                leftValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
                rightValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 2,
                    defaultContentValue: null,
                },
            },
            {
                criteriaType: 'GREATER_THAN',
                leftValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
                rightValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
            },
        ];

        // First rule === false, Second rule === false
        expect(Rules.evaluateRules(rules, 'OR', null, snapshot)).toBeFalsy();
    });

    test('Multiple rules honour AND comparison when false', () => {
        const rules = [
            {
                criteriaType: 'EQUAL',
                leftValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
                rightValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
            },
            {
                criteriaType: 'GREATER_THAN',
                leftValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
                rightValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
            },
        ];

        // First rule === true, Second rule === false
        expect(Rules.evaluateRules(rules, 'AND', null, snapshot)).toBeFalsy();
    });

    test('Multiple rules honour AND comparison when false', () => {
        const rules = [
            {
                criteriaType: 'EQUAL',
                leftValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 2,
                    defaultContentValue: null,
                },
                rightValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
            },
            {
                criteriaType: 'GREATER_THAN',
                leftValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 2,
                    defaultContentValue: null,
                },
                rightValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
            },
        ];

        // First rule === false, Second rule === true
        expect(Rules.evaluateRules(rules, 'AND', null, snapshot)).toBeFalsy();
    });

    test('Multiple rules honour AND comparison when true', () => {
        const rules = [
            {
                criteriaType: 'EQUAL',
                leftValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
                rightValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
            },
            {
                criteriaType: 'GREATER_THAN',
                leftValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 2,
                    defaultContentValue: null,
                },
                rightValueElementToReferenceId: {
                    contentType: manywho.component.contentTypes.number,
                    contentValue: 1,
                    defaultContentValue: null,
                },
            },
        ];

        // First rule === true, Second rule === true
        expect(Rules.evaluateRules(rules, 'AND', null, snapshot)).toBeTruthy();
    });
});

describe('Rules service Content Object expected behaviour', () => {

    test('The IS_EMPTY criteria for an empty Content Object', () => {
        expect(Rules.compareValues({ objectData: [] }, null, manywho.component.contentTypes.object, 'IS_EMPTY')).toBeTruthy();
    });

    test('The IS_EMPTY criteria for a null Content Object', () => {
        expect(Rules.compareValues({ objectData: null }, null, manywho.component.contentTypes.object, 'IS_EMPTY')).toBeTruthy();
    });

    test('The IS_EMPTY criteria for a Content Object with no objectData', () => {
        expect(Rules.compareValues(null, null, manywho.component.contentTypes.object, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues({}, null, manywho.component.contentTypes.object, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues({ foo: 1 }, null, manywho.component.contentTypes.object, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues('', null, manywho.component.contentTypes.object, 'IS_EMPTY')).toBeTruthy();
    });

    test('The IS_EMPTY criteria for a non-empty Content Object', () => {
        expect(Rules.compareValues({ objectData: [1] }, null, manywho.component.contentTypes.object, 'IS_EMPTY')).toBeFalsy();
    });

    test('Invalid criteria for a non-empty Content Object', () => {
        expect(Rules.compareValues({ objectData: [1] }, null, manywho.component.contentTypes.object, 'BAD_CRITERIA')).toBeFalsy();
    });

    test('Invalid criteria for an empty Content Object', () => {
        expect(Rules.compareValues({ objectData: [] }, null, manywho.component.contentTypes.object, 'BAD_CRITERIA')).toBeFalsy();
    });

    test('EQUAL criteria for a Content Object', () => {
        expect(Rules.compareValues({ objectData: [] }, { objectData: [] }, manywho.component.contentTypes.object, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues({ objectData: [] }, { objectData: [1] }, manywho.component.contentTypes.object, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues({ contentValue: 'a', objectData: null },
            { contentValue: 'a', objectData: null }, manywho.component.contentTypes.object, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues({ contentValue: 'a', objectData: null },
            { contentValue: 'b', objectData: null }, manywho.component.contentTypes.object, 'EQUAL')).toBeFalsy();
    });

    test('NOT_EQUAL criteria for a Content Object', () => {
        expect(Rules.compareValues({ objectData: [] }, { objectData: [] }, manywho.component.contentTypes.object, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues({ objectData: [] }, { objectData: [1] }, manywho.component.contentTypes.object, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues({ contentValue: 'a', objectData: null },
            { contentValue: 'a', objectData: null }, manywho.component.contentTypes.object, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues({ contentValue: 'a', objectData: null },
            { contentValue: 'b', objectData: null }, manywho.component.contentTypes.object, 'NOT_EQUAL')).toBeTruthy();
    });

    test('Unsupported criteria for a Content Object', () => {
        expect(Rules.compareValues({ objectData: [] }, { objectData: [1] }, manywho.component.contentTypes.object, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues({ objectData: [] }, { objectData: [1] }, manywho.component.contentTypes.object, 'GREATER_THAN_OR_EQUAL'))
            .toBeFalsy();
        expect(Rules.compareValues({ objectData: [] }, { objectData: [1] }, manywho.component.contentTypes.object, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues({ objectData: [] }, { objectData: [1] }, manywho.component.contentTypes.object, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues({ objectData: [{ contentValue: 'foo' }] }, 'f', manywho.component.contentTypes.object, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues({ objectData: [{ contentValue: 'foo' }] }, 'o', manywho.component.contentTypes.object, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues({ objectData: [{ contentValue: 'foo' }] }, 'o', manywho.component.contentTypes.object, 'CONTAINS')).toBeFalsy();
    });

});

describe('Rules service Content List expected behaviour', () => {

    test('The IS_EMPTY criteria for an empty Content List', () => {
        expect(Rules.compareValues({ objectData: [] }, null, manywho.component.contentTypes.list, 'IS_EMPTY')).toBeTruthy();
    });

    test('The IS_EMPTY criteria for a null Content List', () => {
        expect(Rules.compareValues({ objectData: null }, null, manywho.component.contentTypes.list, 'IS_EMPTY')).toBeTruthy();
    });

    test('The IS_EMPTY criteria for a Content List with no objectData', () => {
        expect(Rules.compareValues(null, null, manywho.component.contentTypes.list, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues({}, null, manywho.component.contentTypes.list, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues({ foo: 1 }, null, manywho.component.contentTypes.list, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues('', null, manywho.component.contentTypes.list, 'IS_EMPTY')).toBeTruthy();
    });

    test('The IS_EMPTY criteria for a non-empty Content List', () => {
        expect(Rules.compareValues({ objectData: [1, 2, 3] }, null, manywho.component.contentTypes.list, 'IS_EMPTY')).toBeFalsy();
    });

    test('Invalid criteria for a non-empty Content List', () => {
        expect(Rules.compareValues({ objectData: [1] }, null, manywho.component.contentTypes.list, 'BAD_CRITERIA')).toBeFalsy();
    });

    test('Invalid criteria for an empty Content List', () => {
        expect(Rules.compareValues({ objectData: [] }, null, manywho.component.contentTypes.list, 'BAD_CRITERIA')).toBeFalsy();
    });

    test('Unsupported criteria for a Content List', () => {
        expect(Rules.compareValues({ objectData: [] }, { objectData: [] }, manywho.component.contentTypes.list, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues({ objectData: [] }, { objectData: [1] }, manywho.component.contentTypes.list, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues({ objectData: [] }, { objectData: [1] }, manywho.component.contentTypes.list, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues({ objectData: [] }, { objectData: [1] }, manywho.component.contentTypes.list, 'GREATER_THAN_OR_EQUAL'))
            .toBeFalsy();
        expect(Rules.compareValues({ objectData: [] }, { objectData: [1] }, manywho.component.contentTypes.list, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues({ objectData: [] }, { objectData: [1] }, manywho.component.contentTypes.list, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues({ objectData: [{ contentValue: 'foo' }] }, 'f', manywho.component.contentTypes.list, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues({ objectData: [{ contentValue: 'foo' }] }, 'o', manywho.component.contentTypes.list, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues({ objectData: [{ contentValue: 'foo' }] }, 'o', manywho.component.contentTypes.list, 'CONTAINS')).toBeFalsy();
    });
});

describe('Rules service Content String expected behaviour', () => {

    test('Invalid criteria for an empty string', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.string, 'BAD_CRITERIA')).toBeFalsy();
    });

    test('String Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.string, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.string, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.string, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.string, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.string, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.string, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('abcd'), manywho.component.contentTypes.string, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('abcde'), manywho.component.contentTypes.string, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('ebcd'), manywho.component.contentTypes.string, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('abc'), manywho.component.contentTypes.string, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(' abcd '), manywho.component.contentTypes.string, 'EQUAL')).toBeFalsy();
    });

    test('String Not Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.string, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.string, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.string, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.string, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.string, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.string, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('abcd'), manywho.component.contentTypes.string, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('abcde'), manywho.component.contentTypes.string, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('ebcd'), manywho.component.contentTypes.string, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('abc'), manywho.component.contentTypes.string, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value(' abcd '), manywho.component.contentTypes.string, 'NOT_EQUAL')).toBeTruthy();
    });

    test('String Greater Than', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.string, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.string, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.string, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.string, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.string, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.string, 'GREATER_THAN')).toBeFalsy();

        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.string, 'GREATER_THAN')).toBeTruthy();
        expect(Rules.compareValues(value('b1'), value('b0'), manywho.component.contentTypes.string, 'GREATER_THAN')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value('b'), manywho.component.contentTypes.string, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('a0'), value('a1'), manywho.component.contentTypes.string, 'GREATER_THAN')).toBeFalsy();
    });

    test('String Less Than', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.string, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.string, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.string, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.string, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.string, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.string, 'LESS_THAN')).toBeFalsy();

        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.string, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('b1'), value('b0'), manywho.component.contentTypes.string, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value('b'), manywho.component.contentTypes.string, 'LESS_THAN')).toBeTruthy();
        expect(Rules.compareValues(value('a0'), value('a1'), manywho.component.contentTypes.string, 'LESS_THAN')).toBeTruthy();
    });

    test('String Greater Than Or Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.string, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.string, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.string, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.string, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.string, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.string, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.string, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('b1'), value('b0'), manywho.component.contentTypes.string, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('cc'), value('cc'), manywho.component.contentTypes.string, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value('b'), manywho.component.contentTypes.string, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('a0'), value('a1'), manywho.component.contentTypes.string, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
    });

    test('String Less Than Or Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.string, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.string, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.string, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.string, 'LESS_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.string, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.string, 'LESS_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.string, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('b1'), value('b0'), manywho.component.contentTypes.string, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('cc'), value('cc'), manywho.component.contentTypes.string, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value('b'), manywho.component.contentTypes.string, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('a0'), value('a1'), manywho.component.contentTypes.string, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
    });

    test('String Starts With', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.string, 'STARTS_WITH')).toBeTruthy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.string, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.string, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.string, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.string, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.string, 'STARTS_WITH')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value('ab'), manywho.component.contentTypes.string, 'STARTS_WITH')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('e'), manywho.component.contentTypes.string, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('a '), manywho.component.contentTypes.string, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value('abcd'), manywho.component.contentTypes.string, 'STARTS_WITH')).toBeFalsy();
    });

    test('String Ends With', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.string, 'ENDS_WITH')).toBeTruthy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.string, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.string, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.string, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.string, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.string, 'ENDS_WITH')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value('cd'), manywho.component.contentTypes.string, 'ENDS_WITH')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('d'), manywho.component.contentTypes.string, 'ENDS_WITH')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('c'), manywho.component.contentTypes.string, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('d '), manywho.component.contentTypes.string, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value('abcd'), manywho.component.contentTypes.string, 'ENDS_WITH')).toBeFalsy();
    });

    test('String Contains', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.string, 'CONTAINS')).toBeTruthy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.string, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.string, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.string, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.string, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.string, 'CONTAINS')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value('ab'), manywho.component.contentTypes.string, 'CONTAINS')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value(''), manywho.component.contentTypes.string, 'CONTAINS')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('bc'), manywho.component.contentTypes.string, 'CONTAINS')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('e'), manywho.component.contentTypes.string, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('a '), manywho.component.contentTypes.string, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value('abcd'), manywho.component.contentTypes.string, 'CONTAINS')).toBeFalsy();
    });

    test('String Is Empty', () => {
        expect(Rules.compareValues(value(''), value(true), manywho.component.contentTypes.string, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(true), manywho.component.contentTypes.string, 'IS_EMPTY')).toBeTruthy();

        expect(Rules.compareValues(value(true), value(true), manywho.component.contentTypes.string, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(true), manywho.component.contentTypes.string, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(true), manywho.component.contentTypes.string, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value(true), manywho.component.contentTypes.string, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(' '), value(true), manywho.component.contentTypes.string, 'IS_EMPTY')).toBeFalsy();
    });

    test('String Is Not Empty', () => {
        expect(Rules.compareValues(value(''), value(false), manywho.component.contentTypes.string, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(false), manywho.component.contentTypes.string, 'IS_EMPTY')).toBeFalsy();

        expect(Rules.compareValues(value(false), value(false), manywho.component.contentTypes.string, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(false), value(false), manywho.component.contentTypes.string, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value(false), manywho.component.contentTypes.string, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value(false), manywho.component.contentTypes.string, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(' '), value(false), manywho.component.contentTypes.string, 'IS_EMPTY')).toBeTruthy();
    });
});

describe('Rules service Content Content expected behaviour', () => {

    test('Invalid criteria for an empty content', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.content, 'BAD_CRITERIA')).toBeFalsy();
    });

    test('Content Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.content, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.content, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.content, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.content, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.content, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.content, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('abcd'), manywho.component.contentTypes.content, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('abcde'), manywho.component.contentTypes.content, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('ebcd'), manywho.component.contentTypes.content, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('abc'), manywho.component.contentTypes.content, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(' abcd '), manywho.component.contentTypes.content, 'EQUAL')).toBeFalsy();
    });

    test('Content Not Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.content, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.content, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.content, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.content, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.content, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.content, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('abcd'), manywho.component.contentTypes.content, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('abcde'), manywho.component.contentTypes.content, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('ebcd'), manywho.component.contentTypes.content, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('abc'), manywho.component.contentTypes.content, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value(' abcd '), manywho.component.contentTypes.content, 'NOT_EQUAL')).toBeTruthy();
    });

    test('Content Greater Than', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.content, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.content, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.content, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.content, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.content, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.content, 'GREATER_THAN')).toBeFalsy();

        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.content, 'GREATER_THAN')).toBeTruthy();
        expect(Rules.compareValues(value('b1'), value('b0'), manywho.component.contentTypes.content, 'GREATER_THAN')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value('b'), manywho.component.contentTypes.content, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('a0'), value('a1'), manywho.component.contentTypes.content, 'GREATER_THAN')).toBeFalsy();
    });

    test('Content Less Than', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.content, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.content, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.content, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.content, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.content, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.content, 'LESS_THAN')).toBeFalsy();

        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.content, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('b1'), value('b0'), manywho.component.contentTypes.content, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value('b'), manywho.component.contentTypes.content, 'LESS_THAN')).toBeTruthy();
        expect(Rules.compareValues(value('a0'), value('a1'), manywho.component.contentTypes.content, 'LESS_THAN')).toBeTruthy();
    });

    test('Content Greater Than Or Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.content, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.content, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.content, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.content, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.content, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.content, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.content, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('b1'), value('b0'), manywho.component.contentTypes.content, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('cc'), value('cc'), manywho.component.contentTypes.content, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value('b'), manywho.component.contentTypes.content, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('a0'), value('a1'), manywho.component.contentTypes.content, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
    });

    test('Content Less Than Or Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.content, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.content, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.content, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.content, 'LESS_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.content, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.content, 'LESS_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.content, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('b1'), value('b0'), manywho.component.contentTypes.content, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('cc'), value('cc'), manywho.component.contentTypes.content, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value('b'), manywho.component.contentTypes.content, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('a0'), value('a1'), manywho.component.contentTypes.content, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
    });

    test('Content Starts With', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.content, 'STARTS_WITH')).toBeTruthy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.content, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.content, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.content, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.content, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.content, 'STARTS_WITH')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value('ab'), manywho.component.contentTypes.content, 'STARTS_WITH')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('e'), manywho.component.contentTypes.content, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('a '), manywho.component.contentTypes.content, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value('abcd'), manywho.component.contentTypes.content, 'STARTS_WITH')).toBeFalsy();
    });

    test('Content Ends With', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.content, 'ENDS_WITH')).toBeTruthy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.content, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.content, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.content, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.content, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.content, 'ENDS_WITH')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value('cd'), manywho.component.contentTypes.content, 'ENDS_WITH')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('d'), manywho.component.contentTypes.content, 'ENDS_WITH')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('c'), manywho.component.contentTypes.content, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('d '), manywho.component.contentTypes.content, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value('abcd'), manywho.component.contentTypes.content, 'ENDS_WITH')).toBeFalsy();
    });

    test('Content Contains', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.content, 'CONTAINS')).toBeTruthy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.content, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.content, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.content, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.content, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.content, 'CONTAINS')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value('ab'), manywho.component.contentTypes.content, 'CONTAINS')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value(''), manywho.component.contentTypes.content, 'CONTAINS')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('bc'), manywho.component.contentTypes.content, 'CONTAINS')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('e'), manywho.component.contentTypes.content, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('a '), manywho.component.contentTypes.content, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value('abcd'), manywho.component.contentTypes.content, 'CONTAINS')).toBeFalsy();
    });

    test('Content Is Empty', () => {
        expect(Rules.compareValues(value(''), value(true), manywho.component.contentTypes.content, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(true), manywho.component.contentTypes.content, 'IS_EMPTY')).toBeTruthy();

        expect(Rules.compareValues(value(true), value(true), manywho.component.contentTypes.content, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(true), manywho.component.contentTypes.content, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(true), manywho.component.contentTypes.content, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value(true), manywho.component.contentTypes.content, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(' '), value(true), manywho.component.contentTypes.content, 'IS_EMPTY')).toBeFalsy();
    });

    test('Content Is Not Empty', () => {
        expect(Rules.compareValues(value(''), value(false), manywho.component.contentTypes.content, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(false), manywho.component.contentTypes.content, 'IS_EMPTY')).toBeFalsy();

        expect(Rules.compareValues(value(false), value(false), manywho.component.contentTypes.content, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(false), value(false), manywho.component.contentTypes.content, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value(false), manywho.component.contentTypes.content, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value(false), manywho.component.contentTypes.content, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(' '), value(false), manywho.component.contentTypes.content, 'IS_EMPTY')).toBeTruthy();
    });
});

describe('Rules service Content Password expected behaviour', () => {

    test('Invalid criteria for an empty password', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.password, 'BAD_CRITERIA')).toBeFalsy();
    });

    test('Password Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.password, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.password, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.password, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.password, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.password, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.password, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('abcd'), manywho.component.contentTypes.password, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('abcde'), manywho.component.contentTypes.password, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('ebcd'), manywho.component.contentTypes.password, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('abc'), manywho.component.contentTypes.password, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(' abcd '), manywho.component.contentTypes.password, 'EQUAL')).toBeFalsy();
    });

    test('Password Not Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.password, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.password, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.password, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.password, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.password, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.password, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('abcd'), manywho.component.contentTypes.password, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('abcde'), manywho.component.contentTypes.password, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('ebcd'), manywho.component.contentTypes.password, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('abc'), manywho.component.contentTypes.password, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value(' abcd '), manywho.component.contentTypes.password, 'NOT_EQUAL')).toBeTruthy();
    });

    test('Password Greater Than', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.password, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.password, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.password, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.password, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.password, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.password, 'GREATER_THAN')).toBeFalsy();

        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.password, 'GREATER_THAN')).toBeTruthy();
        expect(Rules.compareValues(value('b1'), value('b0'), manywho.component.contentTypes.password, 'GREATER_THAN')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value('b'), manywho.component.contentTypes.password, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('a0'), value('a1'), manywho.component.contentTypes.password, 'GREATER_THAN')).toBeFalsy();
    });

    test('Password Less Than', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.password, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.password, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.password, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.password, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.password, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.password, 'LESS_THAN')).toBeFalsy();

        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.password, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('b1'), value('b0'), manywho.component.contentTypes.password, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value('b'), manywho.component.contentTypes.password, 'LESS_THAN')).toBeTruthy();
        expect(Rules.compareValues(value('a0'), value('a1'), manywho.component.contentTypes.password, 'LESS_THAN')).toBeTruthy();
    });

    test('Password Greater Than Or Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.password, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.password, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.password, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.password, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.password, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.password, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.password, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('b1'), value('b0'), manywho.component.contentTypes.password, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('cc'), value('cc'), manywho.component.contentTypes.password, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value('b'), manywho.component.contentTypes.password, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('a0'), value('a1'), manywho.component.contentTypes.password, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
    });

    test('Password Less Than Or Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.password, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.password, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.password, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.password, 'LESS_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.password, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.password, 'LESS_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.password, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('b1'), value('b0'), manywho.component.contentTypes.password, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('cc'), value('cc'), manywho.component.contentTypes.password, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value('b'), manywho.component.contentTypes.password, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('a0'), value('a1'), manywho.component.contentTypes.password, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
    });

    test('Password Starts With', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.password, 'STARTS_WITH')).toBeTruthy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.password, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.password, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.password, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.password, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.password, 'STARTS_WITH')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value('ab'), manywho.component.contentTypes.password, 'STARTS_WITH')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('e'), manywho.component.contentTypes.password, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('a '), manywho.component.contentTypes.password, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value('abcd'), manywho.component.contentTypes.password, 'STARTS_WITH')).toBeFalsy();
    });

    test('Password Ends With', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.password, 'ENDS_WITH')).toBeTruthy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.password, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.password, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.password, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.password, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.password, 'ENDS_WITH')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value('cd'), manywho.component.contentTypes.password, 'ENDS_WITH')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('d'), manywho.component.contentTypes.password, 'ENDS_WITH')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('c'), manywho.component.contentTypes.password, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('d '), manywho.component.contentTypes.password, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value('abcd'), manywho.component.contentTypes.password, 'ENDS_WITH')).toBeFalsy();
    });

    test('Password Contains', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.password, 'CONTAINS')).toBeTruthy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.password, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.password, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.password, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.password, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.password, 'CONTAINS')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value('ab'), manywho.component.contentTypes.password, 'CONTAINS')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value(''), manywho.component.contentTypes.password, 'CONTAINS')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('bc'), manywho.component.contentTypes.password, 'CONTAINS')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('e'), manywho.component.contentTypes.password, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('a '), manywho.component.contentTypes.password, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value('abcd'), manywho.component.contentTypes.password, 'CONTAINS')).toBeFalsy();
    });

    test('Password Is Empty', () => {
        expect(Rules.compareValues(value(''), value(true), manywho.component.contentTypes.password, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(true), manywho.component.contentTypes.password, 'IS_EMPTY')).toBeTruthy();

        expect(Rules.compareValues(value(true), value(true), manywho.component.contentTypes.password, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(true), manywho.component.contentTypes.password, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(true), manywho.component.contentTypes.password, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value(true), manywho.component.contentTypes.password, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(' '), value(true), manywho.component.contentTypes.password, 'IS_EMPTY')).toBeFalsy();
    });

    test('Password Is Not Empty', () => {
        expect(Rules.compareValues(value(''), value(false), manywho.component.contentTypes.password, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(false), manywho.component.contentTypes.password, 'IS_EMPTY')).toBeFalsy();

        expect(Rules.compareValues(value(false), value(false), manywho.component.contentTypes.password, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(false), value(false), manywho.component.contentTypes.password, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value(false), manywho.component.contentTypes.password, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value(false), manywho.component.contentTypes.password, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(' '), value(false), manywho.component.contentTypes.password, 'IS_EMPTY')).toBeTruthy();
    });
});

describe('Rules service Content Encrypted expected behaviour', () => {

    test('Invalid criteria for an empty string', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.encrypted, 'BAD_CRITERIA')).toBeFalsy();
    });

    test('Encrypted Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.encrypted, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.encrypted, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.encrypted, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.encrypted, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.encrypted, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.encrypted, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('abcd'), manywho.component.contentTypes.encrypted, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('abcde'), manywho.component.contentTypes.encrypted, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('ebcd'), manywho.component.contentTypes.encrypted, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('abc'), manywho.component.contentTypes.encrypted, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(' abcd '), manywho.component.contentTypes.encrypted, 'EQUAL')).toBeFalsy();
    });

    test('Encrypted Not Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.encrypted, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.encrypted, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.encrypted, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.encrypted, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.encrypted, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.encrypted, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('abcd'), manywho.component.contentTypes.encrypted, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('abcde'), manywho.component.contentTypes.encrypted, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('ebcd'), manywho.component.contentTypes.encrypted, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('abc'), manywho.component.contentTypes.encrypted, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value(' abcd '), manywho.component.contentTypes.encrypted, 'NOT_EQUAL')).toBeTruthy();
    });

    test('Encrypted Greater Than', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.encrypted, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.encrypted, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.encrypted, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.encrypted, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.encrypted, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.encrypted, 'GREATER_THAN')).toBeFalsy();

        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.encrypted, 'GREATER_THAN')).toBeTruthy();
        expect(Rules.compareValues(value('b1'), value('b0'), manywho.component.contentTypes.encrypted, 'GREATER_THAN')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value('b'), manywho.component.contentTypes.encrypted, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('a0'), value('a1'), manywho.component.contentTypes.encrypted, 'GREATER_THAN')).toBeFalsy();
    });

    test('Encrypted Less Than', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.encrypted, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.encrypted, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.encrypted, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.encrypted, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.encrypted, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.encrypted, 'LESS_THAN')).toBeFalsy();

        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.encrypted, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('b1'), value('b0'), manywho.component.contentTypes.encrypted, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value('b'), manywho.component.contentTypes.encrypted, 'LESS_THAN')).toBeTruthy();
        expect(Rules.compareValues(value('a0'), value('a1'), manywho.component.contentTypes.encrypted, 'LESS_THAN')).toBeTruthy();
    });

    test('Encrypted Greater Than Or Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.encrypted, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.encrypted, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.encrypted, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.encrypted, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.encrypted, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.encrypted, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.encrypted, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('b1'), value('b0'), manywho.component.contentTypes.encrypted, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('cc'), value('cc'), manywho.component.contentTypes.encrypted, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value('b'), manywho.component.contentTypes.encrypted, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('a0'), value('a1'), manywho.component.contentTypes.encrypted, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
    });

    test('Encrypted Less Than Or Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.encrypted, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.encrypted, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.encrypted, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.encrypted, 'LESS_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.encrypted, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.encrypted, 'LESS_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.encrypted, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('b1'), value('b0'), manywho.component.contentTypes.encrypted, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('cc'), value('cc'), manywho.component.contentTypes.encrypted, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value('b'), manywho.component.contentTypes.encrypted, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('a0'), value('a1'), manywho.component.contentTypes.encrypted, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
    });

    test('Encrypted Starts With', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.encrypted, 'STARTS_WITH')).toBeTruthy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.encrypted, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.encrypted, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.encrypted, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.encrypted, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.encrypted, 'STARTS_WITH')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value('ab'), manywho.component.contentTypes.encrypted, 'STARTS_WITH')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('e'), manywho.component.contentTypes.encrypted, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('a '), manywho.component.contentTypes.encrypted, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value('abcd'), manywho.component.contentTypes.encrypted, 'STARTS_WITH')).toBeFalsy();
    });

    test('Encrypted Ends With', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.encrypted, 'ENDS_WITH')).toBeTruthy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.encrypted, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.encrypted, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.encrypted, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.encrypted, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.encrypted, 'ENDS_WITH')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value('cd'), manywho.component.contentTypes.encrypted, 'ENDS_WITH')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('d'), manywho.component.contentTypes.encrypted, 'ENDS_WITH')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('c'), manywho.component.contentTypes.encrypted, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('d '), manywho.component.contentTypes.encrypted, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value('abcd'), manywho.component.contentTypes.encrypted, 'ENDS_WITH')).toBeFalsy();
    });

    test('Encrypted Contains', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.encrypted, 'CONTAINS')).toBeTruthy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.encrypted, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.encrypted, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.encrypted, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.encrypted, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.encrypted, 'CONTAINS')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value('ab'), manywho.component.contentTypes.encrypted, 'CONTAINS')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value(''), manywho.component.contentTypes.encrypted, 'CONTAINS')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('bc'), manywho.component.contentTypes.encrypted, 'CONTAINS')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value('e'), manywho.component.contentTypes.encrypted, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('a '), manywho.component.contentTypes.encrypted, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value('abcd'), manywho.component.contentTypes.encrypted, 'CONTAINS')).toBeFalsy();
    });

    test('Encrypted Is Empty', () => {
        expect(Rules.compareValues(value(''), value(true), manywho.component.contentTypes.encrypted, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(true), manywho.component.contentTypes.encrypted, 'IS_EMPTY')).toBeTruthy();

        expect(Rules.compareValues(value(true), value(true), manywho.component.contentTypes.encrypted, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(true), manywho.component.contentTypes.encrypted, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(true), manywho.component.contentTypes.encrypted, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value(true), manywho.component.contentTypes.encrypted, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(' '), value(true), manywho.component.contentTypes.encrypted, 'IS_EMPTY')).toBeFalsy();
    });

    test('Encrypted Is Not Empty', () => {
        expect(Rules.compareValues(value(''), value(false), manywho.component.contentTypes.encrypted, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(false), manywho.component.contentTypes.encrypted, 'IS_EMPTY')).toBeFalsy();

        expect(Rules.compareValues(value(false), value(false), manywho.component.contentTypes.encrypted, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(false), value(false), manywho.component.contentTypes.encrypted, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value('abcd'), value(false), manywho.component.contentTypes.encrypted, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value(false), manywho.component.contentTypes.encrypted, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(' '), value(false), manywho.component.contentTypes.encrypted, 'IS_EMPTY')).toBeTruthy();
    });
});

describe('Rules service Content Number expected behaviour', () => {

    test('Invalid criteria for an empty number', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.number, 'BAD_CRITERIA')).toBeFalsy();
    });

    test('Number Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.number, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(0), value(0), manywho.component.contentTypes.number, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.number, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(0), manywho.component.contentTypes.number, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(0), value(null), manywho.component.contentTypes.number, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(1), value(null), manywho.component.contentTypes.number, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(1), manywho.component.contentTypes.number, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(2.2), value(2.2), manywho.component.contentTypes.number, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(34), value(35), manywho.component.contentTypes.number, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(-1.1), value(1.1), manywho.component.contentTypes.number, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('not a number'), value('abc'), manywho.component.contentTypes.number, 'EQUAL')).toBeFalsy();
    });

    test('Number Not Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.number, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(0), value(0), manywho.component.contentTypes.number, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.number, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(0), manywho.component.contentTypes.number, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(0), value(null), manywho.component.contentTypes.number, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(1), value(null), manywho.component.contentTypes.number, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(1), manywho.component.contentTypes.number, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(2.2), value(2.2), manywho.component.contentTypes.number, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(34), value(35), manywho.component.contentTypes.number, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(-1.1), value(1.1), manywho.component.contentTypes.number, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('not a number'), value('abc'), manywho.component.contentTypes.number, 'NOT_EQUAL')).toBeTruthy();
    });

    test('Number Greater Than', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.number, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.number, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.number, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.number, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.number, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.number, 'GREATER_THAN')).toBeFalsy();

        expect(Rules.compareValues(value(2), value(1.9), manywho.component.contentTypes.number, 'GREATER_THAN')).toBeTruthy();
        expect(Rules.compareValues(value(-2), value(-3), manywho.component.contentTypes.number, 'GREATER_THAN')).toBeTruthy();
        expect(Rules.compareValues(value(1.9), value(2), manywho.component.contentTypes.number, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(-5.5), value(-4.4), manywho.component.contentTypes.number, 'GREATER_THAN')).toBeFalsy();
    });

    test('Number Less Than', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.number, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.number, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.number, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.number, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.number, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.number, 'LESS_THAN')).toBeFalsy();

        expect(Rules.compareValues(value(2), value(1.9), manywho.component.contentTypes.number, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(-2), value(-3), manywho.component.contentTypes.number, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(1.9), value(2), manywho.component.contentTypes.number, 'LESS_THAN')).toBeTruthy();
        expect(Rules.compareValues(value(-5.5), value(-4.4), manywho.component.contentTypes.number, 'LESS_THAN')).toBeTruthy();
    });

    test('Number Greater Than Or Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.number, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.number, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.number, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.number, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.number, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.number, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value(2), value(1.9), manywho.component.contentTypes.number, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(-2), value(-3), manywho.component.contentTypes.number, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(1.9), value(2), manywho.component.contentTypes.number, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(-5.5), value(-4.4), manywho.component.contentTypes.number, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(-5.5), value(-5.5), manywho.component.contentTypes.number, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(1), value(1), manywho.component.contentTypes.number, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
    });

    test('Number Less Than Or Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.number, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.number, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.number, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.number, 'LESS_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.number, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.number, 'LESS_THAN_OR_EQUAL')).toBeFalsy();

        expect(Rules.compareValues(value(2), value(1.9), manywho.component.contentTypes.number, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(-2), value(-3), manywho.component.contentTypes.number, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(1.9), value(2), manywho.component.contentTypes.number, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(-5.5), value(-4.4), manywho.component.contentTypes.number, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(-5.5), value(-5.5), manywho.component.contentTypes.number, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(1), value(1), manywho.component.contentTypes.number, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
    });

    test('Number Starts With', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.number, 'STARTS_WITH')).toBeTruthy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.number, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.number, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.number, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.number, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.number, 'STARTS_WITH')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value('ab'), manywho.component.contentTypes.number, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(11), value(1), manywho.component.contentTypes.number, 'STARTS_WITH')).toBeFalsy();
    });

    test('Number Ends With', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.number, 'ENDS_WITH')).toBeTruthy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.number, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.number, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.number, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.number, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.number, 'ENDS_WITH')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value('d'), manywho.component.contentTypes.number, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(11), value(1), manywho.component.contentTypes.number, 'ENDS_WITH')).toBeFalsy();
    });

    test('Number Contains', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.number, 'CONTAINS')).toBeTruthy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.number, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.number, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.number, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.number, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.number, 'CONTAINS')).toBeFalsy();

        expect(Rules.compareValues(value('abcd'), value('c'), manywho.component.contentTypes.number, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(11), value(1), manywho.component.contentTypes.number, 'CONTAINS')).toBeFalsy();
    });

    test('Number Is Empty', () => {
        expect(Rules.compareValues(value(null), value(true), manywho.component.contentTypes.number, 'IS_EMPTY')).toBeTruthy();

        expect(Rules.compareValues(value(0), value(true), manywho.component.contentTypes.number, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(1), value(true), manywho.component.contentTypes.number, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(-1.1), value(true), manywho.component.contentTypes.number, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(true), manywho.component.contentTypes.number, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(true), manywho.component.contentTypes.number, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value(true), manywho.component.contentTypes.number, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(true), manywho.component.contentTypes.number, 'IS_EMPTY')).toBeFalsy();
    });

    test('Number Is Not Empty', () => {
        expect(Rules.compareValues(value(null), value(false), manywho.component.contentTypes.number, 'IS_EMPTY')).toBeFalsy();

        expect(Rules.compareValues(value(0), value(false), manywho.component.contentTypes.number, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(1), value(false), manywho.component.contentTypes.number, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(-1.1), value(false), manywho.component.contentTypes.number, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(true), value(false), manywho.component.contentTypes.number, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(false), value(false), manywho.component.contentTypes.number, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value(false), manywho.component.contentTypes.number, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(''), value(false), manywho.component.contentTypes.number, 'IS_EMPTY')).toBeTruthy();
    });
});

describe('Rules service Content Boolean expected behaviour', () => {

    test('Invalid criteria for an empty boolean', () => {
        expect(Rules.compareValues(value(true), value(true), manywho.component.contentTypes.boolean, 'BAD_CRITERIA')).toBeFalsy();
    });

    test('Boolean Equal', () => {
        expect(Rules.compareValues(value('true'), value('true'), manywho.component.contentTypes.boolean, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('true'), value('false'), manywho.component.contentTypes.boolean, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(0), value(0), manywho.component.contentTypes.boolean, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.boolean, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(0), manywho.component.contentTypes.boolean, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(null), manywho.component.contentTypes.boolean, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(null), manywho.component.contentTypes.boolean, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(true), manywho.component.contentTypes.boolean, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(false), manywho.component.contentTypes.boolean, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(true), manywho.component.contentTypes.boolean, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(false), value(false), manywho.component.contentTypes.boolean, 'EQUAL')).toBeTruthy();
    });

    test('Boolean Not Equal', () => {
        expect(Rules.compareValues(value('true'), value('true'), manywho.component.contentTypes.boolean, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('true'), value('false'), manywho.component.contentTypes.boolean, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(0), value(0), manywho.component.contentTypes.boolean, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.boolean, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(0), manywho.component.contentTypes.boolean, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(true), value(null), manywho.component.contentTypes.boolean, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(false), value(null), manywho.component.contentTypes.boolean, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(true), manywho.component.contentTypes.boolean, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(false), manywho.component.contentTypes.boolean, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(true), value(true), manywho.component.contentTypes.boolean, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(false), manywho.component.contentTypes.boolean, 'NOT_EQUAL')).toBeFalsy();
    });

    test('Boolean Greater Than', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.boolean, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.boolean, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.boolean, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.boolean, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(null), manywho.component.contentTypes.boolean, 'GREATER_THAN')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(false), manywho.component.contentTypes.boolean, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(false), manywho.component.contentTypes.boolean, 'GREATER_THAN')).toBeTruthy();
        expect(Rules.compareValues(value(false), value(true), manywho.component.contentTypes.boolean, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(true), manywho.component.contentTypes.boolean, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(false), manywho.component.contentTypes.boolean, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('true'), value('false'), manywho.component.contentTypes.boolean, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('false'), value('true'), manywho.component.contentTypes.boolean, 'GREATER_THAN')).toBeFalsy();
    });

    test('Boolean Less Than', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.boolean, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.boolean, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.boolean, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.boolean, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(null), manywho.component.contentTypes.boolean, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(false), manywho.component.contentTypes.boolean, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(false), manywho.component.contentTypes.boolean, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(true), manywho.component.contentTypes.boolean, 'LESS_THAN')).toBeTruthy();
        expect(Rules.compareValues(value(true), value(true), manywho.component.contentTypes.boolean, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(false), manywho.component.contentTypes.boolean, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('true'), value('false'), manywho.component.contentTypes.boolean, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('false'), value('true'), manywho.component.contentTypes.boolean, 'LESS_THAN')).toBeFalsy();
    });

    test('Boolean Greater Than Or Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.boolean, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.boolean, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.boolean, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.boolean, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(null), manywho.component.contentTypes.boolean, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(false), manywho.component.contentTypes.boolean, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(false), manywho.component.contentTypes.boolean, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(false), value(true), manywho.component.contentTypes.boolean, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(true), manywho.component.contentTypes.boolean, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(false), value(false), manywho.component.contentTypes.boolean, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('true'), value('false'), manywho.component.contentTypes.boolean, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('false'), value('true'), manywho.component.contentTypes.boolean, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
    });

    test('Boolean Less Than Or Equal', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.boolean, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.boolean, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.boolean, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.boolean, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(null), manywho.component.contentTypes.boolean, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(false), manywho.component.contentTypes.boolean, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(false), manywho.component.contentTypes.boolean, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(true), manywho.component.contentTypes.boolean, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(true), value(true), manywho.component.contentTypes.boolean, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(false), value(false), manywho.component.contentTypes.boolean, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('true'), value('false'), manywho.component.contentTypes.boolean, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('false'), value('true'), manywho.component.contentTypes.boolean, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
    });

    test('Boolean Starts With', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.boolean, 'STARTS_WITH')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.boolean, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(true), manywho.component.contentTypes.boolean, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(false), manywho.component.contentTypes.boolean, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(null), manywho.component.contentTypes.boolean, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(null), manywho.component.contentTypes.boolean, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(true), manywho.component.contentTypes.boolean, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(false), manywho.component.contentTypes.boolean, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('false'), value('true'), manywho.component.contentTypes.boolean, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('true'), value('false'), manywho.component.contentTypes.boolean, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('true'), value(true), manywho.component.contentTypes.boolean, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('false'), value(false), manywho.component.contentTypes.boolean, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(true), value('true'), manywho.component.contentTypes.boolean, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(false), value('false'), manywho.component.contentTypes.boolean, 'STARTS_WITH')).toBeFalsy();
    });

    test('Boolean Ends With', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.boolean, 'ENDS_WITH')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.boolean, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(true), manywho.component.contentTypes.boolean, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(false), manywho.component.contentTypes.boolean, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(null), manywho.component.contentTypes.boolean, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(null), manywho.component.contentTypes.boolean, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(true), manywho.component.contentTypes.boolean, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(false), manywho.component.contentTypes.boolean, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('false'), value('true'), manywho.component.contentTypes.boolean, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('true'), value('false'), manywho.component.contentTypes.boolean, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('true'), value(true), manywho.component.contentTypes.boolean, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('false'), value(false), manywho.component.contentTypes.boolean, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(true), value('true'), manywho.component.contentTypes.boolean, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(false), value('false'), manywho.component.contentTypes.boolean, 'ENDS_WITH')).toBeFalsy();
    });

    test('Boolean Contains', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.boolean, 'CONTAINS')).toBeTruthy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.boolean, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(true), manywho.component.contentTypes.boolean, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(false), manywho.component.contentTypes.boolean, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(null), manywho.component.contentTypes.boolean, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(null), manywho.component.contentTypes.boolean, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(true), manywho.component.contentTypes.boolean, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(false), manywho.component.contentTypes.boolean, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('false'), value('true'), manywho.component.contentTypes.boolean, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('true'), value('false'), manywho.component.contentTypes.boolean, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('true'), value(true), manywho.component.contentTypes.boolean, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('false'), value(false), manywho.component.contentTypes.boolean, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(true), value('true'), manywho.component.contentTypes.boolean, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(false), value('false'), manywho.component.contentTypes.boolean, 'CONTAINS')).toBeFalsy();
    });

    test('Boolean Is Empty', () => {
        expect(Rules.compareValues(value(null), value(true), manywho.component.contentTypes.boolean, 'IS_EMPTY')).toBeTruthy();

        expect(Rules.compareValues(value(0), value(true), manywho.component.contentTypes.boolean, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(1), value(true), manywho.component.contentTypes.boolean, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(-1.1), value(true), manywho.component.contentTypes.boolean, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(true), value(true), manywho.component.contentTypes.boolean, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(false), value(true), manywho.component.contentTypes.boolean, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value('a'), value(true), manywho.component.contentTypes.boolean, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(true), manywho.component.contentTypes.boolean, 'IS_EMPTY')).toBeFalsy();
    });

    test('Boolean Is Not Empty', () => {
        expect(Rules.compareValues(value(null), value(false), manywho.component.contentTypes.boolean, 'IS_EMPTY')).toBeFalsy();

        expect(Rules.compareValues(value(0), value(false), manywho.component.contentTypes.boolean, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(1), value(false), manywho.component.contentTypes.boolean, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(-1.1), value(false), manywho.component.contentTypes.boolean, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(true), value(false), manywho.component.contentTypes.boolean, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(false), value(false), manywho.component.contentTypes.boolean, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value('a'), value(false), manywho.component.contentTypes.boolean, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value(''), value(false), manywho.component.contentTypes.boolean, 'IS_EMPTY')).toBeTruthy();
    });
});

describe('Rules service Content Datetime expected behaviour', () => {

    console.warn = jest.fn();

    test('Invalid criteria for an empty datetime', () => {
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.datetime, 'BAD_CRITERIA')).toBeFalsy();
    });

    test('Datetime Equal', () => {
        expect(Rules.compareValues(value('2020-02-28 12:00:00'), value('2020-02-28 12:00:00'),
            manywho.component.contentTypes.datetime, 'EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('2020-02-28 12:00:00'), value('2021-02-28 12:00:00'),
            manywho.component.contentTypes.datetime, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.datetime, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.datetime, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.datetime, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.datetime, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.datetime, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.datetime, 'EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('abcd'), manywho.component.contentTypes.datetime, 'EQUAL')).toBeFalsy();
        expect(console.warn).toHaveBeenCalled();
    });

    test('Datetime Not Equal', () => {
        expect(Rules.compareValues(value('2020-02-28 12:00:00'), value('2020-02-28 12:00:00'),
            manywho.component.contentTypes.datetime, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('2020-02-28 12:00:00'), value('2021-02-28 12:00:00'),
            manywho.component.contentTypes.datetime, 'NOT_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.datetime, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.datetime, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.datetime, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.datetime, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.datetime, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.datetime, 'NOT_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value('abcd'), manywho.component.contentTypes.datetime, 'NOT_EQUAL')).toBeFalsy();
        expect(console.warn).toHaveBeenCalled();
    });

    test('Datetime Greater Than', () => {
        expect(Rules.compareValues(value('2020-02-28 12:00:00'), value('2020-02-28 12:00:00'),
            manywho.component.contentTypes.datetime, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('2020-02-28 12:00:01'), value('2020-02-28 12:00:00'),
            manywho.component.contentTypes.datetime, 'GREATER_THAN')).toBeTruthy();
        expect(Rules.compareValues(value('2020-02-28 12:00:00'), value('2020-02-28 12:00:01'),
            manywho.component.contentTypes.datetime, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.datetime, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.datetime, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.datetime, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.datetime, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.datetime, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.datetime, 'GREATER_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.datetime, 'GREATER_THAN')).toBeFalsy();
    });

    test('Datetime Less Than', () => {
        expect(Rules.compareValues(value('2020-02-28 12:00:00'), value('2020-02-28 12:00:00'),
            manywho.component.contentTypes.datetime, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('2020-02-28 12:00:01'), value('2020-02-28 12:00:00'),
            manywho.component.contentTypes.datetime, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('2020-02-28 12:00:00'), value('2020-02-28 12:00:01'),
            manywho.component.contentTypes.datetime, 'LESS_THAN')).toBeTruthy();
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.datetime, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.datetime, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.datetime, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.datetime, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.datetime, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.datetime, 'LESS_THAN')).toBeFalsy();
        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.datetime, 'LESS_THAN')).toBeFalsy();
    });

    test('Datetime Greater Than Or Equal', () => {
        expect(Rules.compareValues(value('2020-02-28 12:00:00'), value('2020-02-28 12:00:00'),
            manywho.component.contentTypes.datetime, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('2020-02-28 12:00:01'), value('2020-02-28 12:00:00'),
            manywho.component.contentTypes.datetime, 'GREATER_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('2020-02-28 12:00:00'), value('2020-02-28 12:00:01'),
            manywho.component.contentTypes.datetime, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.datetime, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.datetime, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.datetime, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.datetime, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.datetime, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.datetime, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.datetime, 'GREATER_THAN_OR_EQUAL')).toBeFalsy();
    });

    test('Datetime Less Than Or Equal', () => {
        expect(Rules.compareValues(value('2020-02-28 12:00:00'), value('2020-02-28 12:00:00'),
            manywho.component.contentTypes.datetime, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value('2020-02-28 12:00:01'), value('2020-02-28 12:00:00'),
            manywho.component.contentTypes.datetime, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('2020-02-28 12:00:00'), value('2020-02-28 12:00:01'),
            manywho.component.contentTypes.datetime, 'LESS_THAN_OR_EQUAL')).toBeTruthy();
        expect(Rules.compareValues(value(''), value(''), manywho.component.contentTypes.datetime, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.datetime, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.datetime, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.datetime, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.datetime, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.datetime, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
        expect(Rules.compareValues(value('b'), value('a'), manywho.component.contentTypes.datetime, 'LESS_THAN_OR_EQUAL')).toBeFalsy();
    });

    test('Datetime Starts With', () => {
        expect(Rules.compareValues(value('2020-02-28 12:00:01'), value('2'), manywho.component.contentTypes.datetime, 'STARTS_WITH')).toBeFalsy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.datetime, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.datetime, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.datetime, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.datetime, 'STARTS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.datetime, 'STARTS_WITH')).toBeFalsy();
    });

    test('Datetime Ends With', () => {
        expect(Rules.compareValues(value('2020-02-28 12:00:01'), value('1'), manywho.component.contentTypes.datetime, 'ENDS_WITH')).toBeFalsy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.datetime, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.datetime, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.datetime, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.datetime, 'ENDS_WITH')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.datetime, 'ENDS_WITH')).toBeFalsy();
    });

    test('Datetime Contains', () => {
        expect(Rules.compareValues(value('2020-02-28 12:00:01'), value(':'), manywho.component.contentTypes.datetime, 'CONTAINS')).toBeFalsy();

        expect(Rules.compareValues(value(null), value(null), manywho.component.contentTypes.datetime, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(null), value(''), manywho.component.contentTypes.datetime, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(''), value(null), manywho.component.contentTypes.datetime, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value('abcd'), value(null), manywho.component.contentTypes.datetime, 'CONTAINS')).toBeFalsy();
        expect(Rules.compareValues(value(null), value('abcd'), manywho.component.contentTypes.datetime, 'CONTAINS')).toBeFalsy();
    });

    test('Datetime Is Empty', () => {
        expect(Rules.compareValues(value(null), value(true), manywho.component.contentTypes.datetime, 'IS_EMPTY')).toBeTruthy();
        expect(Rules.compareValues(value('2020-02-28 12:00:00'), value(true), manywho.component.contentTypes.datetime, 'IS_EMPTY')).toBeFalsy();
    });

    test('Datetime Is Not Empty', () => {
        expect(Rules.compareValues(value(null), value(false), manywho.component.contentTypes.datetime, 'IS_EMPTY')).toBeFalsy();
        expect(Rules.compareValues(value('2020-02-28 12:00:00'), value(false), manywho.component.contentTypes.datetime, 'IS_EMPTY')).toBeTruthy();
    });

});

describe('Miscellaneous tests for coverage', () => {

    test('Invalid contentType', () => {
        expect(Rules.getContentValue(value('unchanged'), 'no-such-content-type')).toEqual('unchanged');
    });

    test('Invalid criteriaType', () => {
        expect(Rules.compareContentValues(value(null), value(null), 'no-such-criteria-type', '')).toBeFalsy();
    });

    test('Invalid IS_EMPTY contentType', () => {
        expect(Rules.compareContentValues(value(null), value(null), 'IS_EMPTY', 'no-such-content-type')).toBeFalsy();
    });
});
