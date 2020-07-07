import ObjectData from './ObjectData';
import { cacheObjectData, setCurrentRequestOfflineId, getObjectData, patchObjectDataCache } from '../models/Flow';
import { getStateValue, setStateValue } from '../models/State';
import { IFlow } from '../interfaces/IModels';
import { guid } from './Utils';
import { append, clone } from 'ramda';

/**
 * @param action object extracted from the request that describes the data action
 * @param objectData the objectdata that has been cached in memory
 * @param snapshot the flow snapshot metadata
 * @description simulate loading of object data by filtering
 * cached data and setting to appropriate value
 */
const loadData = (action: any, objectData: any, snapshot: any) => {
    const filteredObjectData = ObjectData.filter(objectData, action.objectDataRequest.listFilter, action.objectDataRequest.typeElementId);
    const value = snapshot.getValue(action.valueElementToApplyId);
    setStateValue(action.valueElementToApplyId, value.typeElementId, snapshot, filteredObjectData);
};

/**
 * @param action object extracted from the request that describes the data action
 * @param objectData the objectdata that has been cached in memory
 * @param snapshot the flow snapshot metadata
 * @description simulate saving or updating of object data by mutating the
 * data cached in memory
 */
const saveData = (action: any, objectData: any, snapshot: any) => {
    const valueReferenceToSave = snapshot.getValue(action.valueElementToApplyId);
    const typeElementId = valueReferenceToSave.typeElementId;
    const type = typeElementId ? snapshot.metadata.typeElements.find(typeElement => typeElement.id === typeElementId) : null;
    const valueElementToApplyId = action.valueElementToApplyId;

    const valueToSave = getStateValue(valueElementToApplyId);

    valueToSave.objectData.forEach((obj) => {

        // The offline ID is used to associate cached objectdata
        // created whilst offline to the request that triggers the caching
        let offlineId = null;

        const existingObject = objectData.find((existingObj) => {

            // For identifying existing objectdata cached whilst offline
            if (existingObj.objectData.internalId === obj.internalId) {
                return existingObj;
            }

            // For identifying existing objectdata cached whilst online
            if (obj.externalId && existingObj.objectData.externalId === obj.externalId) {
                return existingObj;
            }
        });

        // Objectdata that has already been added but is now being modified
        if (existingObject && existingObject.assocData && !existingObject.objectData.externalId) {
            offlineId = existingObject.assocData.offlineId;
        }

        // A new object
        if (!existingObject) {
            offlineId = guid();
        }

        // An object that has been cached from the engine response
        if (existingObject && existingObject.objectData.externalId) {
            offlineId = null;
        }

        // Associate objectdata to current request in cache
        if (offlineId) {

            // The value id is needed later, as when the request is replayed
            // it is this values state that will contain any external id
            // that will need to be extracted.
            // The type elemnt id is needed so that during replay we know what
            // objectdata types need to be examined from the cache
            setCurrentRequestOfflineId(offlineId, valueElementToApplyId.id, typeElementId);
        }

        const newObject = {
            assocData: { offlineId, typeElementId, valueId: valueElementToApplyId.id },
            objectData: {
                typeElementId,
                externalId: existingObject ? existingObject.objectData.externalId : null,
                internalId: existingObject ? existingObject.objectData.internalId : guid(),
                developerName: obj.developerName,
                order: 0,
                isSelected: false,
                properties: clone(type.properties).map((property) => {
                    const newProp = obj.properties.filter(
                        prop => prop.typeElementPropertyId === property.id,
                    );
                    if (newProp.length > 0) {
                        property.contentValue = newProp[0].contentValue ? newProp[0].contentValue : null;
                        property.objectData = newProp[0].objectData ? newProp[0].objectData : null;
                        property.typeElementPropertyId = newProp[0].typeElementPropertyId ? newProp[0].typeElementPropertyId : null;
                    }
                    return property;
                }),
            },
        };

        if (existingObject) {

            // Updating a single object in the cache
            patchObjectDataCache(newObject, typeElementId);
        } else {

            // Adding a new object to the cache
            cacheObjectData(
                append(newObject, objectData),
                typeElementId,
            );
        }
    });
};

/**
 * @param action object extracted from the request that describes the data action
 * @param flow object describing the flow cached in memory
 * @param snapshot the flow snapshot metadata
 * @description determine what kind of data action to simulate based on action metadata
 * and return the state that is in memory
 */
export default (action: any, flow: IFlow, snapshot: any) => {
    const objectData = getObjectData(
        action.objectDataRequest.objectDataType ?
        action.objectDataRequest.objectDataType.typeElementId :
        action.objectDataRequest.typeElementId,
    );

    switch (action.crudOperationType.toUpperCase()) {
    case 'LOAD':
        loadData(action, objectData, snapshot);
        break;
    case 'SAVE':
        saveData(action, objectData, snapshot);
        break;
    case 'DELETE':
        // No implementation for a delete as its potential very destructive
        break;
    }

    return flow.state;
};
