import * as React from 'react';

export default class Banner extends React.Component<any, any> {

    state = {
        hide: true,
    };

    componentDidUpdate(prevProps) {
        if (prevProps.hasNetwork !== this.props.hasNetwork) {
            this.setState(
                { hide: false },
                () => {
                    setTimeout(
                        () => { this.setState({ hide: true }); }, 5000,
                    );
                });
        }
    }

    render() {
        return (<>{ this.state.hide || (this.props.hasNetwork && !this.props.isOffline) ?
            null :
            <div id="offline-banner" className={this.props.hasNetwork ? 'success' : 'danger'}>
                {this.props.hasNetwork ?
                <p>Online</p> : <p>Offline</p>}</div>
        }</>);
    }
}
