import { parseContent } from './Utils';

interface IMapElement {
    developerName: string;
    id: string;
    outcomes: any;
    userContent: string;
}

/**
 * Support for flow steps whilst flow is offline
 */
const Step = {

    /**
     * @param mapElement
     * @param snapshot
     */
    generate(mapElement: IMapElement, snapshot) {

        const containerId = '09c5cb4f-3e7e-4f76-98a7-f6287a33043f';
        const componentId = '98a76ab7-4852-4093-9472-fc1c44283510';

        return {
            developerName: mapElement.developerName,
            mapElementId: mapElement.id,
            outcomeResponses: mapElement.outcomes,
            pageResponse: {
                pageContainerResponses: [
                    {
                        containerType: 'VERTICAL_FLOW',
                        developerName: 'Step',
                        id: containerId,
                    },
                ],
                pageComponentResponses: [
                    {
                        componentType: 'PRESENTATION',
                        developerName: 'Step Content',
                        id: componentId,
                        pageContainerId: containerId,
                        pageContainerDeveloperName: 'Step',
                    },
                ],
                pageContainerDataResponses: [
                    {
                        pageContainerId: containerId,
                        isEnabled: true,
                        isVisible: true,
                        isEditable: true,
                    },
                ],
                pageComponentDataResponses: [
                    {
                        pageComponentId: componentId,
                        isVisible: true,
                        isEnabled: true,
                        content: parseContent(mapElement.userContent, snapshot),
                    },
                ],
            },
        };
    },
};

export default Step;
