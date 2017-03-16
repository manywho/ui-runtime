/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.GoOnline = class GoOnline extends React.Component<any, any> {

    displayName = 'Go-Online';

    constructor(props: any) {
        super(props);
        this.state = {
            progress: 0,
            isDismissVisible: false
        };
    }

    onClick = (e) => {
        this.setState({ isProgressVisible: true });

        manywho.settings.initialize({
            offline: {
                isOnline: true
            }
        });

        const tenantId = manywho.utils.extractTenantId(this.props.flowKey);
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const authenticationToken = manywho.state.getAuthenticationToken(stateId);

        manywho.offline.replay(tenantId, stateId, authenticationToken, this.onDone, null, this.onProgress);
    }

    onProgress = (current, total) => {
        this.setState({ progress: Math.min((current / total) * 100, 100) });
    }

    onDone = () => {
        this.setState({ progress: 100 });

        manywho.offline.storage.clearRequests()
            .then(() => this.setState({ isDismissVisible: true }));
    }

    onDismiss = () => {
        this.props.onOnline();
    }

    render() {
        const style = {
            width: `${this.state.progress}%`
        };

        let progress = null;
        if (this.state.isProgressVisible)
            progress = <div className="go-offline-status">
                <div className="wait-spinner" />
                <div className="progress">
                    <div className="progress-bar progress-bar-striped active" style={style} />
                </div>
                {this.state.isDismissVisible ? <button className="btn btn-success" onClick={this.onDismiss}>Continue Online</button> : <h4>Syncing Data...</h4>}
            </div>;

        return <div className="go-offline">
            <button className="btn btn-info" onClick={this.onClick}>Go Online</button>
            {progress}
        </div>;
    }
};
