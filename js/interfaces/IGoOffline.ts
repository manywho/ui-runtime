export interface IGoOfflineState {
    status: string;
    progress: number;
    isProgressVisible: boolean;
    isDismissEnabled: boolean;
}

export interface IGoOfflineProps {
    flowKey: string;
    onOffline: Function;
}
