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
    // eslint-disable-next-line @typescript-eslint/ban-types
    cacheObjectData?: Function;
    // eslint-disable-next-line @typescript-eslint/ban-types
    addRequest?: Function;
    // eslint-disable-next-line @typescript-eslint/ban-types
    getObjectData?: Function;
}

export interface IState {
    currentMapElementId: string;
    id: string;
    token: string;
    values: any;
    // eslint-disable-next-line @typescript-eslint/ban-types
    getValue?: Function;
    // eslint-disable-next-line @typescript-eslint/ban-types
    setValue?: Function;
}

export interface Id {
    id: string;
    typeElementPropertyId: string;
}
