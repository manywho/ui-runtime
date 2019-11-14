export interface IGoOnlineState {
    isReplayAll: boolean;
}

export interface IGoOnlineProps {
    flowKey: string;
    onClose: Function;
    onOnline: Function;
    toggleIsReplaying: Function;
}
