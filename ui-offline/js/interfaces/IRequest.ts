export interface IRequestState {
    isCollapsed: boolean;
    isReplaying: boolean;
    response: any;
    progress: number;
}

export interface IRequestProps {
    flowKey: string;
    cachedRequest: any;
    tenantId: string;
    authenticationToken: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onReplayDone: Function;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onDelete: Function;
    replayNow: boolean;
    isDisabled: boolean;
    // eslint-disable-next-line @typescript-eslint/ban-types
    cancelReplay: Function;
}
