import ObjectDataCaching from './ObjectDataCaching';
import { IFlow } from '../../interfaces/IModels';

declare const manywho: any;

const OnCached = (flow: IFlow) => {
    const flowKey = manywho.utils.getFlowKey(
        flow.tenantId,
        flow.id.id,
        flow.id.versionId,
        flow.state.id,
        'main',
    );
    const pollInterval = manywho.settings.global(
        'offline.cache.objectDataCachingInterval',
        flowKey,
    );

    return setTimeout(
        () => { ObjectDataCaching(flow); }, pollInterval,
    );
};

export default OnCached;
