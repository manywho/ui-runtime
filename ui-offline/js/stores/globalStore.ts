import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import reducers from '../reducers';

export default function globalStore() {
    return createStore(
        reducers,
        applyMiddleware(reduxThunk),
    );
}
