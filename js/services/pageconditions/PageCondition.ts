import { getStateValue } from '../../models/State';
import PageRule from './PageRule';
import PageOperation from './PageOperation';

/**
 * @param pageConditions An array of page conditions metadata
 * @param componentId
 * @description To check if a component is listening for a page condition to be triggered
 */
export const checkForCondition = (pageConditions, componentId: String) => {
    return pageConditions.find((pageCondition) => {
        return pageCondition.pageOperations.some((operation) => {
            return operation.assignment.assignee.pageObjectReferenceId === componentId;
        });
    });
};

/**
 * @param pageConditions An array of page conditions metadata
 * @param componentId
 * @description To check if a component triggers a page condition
 */
export const checkForEvents = (pageConditions, componentId: String) => {
    return pageConditions.find((pageCondition) => {
        return pageCondition.pageRules.find((pageRule) => {
            return pageRule.left.pageObjectReferenceId === componentId;
        });
    });
};

/**
 * @param triggerComponent
 * @param snapshot
 * @param pageRule
 * @description finding the page component (that triggers the page condition) associated
 * value, and returning its content value
 * TODO: create interfaces and typecasting
 */
export const getTriggerComponentContentValue = (triggerComponent, snapshot, pageRule) => {
    let triggerComponentContentValue = undefined;

    // First check if the value is in the offline state
    const triggerComponentValueObject = getStateValue(
        { id: triggerComponent.valueElementValueBindingReferenceId.id },
        null,
        null,
        null,
    );

    // If is in state then grab the content value property
    if (triggerComponentValueObject) {
        triggerComponentContentValue = triggerComponentValueObject.contentValue;
    }

    // If value was not found in state then extract the default
    // content value from the flow snapshot
    if (typeof triggerComponentContentValue === 'undefined' || triggerComponentContentValue === null) {
        const snapshotValue = snapshot.getValue(
            { id: triggerComponent.valueElementValueBindingReferenceId.id },
        );
        triggerComponentContentValue = snapshotValue.defaultContentValue;
    }

    // If the components value has object data then we want to extract
    // the appropriate properties content value and use that for comparing
    if (
        triggerComponentValueObject &&
        triggerComponentValueObject.objectData &&
        triggerComponentValueObject.objectData.length > 0
    ) {
        triggerComponentContentValue = triggerComponentValueObject.objectData[0].properties.find(
            property => property.typeElementPropertyId ===
            pageRule.left.valueElementToReferenceId.typeElementPropertyId,
        ).contentValue;
    }

    if (typeof triggerComponentContentValue === 'undefined') {
        throw new Error('Cannot find a trigger component content value');
    }

    return triggerComponentContentValue;
};

/**
 * @param pageElement
 * @param snapshot
 * @param component
 * @param value
 * @description Performs page condition logic by excuting page rules
 * and page operations and modifying a components properties that
 * eventually get returned to the UI as a mock http response
 * TODO: create interfaces and typecasting
 */
const PageCondition = (pageElement, snapshot, component, value) => {

    // Check component triggers a page condition
    const hasEvents = checkForEvents(
        pageElement.pageConditions,
        component.id,
    );

    // If a component triggers a page condition
    // then the components metadata stored in state
    // needs to have the hasEvents property as a flag
    // so the ui knows to make a syncronisation call
    // to the engine.
    if (hasEvents !== undefined) {
        component['hasEvents'] = true;
    } else {
        component['hasEvents'] = false;
    }

    // First check to see if this component is a component
    // listening for a condition i.e. has an operation
    // associated to it
    const assocCondition = checkForCondition(
        pageElement.pageConditions,
        component.id,
    );

    // The page condition is only performed if there is one page rule at the most
    // as currently multiple page rules are not supported offline. There also needs
    // to be some page operations
    if (assocCondition !== undefined && assocCondition.pageRules.length === 1 && assocCondition.pageOperations) {
        const pageRule = assocCondition.pageRules[0];
        const pageOperations = assocCondition.pageOperations;

        // e.g. equal, not equal etc
        const criteriaType = pageRule.criteriaType;

        if (!criteriaType) {
            throw new Error('Check you have added a criteria value');
        }

        const triggerComponent = pageElement.pageComponents.find(component => component.id === pageRule.left.pageObjectReferenceId);

        if (!triggerComponent) {
            throw new Error('Could not find a trigger component');
        }

        const triggerComponentContentValue = getTriggerComponentContentValue(
            triggerComponent,
            snapshot,
            pageRule,
        );

        // We also want the value that we are comparing it too
        // (the "right" property of the page rule)
        // This is static so we always extract the content value from the snapshot
        const valueComparableId = pageRule.right.valueElementToReferenceId.id;
        const valueComparable = snapshot.getValue(
            { id: valueComparableId },
        );

        if (!valueComparable) {
            throw new Error('Cannot find a value to compare');
        }

        const pageRuleResult = PageRule(
            criteriaType,
            triggerComponentContentValue,
            valueComparable,
            value,
        );

        pageOperations.forEach((pageOperation) => {
            PageOperation(
                pageOperation,
                snapshot,
                pageRuleResult,
                value,
                component,
            );
        });
    }
    return value;
};

export default PageCondition;
