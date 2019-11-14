import * as React from 'react';
import { values } from 'ramda';
import { IRequestFaultProps } from '../interfaces/IRequestFault';

declare const manywho: any;

class RequestFault extends React.Component<IRequestFaultProps, any> {

    constructor(props: any) {
        super(props);
    }

    render() {
        if (this.props.response.mapElementInvokeResponses) {
            let rootFaultsContent = [];
            const rootFaults = this.props.response.mapElementInvokeResponses[0].rootFaults || [];

            if (!Array.isArray(rootFaults)) {
                rootFaultsContent = values(rootFaults);
            } else {
                rootFaultsContent = rootFaults;
            }

            return <div className="request-fault">
                <h4>Faults</h4>
                <ul>
                    {rootFaultsContent.map(fault => <li className="text-danger">{fault}</li>)}
                </ul>
            </div>;
        }

        return <div className="request-fault">
            <h4>Failed Request</h4>
            <div className="text-danger">{this.props.response}</div>
        </div>;
    }
}

export default RequestFault;
