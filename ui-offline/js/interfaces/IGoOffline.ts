export interface IGoOfflineState {
    status: string;
    progress: number;
    isProgressVisible: boolean;
    isDismissEnabled: boolean;
}

export interface IGoOfflineProps {
    flowKey: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onOffline: Function;
}
