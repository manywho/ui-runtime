import { CRITERIA } from '../../constants';

/**
 * @param criteriaType
 * @param triggerComponentContentValue
 * @param valueComparable
 * @param value
 * @description Determines the result of a page rule by
 * comparing string values. Will return a boolean.
 * TODO: create interfaces and typecasting
 */
const PageRule = (
    criteriaType,
    triggerComponentContentValue,
    valueComparable,
    value,
) => {

    // Currently, offline only supports - equal, not_equal
    // and is_empty criteria types
    switch (criteriaType) {

        case CRITERIA.isEqual:
            return (String(triggerComponentContentValue).toUpperCase() === String(valueComparable.defaultContentValue).toUpperCase());

        case CRITERIA.isNotEqual:
            return (String(triggerComponentContentValue).toUpperCase() !== String(valueComparable.defaultContentValue).toUpperCase());

        case CRITERIA.isEmpty:

            // Is empty
            if (String(valueComparable.defaultContentValue).toUpperCase() === 'TRUE') {
                if (
                    (String(triggerComponentContentValue).toUpperCase() === 'NULL' ||
                triggerComponentContentValue === '') &&
                value.objectData === null
                ) {
                    return true;
                }
                return false;
            }

            // Is not empty
            if (String(valueComparable.defaultContentValue).toUpperCase() === 'FALSE') {
                if (
                    (String(triggerComponentContentValue).toUpperCase() === 'NULL' ||
                triggerComponentContentValue === '') &&
                value.objectData === null
                ) {
                    return false;
                }
                return true;
            }
            // TODO - What if valueComparable.defaultContentValue is neither TRUE or FALSE
            return false;

        default:
            return false;
    }
};

export default PageRule;
