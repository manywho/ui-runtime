import { addRequest, FlowInit, getObjectData, getRequests, getFlowModel } from '../models/Flow';
import DataActions from './DataActions';
import ObjectData from './ObjectData';
import { executeOperation, invokeMacroWorker } from './Operation';
import { generatePage } from './Page';
import Rules from './Rules';
import Snapshot from './Snapshot';
import Step from './Step';
import { StateUpdate } from '../models/State';
import { getOfflineData, setOfflineData } from './Storage';
import { IFlow } from '../interfaces/IModels';
import { flatten, guid } from './Utils';
import { DEFAULT_POLL_INTERVAL, DEFAULT_OBJECTDATA_CACHING_INTERVAL } from '../constants';

declare const manywho: any;
// This is the gloabl metaData object generated when building offline project
declare const metaData: any;

enum EventTypes {
    invoke = 'invoke',
    join = 'join',
    navigation = 'navigation',
    initialization = 'initialization',
    file = 'fileData',
    objectData = 'objectData',
}

const OfflineCore = {
    /**
     * @param tenantId
     * @param stateId
     * @param stateToken
     * @param authenticationToken
     * @description initialzing a model in state. This occurs when
     * a flow is first initialized and is not yet in offline mode
     */
    initialize(tenantId: string, stateId: string, stateToken: string, authenticationToken: string) {
        if (!metaData) {
            return null;
        }

        const flow = {
            authenticationToken,
            tenantId,
            state: {
                id: stateId,
                token: stateToken,
            },
            id: metaData.id,
        };

        return FlowInit(flow);
    },

    /**
     * Invoking the flow once the user has come back online
     * @param flowKey
     */
    rejoin(flowKey: string) {
        const tenantId = manywho.utils.extractTenantId(flowKey);
        const flowId = manywho.utils.extractFlowId(flowKey);
        const flowVersionId = manywho.utils.extractFlowVersionId(flowKey);
        const element = manywho.utils.extractElement(flowKey);
        const stateId = manywho.utils.extractStateId(flowKey);
        const authenticationToken = manywho.state.getAuthenticationToken(flowKey);

        return manywho.engine.join(
            tenantId,
            flowId,
            flowVersionId,
            element,
            stateId,
            authenticationToken,
            manywho.settings.flow(null, flowKey),
        );
    },

    /**
     * Determine how to handle api request to engine
     * based on the type of event is defined
     * @param context
     * @param event
     * @param urlPart
     * @param request
     * @param tenantId
     * @param stateId
     */
    getResponse(
        context: any,
        event: EventTypes,
        urlPart: string,
        request: any,
        tenantId: string,
        stateId: string,
    ) {
        // When running a flow in debug mode, calls to the
        // logging endpoint are being intercepted, this handles that.
        if (manywho.utils.isEqual(event, 'log')) {
            return Promise.resolve();
        }

        let flowStateId = stateId;
        if (request && request.stateId) {
            flowStateId = request.stateId;
        } else if (manywho.utils.isEqual(event, 'join', true)) {
            flowStateId = urlPart.substr(urlPart.lastIndexOf('/') + 1);
        } else if (manywho.utils.isEqual(event, 'initialization', true)) {
            flowStateId = '00000000-0000-0000-0000-000000000000';
        }

        const flowId = request && request.flowId ? request.flowId.id : null;

        // Lets get the entry in indexDB for this state
        return getOfflineData(flowStateId, flowId, event)
            .then((response: IFlow) => {
                // When a flow has entered offline mode for the first time
                // there will be no entry in indexDB, there will however
                // be a representation of the data needed cached in state
                const dbResponse = response || getFlowModel();

                if (manywho.utils.isEqual(event, 'initialization') && !response) {
                    const flow = FlowInit({
                        tenantId,
                        state: {
                            currentMapElementId: metaData.mapElements.find(
                                (element) => element.elementType === 'START',
                            ).id,
                            id: stateId,
                            token: guid(),
                        },
                    });

                    return setOfflineData(flow).then(() => flow);
                }

                // Reinitilize the data in state to ensure
                // that state matches with cache
                return FlowInit(dbResponse);
            })
            .then((flow) => {
                // If request is an initialization request and there is an entry in indexdb
                // then we can assume that the flow user wants to pick up where they left
                // off in a previous state. So we then want to return a join response
                if (
                    (manywho.utils.isEqual(event, 'join', true) ||
                        event === EventTypes.initialization) &&
                    flow
                ) {
                    return this.getMapElementResponse(
                        {
                            invokeType: 'JOIN',
                            currentMapElementId: flow.state.currentMapElementId,
                            stateId: flow.state.id,
                            stateToken: flow.state.token,
                        },
                        flow,
                        context,
                    );
                }
                if (manywho.utils.isEqual(event, 'initialization', true)) {
                    return this.getInitializationResponse(request, flow, context);
                }
                if (request.mapElementInvokeRequest) {
                    return this.getMapElementResponse(request, flow, context);
                }
                if (request.navigationElementId) {
                    return this.getNavigationResponse(request, flow, context);
                }
                return this.getObjectDataResponse(request, flow, context);
            });
    },

    getUploadResponse(files, request, stateId) {
        const snapshot = Snapshot(metaData);

        request.type = EventTypes.file;
        request.files = files;

        // Add request to Flow repository
        addRequest(request, snapshot);

        // Pull the current offline data from local storage
        getOfflineData(stateId)
            .then((offlineData: IFlow) => {
                // Add the requests from the Flow repository
                // to the offline data object
                offlineData.requests = getRequests();

                // Push the updated offline data back into local storage
                return setOfflineData(offlineData);
            })
            .catch((e) => console.error(e));

        return {
            objectData: [],
        };
    },

    /**
     * @param request
     * @param flow
     */
    getInitializationResponse(request: any, flow: IFlow) {
        const snapshot: any = Snapshot(metaData);

        // TODO - this will only ever get called when a flow is initialized
        // when there is no network connection to start with, which is
        // currently an unsupported scenario. A service worker will need to be
        // implemented to cache assets
        return {
            currentMapElementId: metaData.mapElements.find(
                (element) => element.elementType === 'START',
            ).id,
            currentStreamId: null,
            navigationElementReferences: snapshot.getNavigationElementReferences(),
            stateId: flow.state.id,
            stateToken: flow.state.token,
            statusCode: '200',
        };
    },

    /**
     * Handling map element requests by imitating the expected response
     * the UI would get when online.
     * @param request
     * @param flow
     * @param context
     */
    getMapElementResponse(request: any, flow: IFlow, context: any) {
        if (!metaData) {
            return null;
        }

        const mapElement: any = request.currentMapElementId
            ? metaData.mapElements.find((element) => element.id === request.currentMapElementId)
            : metaData.mapElements.find((element) => element.elementType === 'START');
        let nextMapElement = null;

        switch (request.invokeType.toUpperCase()) {
            case 'FORWARD': {
                let nextMapElementId = null;
                let outcome = null;

                if (request.mapElementInvokeRequest.selectedOutcomeId) {
                    outcome = mapElement.outcomes.find(
                        (item) => item.id === request.mapElementInvokeRequest.selectedOutcomeId,
                    );
                } else if (request.selectedMapElementId) {
                    nextMapElementId = request.selectedMapElementId;
                } else {
                     
                    outcome = mapElement.outcomes[0];
                }

                if (outcome) {
                    nextMapElementId = outcome.nextMapElementId;
                }

                nextMapElement = metaData.mapElements.find(
                    (element) => element.id === nextMapElementId,
                );
                break;
            }

            case 'NAVIGATE': {
                const navigation = metaData.navigationElements.find(
                    (element) => element.id === request.navigationElementId,
                );
                const navigationItem = navigation.navigationItems.find(
                    (item) => item.id === request.selectedNavigationItemId,
                );
                nextMapElement = metaData.mapElements.find(
                    (element) => element.id === navigationItem.locationMapElementId,
                );
                break;
            }

            case 'JOIN':
                nextMapElement = mapElement;
                break;

            case 'SYNC':
                nextMapElement = mapElement;
                break;

            default:
                // TODO - Raise error ?
                break;
        }

        const snapshot: any = Snapshot(metaData);

        if (
            (manywho.utils.isEqual(mapElement.elementType, 'input', true) ||
                manywho.utils.isEqual(mapElement.elementType, 'step', true)) &&
            request.invokeType.toUpperCase() !== 'JOIN' // Join requests should not be synced
        ) {
            addRequest(request, snapshot);
        }

        if (
            mapElement.elementType === 'input' &&
            request.mapElementInvokeRequest &&
            request.mapElementInvokeRequest.pageRequest &&
            request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses
        ) {
            StateUpdate(
                request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses,
                mapElement,
                snapshot,
            );
        }

        if (nextMapElement.dataActions) {
            nextMapElement.dataActions
                .filter((action) => !action.disabled)
                .sort((a, b) => a.order - b.order)
                .forEach((action) => {
                    DataActions(action, flow, snapshot);
                });
        }

        if (nextMapElement.operations) {
            const sortedOperations = nextMapElement.operations.sort((a, b) => a.order - b.order);

            // Using async function as it is important that
            // asyncronous operations are executed in order
            const executeOperations = async (operations) => {
                for (const operation of operations) {
                    if (operation.macroElementToExecuteId) {
                        // Execute a macro
                         
                        await invokeMacroWorker(operation, flow.state, snapshot);
                    } else {
                        // Execute an operation
                         
                        await executeOperation(operation, flow.state, snapshot);
                    }
                }

                // Once all operations have completed we can return
                // a response back to the UI
                return this.constructResponse(nextMapElement, request, snapshot, flow, context);
            };

            return executeOperations(sortedOperations);
        }

        return this.constructResponse(nextMapElement, request, snapshot, flow, context);
    },

    constructResponse(nextMapElement, request, snapshot, flow, context) {
        let pageResponse = null;
        if (nextMapElement.elementType === 'step') {
            pageResponse = Step.generate(nextMapElement, snapshot);
        } else if (nextMapElement.elementType === 'input') {
            pageResponse = generatePage(request, nextMapElement, flow.state, snapshot);
        } else if (!nextMapElement.outcomes || nextMapElement.outcomes.length === 0) {
            pageResponse = {
                developerName: 'done',
                mapElementId: nextMapElement.id,
            };
        }

        if (nextMapElement.outcomes && !pageResponse) {
            return setOfflineData(flow).then(() =>
                OfflineCore.getResponse(
                    context,
                    null,
                    null,
                    {
                        currentMapElementId: nextMapElement.id,
                        mapElementInvokeRequest: {
                            selectedOutcomeId: Rules.getOutcome(
                                nextMapElement.outcomes,
                                flow.state,
                                snapshot,
                            ).id,
                        },
                        invokeType: 'FORWARD',
                        stateId: request.stateId,
                    },
                    request.tenantId,
                    request.stateId,
                ),
            );
        }

        flow.state.currentMapElementId = nextMapElement.id;
        setOfflineData(flow).catch((e) => console.error(e));

        return {
            currentMapElementId: nextMapElement.id,
            invokeType: nextMapElement.outcomes ? 'FORWARD' : 'DONE',
            mapElementInvokeResponses: [pageResponse],
            navigationElementReferences: snapshot.getNavigationElementReferences(),
            stateId: request.stateId,
            stateToken: request.stateToken,
            statusCode: '200',
        };
    },

    /**
     * @param request
     */
    getObjectDataResponse(request: any) {
        return ObjectData.filter(
            getObjectData(
                request.objectDataType
                    ? request.objectDataType.typeElementId
                    : request.typeElementId,
            ),
            request.listFilter,
        );
    },

    /**
     * @param request
     * @param flow
     */
    getNavigationResponse(request: any, flow: IFlow) {
        if (!metaData) {
            return null;
        }

        const navigation = metaData.navigationElements[0];

        const navigationItems = navigation.navigationItems ? navigation.navigationItems : [];

        return {
            developerName: navigation.developerName,
            isEnabled: true,
            isVisible: true,
            label: navigation.label,
            navigationItemResponses: navigationItems.sort((a, b) => a.order - b.order),
            navigationItemDataResponses: flatten(
                navigation.navigationItems,
                null,
                [],
                'navigationItems',
                null,
            ).map((item) => ({
                navigationItemId: item.id,
                navigationItemDeveloperName: item.developerName,
                isActive: false,
                isCurrent: item.locationMapElementId === flow.state.currentMapElementId,
                isEnabled: true,
                isVisible: true,
                locationMapElementId: item.locationMapElementId,
            })),
        };
    },
};

export default OfflineCore;

manywho.settings.initialize({
    offline: {
        instantReplay: false,
        cache: {
            pollInterval: DEFAULT_POLL_INTERVAL,
            objectDataCachingInterval: DEFAULT_OBJECTDATA_CACHING_INTERVAL,
            requests: {
                limit: 250,
                pageSize: 10,
            },
        },
    },
});
