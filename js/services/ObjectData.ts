import { clone } from './Utils';
import { getStateValue } from '../models/State';
import Rules from './Rules';

/**
 * Support for filtering through cached object data
 */
const ObjectData = {

    /**
     * Execute filtering on object data. Currently supports searching
     * across every properties `contentValue`.
     * @param objectData
     * @param filter
     */
    filter: (objectData: any, filter: any) => {
        if (!filter || !objectData) {
            return {
                objectData,
                hasMoreResults: false,
            };
        }

        const clonedObjectData = clone(objectData.map((obj) => obj.objectData));
        let filteredObjectData = [];

        // Support for where filtering
        if (filter.where) {
            filteredObjectData = clonedObjectData.filter((item) => {
                const comparer = filter.comparisonType === 'OR' ? 'some' : 'every';

                return filter.where[comparer]((where) => {
                    const property = item.properties.find((prop) => prop.typeElementPropertyId === where.columnTypeElementPropertyId);

                    if (!property) {
                        return true;
                    }

                    const value = getStateValue(filter.where[0].valueElementToReferenceId);

                    if (!value) {
                        return true;
                    }

                    return Rules.compareValues(property, value, property.contentType, where.criteriaType);
                });
            });

        // Support for filtering by an ID
        } else if (filter.filterId) {
            filteredObjectData = clonedObjectData.filter((item) => {
                const value = getStateValue(filter.filterId);
                return value ? item.externalId === value.contentValue : false;
            });
        } else {
            filteredObjectData = clonedObjectData;
        }

        if (filter.search) {
            filteredObjectData = clonedObjectData.filter((item) => item.properties
                .filter((property) => property.contentValue &&
                    property.contentValue.toLowerCase().indexOf(filter.search.toLowerCase()) !== -1).length > 0);
        }

        filter.offset = filter.offset || 0;
        const limit:number = +filter.limit || 0;
        const page = Math.ceil(filter.offset / limit);

        const slicedObjectData = page ? filteredObjectData.slice(page * filter.limit, (page * limit) + limit) :
            filteredObjectData;

        return {
            hasMoreResults: ((page * limit) + limit + 1) <= filteredObjectData.length,
            objectData: slicedObjectData,
        };
    },
};

export default ObjectData;
