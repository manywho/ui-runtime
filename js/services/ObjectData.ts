import { clone } from '../services/Utils';
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
    filter: (objectData: any, filter: any, typeElementId: string = null) => {
        if (!filter || !objectData) {
            return {
                objectData,
                hasMoreResults: false,
            };
        }

        const clonedObjectData = clone(objectData.map((obj) => { return obj.objectData; }));
        let filteredObjectData = [];

        // Support for where filtering
        if (filter.where) {
            filteredObjectData = clonedObjectData.filter((item) => {
                const comparer = filter.comparisonType === 'OR' ? 'some' : 'every';

                return filter.where[comparer]((where) => {
                    const property = item.properties.find(property => property.typeElementPropertyId === where.columnTypeElementPropertyId);

                    if (!property) {
                        return true;
                    }

                    const value = getStateValue(filter.where[0].valueElementToReferenceId, typeElementId, property.contentType, null);

                    if (!value) {
                        return true;
                    }

                    return Rules.compareValues(property, value, property.contentType, where.criteriaType);
                });
            });

        // Support for filtering by an ID
        } else if (filter.filterId) {
            filteredObjectData = clonedObjectData.filter((item) => {
                const value = getStateValue(filter.filterId, null, 'CONTENTSTRING', null);
                return value ? item.externalId === value.contentValue : false;
            });
        } else {
            filteredObjectData = clonedObjectData;
        }

        if (filter.search) {
            filteredObjectData = clonedObjectData.filter((item) => {
                return item.properties.filter((property) => {
                    return property.contentValue && property.contentValue.toLowerCase().indexOf(filter.search.toLowerCase()) !== -1;
                }).length > 0;
            });
        }

        filter.offset = filter.offset || 0;
        const page = Math.ceil(filter.offset / filter.limit);

        const slicedObjectData = isNaN(page) ?
        filteredObjectData : filteredObjectData.slice(page * filter.limit, (page * filter.limit) + filter.limit);

        return {
            hasMoreResults: ((page * filter.limit) + filter.limit + 1) <= filteredObjectData.length,
            objectData: slicedObjectData,
        };
    },
};

export default ObjectData;
