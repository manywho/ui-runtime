import * as React from 'react';
import { Provider } from 'react-redux';
import store from '../stores/store';
import Offline from './Offline';

class App extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }

    render() {
        return <div>
            <Provider store={store}>
                <Offline flowKey={this.props.flowKey} />
            </Provider>
        </div>;
    }
}

export default App;
