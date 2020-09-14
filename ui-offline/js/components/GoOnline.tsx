import * as React from 'react';
import Request from './Request';
import { getOfflineData, removeOfflineData } from '../services/Storage';
import { IGoOnlineProps, IGoOnlineState } from '../interfaces/IGoOnline';
import { connect } from 'react-redux';
import { isReplaying } from '../actions';
import { FlowInit, removeRequest, removeRequests } from '../models/Flow';
import { IFlow } from '../interfaces/IModels';

declare const manywho: any;

const mapStateToProps = (state: IGoOnlineState) => state;

const mapDispatchToProps = {
    isReplaying,
};

export class GoOnline extends React.Component<IGoOnlineProps, IGoOnlineState> {

    flow = null;

    constructor(props: IGoOnlineProps) {
        super(props);

        const isReplayAll = manywho.settings.global(
            'offline.instantReplay',
            props.flowKey,
        );

        this.state = {
            isReplayAll,
        };
    }

    componentDidMount() {
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const id = manywho.utils.extractFlowId(this.props.flowKey);

        getOfflineData(stateId, id, null)
            .then((flow:IFlow) => {

                if (flow) {
                    this.flow = FlowInit(flow);

                    if (!this.flow.requests || this.flow.requests.length === 0) {

                        // The data stored inside indexdb contains no requests,
                        // so just rejoin the flow
                        removeOfflineData(stateId)
                            .then(() => this.props.onOnline())
                            .catch((e) => console.error(e));
                    } else {

                        // The entry in indexDB needs to be wiped
                        // otherwise as requests are made to sync with thengine
                        // the offline middleware will still assume we are in offline mode
                        removeOfflineData(stateId)
                            .then(() => { this.props.isReplaying(true); })
                            .catch((e) => console.error(e));
                    }
                } else {

                    // At this point if there is no data stored in indexdb
                    // then that would mean that the user has probably been
                    // paginating through objectdata cached in state or performed
                    // some other action whereby requests back to the engine have not been required
                    // Therefore, there are no requests to replay and we can safely rejoin the flow
                    this.props.onOnline();
                }
            })
            .catch((e) => console.error(e));
    }

    onDeleteRequest = (request) => {
        removeRequest(request);
        this.forceUpdate();
    };

    onReplayDone = (request) => {
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const index = this.flow.requests.indexOf(request);

        if (index === this.flow.requests.length - 1) {
            this.onDeleteRequest(request);
            removeOfflineData(stateId)
                .then(() => this.props.onOnline())
                .catch((e) => console.error(e));
        } else {
            this.onDeleteRequest(request);
        }
    };

    onReplayAll = () => {
        this.setState({ isReplayAll: true });
    };

    onDeleteAll = () => {
        removeRequests();
        this.props.onOnline();
    };

    onClose = () => {
        this.props.onClose(this.flow);
    };

    render() {
        let cachedRequests = null;

        // The auth token must always come from state and not from
        // the indexdb cache, this will prevent successful replays
        // occuring inside a flow which has a stale auth token
        const latestAuthenticationToken = manywho.state.getAuthenticationToken(this.props.flowKey);
        if (this.flow) {
            cachedRequests = this.flow.requests.map((cachedRequest, index) => {
                cachedRequest.request.stateId = this.flow.state.id;
                cachedRequest.request.stateToken = this.flow.state.token;

                return (
                    <Request
                        cachedRequest={cachedRequest}
                        tenantId={this.flow.tenantId}
                        authenticationToken={latestAuthenticationToken}
                        isDisabled={false}
                        onDelete={this.onDeleteRequest}
                        onReplayDone={this.onReplayDone}
                        replayNow={index === 0 && this.state.isReplayAll}
                        flowKey={this.props.flowKey}
                        cancelReplay={this.onClose}
                        key={cachedRequest.request.key}
                    />
                );
            });
        }

        return (
            <div className="offline-status">
                <div className="panel panel-default">
                    <div className="panel-body sync-pending-requests">
                        <h4>Go Online</h4>
                        <div className="pending-requests">
                            <ul className="list-group">
                                {cachedRequests}
                            </ul>
                        </div>
                    </div>
                    <div className="panel-footer">
                        <button className="btn btn-danger pull-left" onClick={this.onDeleteAll}>Delete All</button>
                        <button className="btn btn-default pull-right" onClick={this.onClose}>Close</button>
                        <button className="btn btn-primary pull-right pending-requests-replay-all" onClick={this.onReplayAll}>Replay All</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(GoOnline);
