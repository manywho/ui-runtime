export interface IOfflineState {
    view?: number;
    status?: string;
    progress?: number;
    isDismissEnabled?: boolean;
    hasInitialized?: boolean;
}

export interface IOfflineProps {
    flowKey: string;
    isOffline: boolean;
    cachingProgress: number;
    toggleIsOffline: Function;
    toggleIsReplaying: Function;
}
