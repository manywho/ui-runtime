import * as React from 'react';
import { BANNER_TEXT } from '../constants';

import OfflineSvg from '../../icons/Offline.svg';
import OnlineSvg from '../../icons/Online.svg';

interface IBannerProps {
    hasNetwork: boolean;
    isOffline: boolean;
}

interface IBannerState {
    hide: boolean;
}

/**
 * @description Component for rendering a banner notification
 * to signify as to whether the flow has lost or gained network connectivity
 */
export default class Banner extends React.Component<IBannerProps, IBannerState> {

    state = {
        hide: true,
    };

    dismiss = () => {
        this.setState({ hide: true });
    }

    componentDidUpdate(prevProps) {

        // We only want to show the banner when switching
        // to and from offline/online
        if (prevProps.hasNetwork !== this.props.hasNetwork) {
            this.setState({ hide: false });
        }
    }

    render() {
        return (
            <>{ this.state.hide || (this.props.hasNetwork && !this.props.isOffline) ?
            null :
                <div className={`offline-banner alert notification ${this.props.hasNetwork ? 'alert-online' : 'alert-offline'}`}>
                    <span className="network-icon">{ this.props.hasNetwork ? <OnlineSvg height={30} /> : <OfflineSvg height={30} /> }</span>
                    <span className="format-pre-line">{this.props.hasNetwork ? BANNER_TEXT.online : BANNER_TEXT.offline}</span>
                    <button className="close" onClick={this.dismiss}>
                        <span>{'\u00D7'}</span>
                    </button>
                </div>
            }</>
        );
    }
}
