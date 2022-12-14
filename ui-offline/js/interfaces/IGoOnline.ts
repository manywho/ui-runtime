export interface IGoOnlineState {
    isReplayAll: boolean;
}

export interface IGoOnlineProps {
    flowKey: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onClose: Function;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onOnline: Function;
    // eslint-disable-next-line @typescript-eslint/ban-types
    isReplaying: Function;
}
