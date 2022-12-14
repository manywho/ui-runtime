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
    // eslint-disable-next-line @typescript-eslint/ban-types
    toggleIsOffline: Function;
    // eslint-disable-next-line @typescript-eslint/ban-types
    toggleIsReplaying: Function;
    // eslint-disable-next-line @typescript-eslint/ban-types
    toggleIsOnline: Function;
}
