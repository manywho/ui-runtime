interface IFlowId {
    id: string;
    versionId: string;
    typeElementPropertyId?: string;
}

export interface IFlow {
    authenticationToken?: string;
    id?: IFlowId;
    objectData?: any;
    requests?: any;
    state: any;
    tenantId: string;
    cacheObjectData?: Function;
    addRequest?: Function;
    getObjectData?: Function;
}

export interface IState {
    currentMapElementId: string;
    id: string;
    token: string;
    values: any;
    getValue?: Function;
    setValue?: Function;
}
