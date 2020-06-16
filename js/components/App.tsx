import * as React from 'react';
import { Provider } from 'react-redux';
import store from '../stores/store';
import Offline from './Offline';

const App = ({ flowKey }) => (
    <div>
        <Provider store={store}>
            <Offline flowKey={flowKey} />
        </Provider>
    </div>
);

export default App;
