import { combineReducers } from 'redux';
import isOffline from './isOffline';
import isReplaying from './isReplaying';
import cachingProgress from './cachingProgress';

export default combineReducers({
    isOffline,
    isReplaying,
    cachingProgress,
});
