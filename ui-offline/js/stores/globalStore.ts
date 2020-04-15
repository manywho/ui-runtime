
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import reduxThunk from 'redux-thunk';
import reducers from '../reducers';

const reduxMiddleware = [
    reduxThunk,
];

const enhancers = composeWithDevTools(
    applyMiddleware(...reduxMiddleware),
);

export default function globalStore() {
    return createStore(
        reducers,
        enhancers,
    );
}
