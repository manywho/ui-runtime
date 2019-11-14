import { clone } from '../services/Utils';

declare var manywho: any;

/**
 * Helper functions for extracting values
 * from the generated flow metatdata
 * @param meta
 */
const Snapshot = (meta: any) => {

    /**
     * @param id
     * @param developerName
     * @param contentType
     */
    const createValue = (id: string, developerName: string, contentType: string) => {
        return {
            contentType,
            developerName,
            id,
            isFixed: true,
            isVersionless: false,
            access: 'PRIVATE',
            contentFormat: null,
            defaultContentValue: null,
            defaultObjectData: null,
            initializationOperations: null,
            typeElementId: null,
            typeElementDeveloperName: null,
            updateByName: false,
            elementType: 'VARIABLE',
            developerSummary: null,
        };
    };

    /**
     * https://docs.manywho.com/everything-you-want-to-know-about-values/
     * @param id
     */
    const getSystemValue = (id: string) => {
        let valueElement = null;

        if (manywho.utils.isEqual('03DC41DD-1C6B-4B33-BF61-CBD1D0778FFF', id, true)) {
            // This is a $User reference
            valueElement = createValue('03DC41DD-1C6B-4B33-BF61-CBD1D0778FFF', '$User', manywho.component.contentTypes.object);
            valueElement.defaultObjectData = [
                {
                    externalId: '03DC41DD-1C6B-4B33-BF61-CBD1D0778FFF',
                    internalId: '03DC41DD-1C6B-4B33-BF61-CBD1D0778FFF',
                    developerName: '$User',
                    properties: [
                        { typeElementPropertyId: '90262141-02B2-4F2C-8107-B14CF859DE4D', developerName: 'User ID', contentValue: null },
                        { typeElementPropertyId: 'D8839B46-C43B-4435-9395-BD00491DA16E', developerName: 'Username', contentValue: null },
                        { typeElementPropertyId: '601DDC6A-FFF4-478B-ABE4-C4E65BC901C6', developerName: 'Email', contentValue: null },
                        { typeElementPropertyId: '6E1D4D49-AB0D-4475-9488-CF4A71D36BEB', developerName: 'First Name', contentValue: null },
                        { typeElementPropertyId: 'E525AAAE-C900-47FC-9A20-D10C52CFC203', developerName: 'Last Name', contentValue: null },
                        { typeElementPropertyId: '88EC74A3-B75D-4C1C-89E4-D142159FD5E4', developerName: 'Language', contentValue: null },
                        { typeElementPropertyId: '4FB64B42-A370-455E-85ED-D9A0A8723A43', developerName: 'Country', contentValue: null },
                        { typeElementPropertyId: '641F4870-8BF6-4CD9-9654-2AA04C542F43', developerName: 'Brand', contentValue: null },
                        { typeElementPropertyId: 'A20A1786-7318-4688-81EC-738337442C56', developerName: 'Variant', contentValue: null },
                        { typeElementPropertyId: '4FA61B42-A370-455E-85ED-D9A0A8723A43', developerName: 'Location', contentValue: null },
                        { typeElementPropertyId: '4FA61B52-A370-455E-85ED-D9A0A8723A43', developerName: 'Directory Id', contentValue: null },
                        { typeElementPropertyId: '4FA61B45-A370-455E-85ED-D9A0A8723A43', developerName: 'Directory Name', contentValue: null },
                        { typeElementPropertyId: '5582D6D3-B673-4972-A65F-9E915C0C10AA', developerName: 'Role Id', contentValue: null },
                        { typeElementPropertyId: 'D9904FDD-8F19-4f26-96C1-83EC2f58A540', developerName: 'Role Name', contentValue: null },
                        { typeElementPropertyId: 'CE98CE03-41EE-405D-B849-509974610D7F', developerName: 'Primary Group Id', contentValue: null },
                        { typeElementPropertyIvalueElementsd: 'F26BA831-B013-4654-8AE3-8EB3AB5E6C1E', developerName: 'Primary Group Name',
                            contentValue: null },
                        { typeElementPropertyId: '4FA61B46-A370-455E-85ED-D9A0A8723A43', developerName: 'Status', contentValue: null },
                        { typeElementPropertyId: '4FA61B47-A370-455E-85ED-D9A0A8723A43', developerName: 'AuthenticationType', contentValue: null },
                        { typeElementPropertyId: '4FA61B48-A370-455E-85ED-D9A0A8723A43', developerName: 'LoginUrl', contentValue: null },
                    ],
                },
            ];
        } else if (manywho.utils.isEqual('BE1BC78E-FD57-40EC-9A86-A815DE2A9E28', id, true)) {
            // This is a $True reference
            valueElement = createValue('BE1BC78E-FD57-40EC-9A86-A815DE2A9E28', '$True', manywho.component.contentTypes.boolean);
            valueElement.defaultContentValue = 'True';
        } else if (manywho.utils.isEqual('496FD041-D91F-48FB-AA4F-91C6C9A11CA1', id, true)) {
            // This is a $False reference
            valueElement = createValue('496FD041-D91F-48FB-AA4F-91C6C9A11CA1', '$False', manywho.component.contentTypes.boolean);
            valueElement.defaultContentValue = 'False';
        } else if (manywho.utils.isEqual('E2063196-3C75-4388-8B00-1005B8CD59AD', id, true)) {
            // This is a $JoinUri reference
            valueElement = createValue('E2063196-3C75-4388-8B00-1005B8CD59AD', '$JoinUri', manywho.component.contentTypes.string);
            valueElement.defaultContentValue = '';
        } else if (manywho.utils.isEqual('03DC41DD-1C6B-4B33-BF61-CBD1D0778FFF', id, true)) {
            // This is a $Location reference
            valueElement = createValue('4FA61B42-A370-455E-85ED-D9A0A8723A43', '$Location', manywho.component.contentTypes.object);
            valueElement.defaultObjectData = [
                {
                    externalId: '4FA61B42-A370-455E-85ED-D9A0A8723A43',
                    internalId: '4FA61B42-A370-455E-85ED-D9A0A8723A43',
                    developerName: '$Location',
                    properties: [
                        { typeElementPropertyId: 'FFC4CBD6-FA28-4141-95A4-DA9BACDB0203', developerName: 'Location Timestamp', contentValue: null },
                        { typeElementPropertyId: '9270A449-9AD5-4C57-B952-DC4551210ABA', developerName: 'Current Latitude', contentValue: null },
                        { typeElementPropertyId: '0A198B4B-1890-4B3B-B09C-E215C7C1458B', developerName: 'Current Longitude', contentValue: null },
                        { typeElementPropertyId: '4DB3CE7A-E758-4202-B2E5-E2A21C2A25FD', developerName: 'Location Accuracy', contentValue: null },
                        { typeElementPropertyId: '6242AA3F-2796-42ED-9262-EF77EE7405E2', developerName: 'Current Altitude', contentValue: null },
                        { typeElementPropertyId: 'A68965D6-0461-4EFE-8F63-F05C406E6F2B', developerName: 'Altitude Accuracy', contentValue: null },
                        { typeElementPropertyId: '6F0BEE99-ECFB-4B63-A034-F7807244C2B8', developerName: 'Current Heading', contentValue: null },
                        { typeElementPropertyId: '22C772BF-7BC2-4EC3-A44A-F8387751D32C', developerName: 'Current Speed', contentValue: null },
                    ],
                },
            ];
        } else if (manywho.utils.isEqual('1F2A56FD-E14B-460C-AABD-9FBF344B84F3', id, true)) {
            // This is a $State reference
            valueElement = createValue('4FA61B42-A370-455E-85ED-D9A0A8723A43', '$State', manywho.component.contentTypes.object);
            valueElement.defaultObjectData = [
                {
                    externalId: '1F2A56FD-E14B-460C-AABD-9FBF344B84F3',
                    internalId: '1F2A56FD-E14B-460C-AABD-9FBF344B84F3',
                    developerName: '$State',
                    properties: [
                        { typeElementPropertyId: 'A4368EA1-F120-47A1-A67B-A8CE9452C127', developerName: 'ID', contentValue: null },
                        { typeElementPropertyId: 'C0986C48-DBC5-43C6-9222-3F8F3D4E2247', developerName: 'Parent ID', contentValue: null },
                        { typeElementPropertyId: '6BA0852D-CED1-428E-BE7E-6F80D4B85F1F', developerName: 'External ID', contentValue: null },
                        { typeElementPropertyId: '5BB41D1F-8F1D-4028-AE44-763617537338', developerName: 'Flow ID', contentValue: null },
                        { typeElementPropertyId: 'B43B6AFA-2E56-461A-AD96-2B74BC92C90D', developerName: 'Flow Version ID', contentValue: null },
                        { typeElementPropertyId: '45BB98B0-9C3D-47F2-B708-1327E5CD1DCA', developerName: 'Flow Developer Name', contentValue: null },
                        { typeElementPropertyId: '43FF2B25-78D8-4279-B517-3F82A888084C', developerName: 'Is Done?', contentValue: null },
                        { typeElementPropertyId: 'EB621350-D117-4C16-848E-0DCE15021093', developerName: 'Owner ID', contentValue: null },
                        { typeElementPropertyId: 'EAE019C3-EA80-4DAC-844E-BAFD1A90861F', developerName: 'Owner User ID', contentValue: null },
                        { typeElementPropertyId: '8D39A782-3A8A-4816-A660-823CFDAF190D', developerName: 'Owner First Name', contentValue: null },
                        { typeElementPropertyId: '1E453F03-6365-452C-BE93-43E37B270ADD', developerName: 'Owner Last Name', contentValue: null },
                        { typeElementPropertyId: 'F72489D4-2175-4095-B4D0-113FB489F0D9', developerName: 'Owner Username', contentValue: null },
                        { typeElementPropertyId: '329A5FC0-F665-44F0-B5A9-A4DD39040FF2', developerName: 'Owner Email', contentValue: null },
                        { typeElementPropertyId: '0289AFC0-4F92-4C5A-A07D-3AF40B8F2F00', developerName: 'Owner Name', contentValue: null },
                        { typeElementPropertyId: 'DCF75168-8F6E-4FBC-9E9D-543793BC4AFD', developerName: 'Date Created', contentValue: null },
                        { typeElementPropertyId: '23F6B3CA-E136-4908-8028-AC6F975441FA', developerName: 'Date Modified', contentValue: null },
                        { typeElementPropertyId: '81707A21-EDD7-48D5-AD80-FFCFA3471B6C', developerName: 'Current Map Element ID',
                            contentValue: null },
                        { typeElementPropertyId: 'AE1EB1E1-1760-41EA-9A02-919781BFF313', developerName: 'Current Map Element Developer Name',
                            contentValue: null },
                        { typeElementPropertyId: '1A3B4FC9-912C-486E-A0FC-FF0D9F9796B7', developerName: 'Join URI', contentValue: null },
                    ],
                },
            ];
        }
        return valueElement;
    };

    /**
     * Returna copy of a value found in the generated metadata
     * or a system value
     * @param id
     */
    const getValue = (id: any) => {
        let value = getSystemValue(id.id);

        if (!value && meta.valueElements) {
            value = meta.valueElements.find(element => element.id === id.id);
        }
        if (id.typeElementPropertyId && value.defaultObjectData) {
            return clone(value.defaultObjectData[0].properties.find(prop => prop.typeElementPropertyId === id.typeElementPropertyId));
        }

        return clone(value);
    };

    /**
     * @param id
     */
    const getContentTypeForValue = (id: any) => {
        let value = getSystemValue(id.id);

        if (!value && meta.valueElements) {
            value = meta.valueElements.find(element => element.id === id.id);
        }
        if (id.typeElementPropertyId) {
            const type = meta.typeElements.find(element => element.id === value.typeElementId);
            const property = type.properties.find(prop => prop.id === id.typeElementPropertyId);
            return property.contentType;
        }

        return value.contentType;
    };

    /**
     * @param id
     */
    const getNavigationElementReferences = (id: string) => {
        if (meta.navigationElements) {
            return meta.navigationElements
                .filter((element, index) => id ? element.id === id : index === 0)
                .map((element) => {
                    return {
                        developerName: element.developerName,
                        id: element.id,
                    };
                });
        }

        return null;
    };

    const getMacro = (id: string) => {
        return meta.macroElements.find(macro => macro.id === id);
    };

    const getValueByName = (name: string) => {
        return meta.valueElements.find(element => element.developerName === name);
    };

    return {
        getContentTypeForValue,
        getNavigationElementReferences,
        getValue,
        getValueByName,
        getMacro,
        getSystemValue,
        metadata: meta,
    };
};

export default Snapshot;
