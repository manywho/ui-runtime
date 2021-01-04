export enum OfflineView {
    cache = 0,
    replay = 1,
    noNetwork = 2,
}

export interface IOfflineState {
    view?: OfflineView;
    status?: string;
    progress?: number;
    isDismissEnabled?: boolean;
}

export interface IOfflineProps {
    flowKey: string;
    isOffline: boolean;
    hasNetwork: boolean;
    cachingProgress: number;
    toggleIsOffline: Function;
    toggleIsReplaying: Function;
    toggleIsOnline: Function;
}
