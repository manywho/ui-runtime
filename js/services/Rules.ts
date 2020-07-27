import { getStateValue } from '../models/State';
import { IState } from '../interfaces/IModels';
import { clone } from './Utils';

declare let manywho: any;
declare let moment: any;

/**
 * Support for simulating rules whilst a flow is offline
 */
const Rules = {

    /**
     * Get the first ordered Outcome with a comparison that evaluates true, or the
     * the first outcome without a comparison, i.e. no comparison is considered true.
     *
     * If no Outcomes match the criteria return null
     *
     * @param outcomes
     * @param state
     * @param snapshot
     */
    getOutcome(outcomes: any[], state: IState, snapshot: any) {
        if (!outcomes) {
            return null;
        }

        // Avoid sorting-in-place otherwise the caller may get a suprise
        const sortedOutcomes = clone(outcomes).sort((a, b) => a.order - b.order);

        for (const outcome of sortedOutcomes) {
            let result = false;

            if (outcome.comparison) {
                result = Rules.evaluateComparisons([outcome.comparison], state, snapshot);
            } else {
                result = true;
            }

            if (result) {
                return outcome;
            }
        }

        return null;
    },

    /**
     * Iterate comparisons, evaluating and comparing each set of Rules against the
     * comparison type of AND or OR to return the result.
     *
     * Rules may contain additional nested comparisons.
     *
     * Note that the UI only allows one comparison type (AND/OR) that is applied
     * to all rules within a comparison. This means we avoid the x AND y OR z issues with precedence etc.
     *
     * @param comparisons an array of rules with optional nested comparisons
     * @param state state
     * @param snapshot snapshot
     */
    evaluateComparisons(comparisons: any[], state: IState, snapshot: any[]): boolean {
        let result = false;

        for (const comparison of comparisons) {
            if (comparison.rules) {
                result = Rules.evaluateRules(comparison.rules, comparison.comparisonType, state, snapshot);
            }
            if (comparison.comparisons) {
                result = Rules.evaluateComparisons(comparison.comparisons, state, snapshot);
            }
            if (result && comparison.comparisonType === 'OR') {
                return true;
            }
            if (!result && comparison.comparisonType === 'AND') {
                return false;
            }
        }

        return result;
    },

    /**
     * @param rules
     * @param comparisonType
     * @param state
     * @param snapshot
     */
    evaluateRules(rules: any[], comparisonType: any, state: IState, snapshot): boolean {
        let result = false;

        for (const rule of rules) {

            let left = snapshot.getValue(rule.leftValueElementToReferenceId);
            // TODO - What to do if the operands have different contentTypes ? E.g.
            //        comparing a ContentObject to a ContentBoolean where left/right
            //        are different types.
            const contentType = left.contentType.toUpperCase();
            left = getStateValue(rule.leftValueElementToReferenceId) || left;

            let right = snapshot.getValue(rule.rightValueElementToReferenceId);
            right = getStateValue(rule.rightValueElementToReferenceId) || right;

            result = Rules.compareValues(left, right, contentType, rule.criteriaType);

            if (result && comparisonType === 'OR') {
                return true;
            }
            if (!result && comparisonType === 'AND') {
                return false;
            }
        }

        return result;
    },

    /**
     * @param left
     * @param right
     * @param contentType
     * @param criteriaType
     */
    compareValues(left: any, right: any, contentType: any, criteriaType: string) {
        switch (contentType) {
            case manywho.component.contentTypes.object:
                return Rules.compareObjects(criteriaType, left, right);
            case manywho.component.contentTypes.list:
                return Rules.compareLists(criteriaType, left);
            default: {
                const rightContentValue = criteriaType === 'IS_EMPTY' ?
                    Rules.getContentValue(right, manywho.component.contentTypes.boolean) :
                    Rules.getContentValue(right, contentType.toUpperCase());

                return Rules.compareContentValues(Rules.getContentValue(left, contentType.toUpperCase()),
                    rightContentValue, criteriaType, contentType);
            }
        }
    },

    /**
     * @param value
     * @param contentType
     */
    getContentValue(value: any, contentType: any) {
        const contentValue = value.defaultContentValue || value.contentValue;

        switch (contentType) {
            case manywho.component.contentTypes.string:
            case manywho.component.contentTypes.content:
            case manywho.component.contentTypes.password:
            case manywho.component.contentTypes.encrypted:
                return contentValue ? String(contentValue).toUpperCase() : contentValue;
            case manywho.component.contentTypes.number:
                return contentValue ? parseFloat(contentValue) : contentValue;
            case manywho.component.contentTypes.datetime:
                return contentValue ? moment(contentValue) : contentValue;
            case manywho.component.contentTypes.boolean:
                return contentValue ? Boolean(contentValue) : contentValue;
            case manywho.component.contentTypes.object:
            // If the Value has no objectdata then return the content because some Values
            // from getState() are just single property stored in the contentValue member.
                return value.objectData && value.objectData.length > 0 ? value : contentValue || '';
            default:
            // TODO - Exception ?
                return contentValue;
        }
    },

    /**
     * Compare two content values with the specified operator.
     *
     * Comparisons also compare types where possible as both operands ares expected to be the same type.
     *
     * @param left operand
     * @param right operand
     * @param criteriaType operator to test for equality, etc.
     * @param contentType the Flow content type of the operands.
     */
    compareContentValues(left: any, right: any, criteriaType: string, contentType: string) {
        switch (criteriaType.toUpperCase()) {
            case 'EQUAL':
                if (contentType === manywho.component.contentTypes.datetime) {
                    if (moment.isMoment(left) && left.isValid() && moment.isMoment(right) && right.isValid()) {
                        return left.isSame(right);
                    }
                    return false;
                }
                return left === right;

            case 'NOT_EQUAL':
                if (contentType === manywho.component.contentTypes.datetime) {
                    if (moment.isMoment(left) && left.isValid() && moment.isMoment(right) && right.isValid()) {
                        return !left.isSame(right);
                    }
                    return false;
                }
                return left !== right;

            case 'GREATER_THAN':
                if (contentType === manywho.component.contentTypes.datetime) {
                    if (moment.isMoment(left) && left.isValid() && moment.isMoment(right) && right.isValid()) {
                        return left.isAfter(right);
                    }
                    return false;
                }
                return left > right;

            case 'GREATER_THAN_OR_EQUAL':
                if (contentType === manywho.component.contentTypes.datetime) {
                    if (moment.isMoment(left) && left.isValid() && moment.isMoment(right) && right.isValid()) {
                        return left.isSameOrAfter(right);
                    }
                    return false;
                }
                // There is no >== operator to check types
                return left === right || left > right;

            case 'LESS_THAN':
                if (contentType === manywho.component.contentTypes.datetime) {
                    if (moment.isMoment(left) && left.isValid() && moment.isMoment(right) && right.isValid()) {
                        return left.isBefore(right);
                    }
                    return false;
                }
                return left < right;

            case 'LESS_THAN_OR_EQUAL':
                if (contentType === manywho.component.contentTypes.datetime) {
                    if (moment.isMoment(left) && left.isValid() && moment.isMoment(right) && right.isValid()) {
                        return left.isSameOrBefore(right);
                    }
                    return false;
                }
                // There is no <== operator to check types
                return left === right || left < right;

            case 'STARTS_WITH':
                return left !== null && typeof left === 'string' && left.startsWith(right);

            case 'ENDS_WITH':
                return left !== null && typeof left === 'string' && left.endsWith(right);

            case 'CONTAINS':
                return left !== null && typeof left === 'string' && left.indexOf(right) !== -1;

            case 'IS_EMPTY': {
                // The right operand is usually true and false ($True/$False) so we can effectively
                // perform a !IS_EMPTY by virtue of the second operand.
                switch (contentType.toUpperCase()) {
                    case manywho.component.contentTypes.string:
                    case manywho.component.contentTypes.password:
                    case manywho.component.contentTypes.content:
                    case manywho.component.contentTypes.encrypted:
                        return (manywho.utils.isNullOrEmpty(left) && right) || (!manywho.utils.isNullOrEmpty(left) && !right);
                    case manywho.component.contentTypes.number:
                    case manywho.component.contentTypes.boolean:
                    case manywho.component.contentTypes.datetime:
                        return (left === null && right) || (left !== null && !right);
                    default:
                        // TODO - Exception ?
                        return false;
                }
            }

            default:
                // TODO - Exception ?
                return false;
        }
    },

    /**
     * TODO: Un-hide the docs for this onces its implemented
     * @hidden
     * @param criteriaType
     * @param left
     * @param right
     */
    compareObjects(criteriaType: string, left: any, right: any) {
        switch (criteriaType.toUpperCase()) {
            case 'IS_EMPTY':
                return !(left && left.objectData && left.objectData.length > 0);
            case 'EQUAL':
                return Rules.getContentValue(left, manywho.component.contentTypes.object) ===
                    Rules.getContentValue(right, manywho.component.contentTypes.object);
            case 'NOT_EQUAL':
                return Rules.getContentValue(left, manywho.component.contentTypes.object) !==
                    Rules.getContentValue(right, manywho.component.contentTypes.object);
            default:
                // TODO - Exception ?
                return false;
        }
    },

    /**
     * Is a value of ContentList empty ?
     *
     * @param criteriaType - only IS_EMPTY is supported
     * @param value an object with a objjectData property
     * @return true if an empty list, otherwise false
     */
    compareLists(criteriaType: string, value: any) {
        switch (criteriaType.toUpperCase()) {
            case 'IS_EMPTY':
                return !(value && value.objectData && value.objectData.length > 0);

            default:
                // TODO - Exception ?
                return false;
        }
    },
};

export default Rules;
