/**
 * A collection of helpers for generating request bodies for the various ajax requests
 */

 /** */
export const generateFlowInputs = (inputsData: any) => {
    if (inputsData && !Array.isArray(inputsData))
        inputsData = [inputsData];

    return inputsData.map(input => {

        for (const property in input) {
            if (input[property].objectData)
                return {
                    'contentType': input[property].objectData.length > 1 ? 'ContentList' : 'ContentObject',
                    'contentValue': null,
                    'developerName': property,
                    'objectData': input[property].objectData,
                    'typeElementDeveloperName': input[property].typeElementDeveloperName
                };
            else if (input[property].contentType && input[property].developerName)
                return input[property];
            else
                return {
                    'contentType': 'Content' + (typeof input[property]).charAt(0).toUpperCase() + (typeof input[property]).substring(1).toLowerCase(),
                    'contentValue': input[property],
                    'developerName': property,
                    'objectData': null,
                    'typeElementDeveloperName': null
                };
        }
    });
};

export interface IFlowId {
    id: string,
    versionId?: string
    versionid?: string
}

export const generateInitializationRequest = (flowId: IFlowId, stateId?: string, annotations?, inputs?: Array<any>, playerUrl?: string, joinUrl?: string, mode?: string, reportingMode?: string) => {
    return {
        'flowId': {
            'id': flowId.id,
            'versionId': flowId.versionid || flowId.versionId || null
        },
        'stateId': stateId || null,
        'annotations': annotations || null,
        'inputs': inputs || null,
        'playerUrl': playerUrl || null,
        'joinPlayerUrl': joinUrl || null,
        'mode': mode || '',
        'reportingMode': reportingMode || ''
    };
};

export const generateInvokeRequest = (stateData: any, invokeType: string, selectedOutcomeId?: string, selectedMapElementId?: string, pageComponentInputResponses?: Array<any>, navigationElementId?: string, selectedNavigationElementId?: string, annotations?, location?: any, mode?: string) => {
    return {
        'stateId': stateData.id,
        'stateToken': stateData.token,
        'currentMapElementId': stateData.currentMapElementId,
        'invokeType': invokeType,
        'annotations': annotations || null,
        'geoLocation': location || null,
        'mapElementInvokeRequest': {
            'pageRequest': {
                'pageComponentInputResponses': pageComponentInputResponses || null
            },
            'selectedOutcomeId': selectedOutcomeId || null
        },
        'mode': mode || '',
        'selectedMapElementId': selectedMapElementId || null,
        'navigationElementId': navigationElementId || null,
        'selectedNavigationElementId': selectedNavigationElementId || null
    };
};

export const generateNavigateRequest = (stateData: any, navigationId: string, navigationElementId: string, mapElementId: string, pageComponentInputResponses?: Array<any>, annotations?: any, location?: any) => {
    return {
        'stateId': stateData.id,
        'stateToken': stateData.token,
        'currentMapElementId': stateData.currentMapElementId,
        'invokeType': 'NAVIGATE',
        'navigationElementId': navigationId,
        'selectedMapElementId': mapElementId,
        'selectedNavigationItemId': navigationElementId,
        'annotations': annotations || null,
        'geoLocation': location || null,
        'mapElementInvokeRequest': {
            'pageRequest': {
                'pageComponentInputResponses': pageComponentInputResponses || null
            },
            'selectedOutcomeId': null
        }
    };
};

export const generateSessionRequest = (sessionId: string, sessionUrl: string, loginUrl: string, username?: string, password?: string, token?: string) => {
    return {
        'sessionToken': sessionId,
        'sessionUrl': sessionUrl,
        'loginUrl': loginUrl,
        'username': username || null,
        'password': password || null,
        'token': token || null
    };
};
