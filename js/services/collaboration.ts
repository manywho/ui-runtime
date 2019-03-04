import * as io from 'socket.io-client';

import * as Log from 'loglevel';
import * as Engine from './engine';
import * as Model from './model';
import * as Settings from './settings';
import * as Social from './social';
import * as State from './state';
import * as Utils from './utils';

let socket = null;
const rooms = {};

function emit(flowKey, kind, data?) {
    const stateId = Utils.extractStateId(flowKey);

    if (socket && rooms[stateId] && rooms[stateId].isEnabled) {
        data = data || {};
        data.stateId = stateId;
        data.id = socket.id;
        data.owner = socket.id;

        if (socket.connected) {
            socket.emit(kind, data);
        }
        else {
            socket.on('connect', socket.emit.bind(socket, kind, data));
        }
    }
}

function onDisconnect() {
    for (const stateId in rooms) {
        socket.emit('left', {
            stateId,
            user: rooms[stateId].user,
        });
    }
}

function onJoined(data) {
    if (rooms[data.stateId]) {
        Log.info(data.user + ' has joined ' + data.stateId + '. Users in Flow: ' + data.users);

        Model.addNotification(rooms[data.stateId].flowKey, {
            message: data.user + ' has joined. Users currently in Flow: ' + data.users,
            position: 'right',
            type: 'success',
            timeout: 2000,
            dismissible: false,
        });
    }
}

function onLeft(data) {
    if (rooms[data.stateId]) {
        Log.info(data.user + ' has left ' + data.stateId + '. Users in Flow: ' + data.users);

        Model.addNotification(rooms[data.stateId].flowKey, {
            message: data.user + ' has left. Users in Flow: ' + data.users,
            position: 'right',
            type: 'danger',
            timeout: 2000,
            dismissible: false,
        });
    }
}

function onChange(data) {
    Log.info('change to: ' + data.component + ' in ' + data.stateId);

    State.setComponent(data.component, data.values, rooms[data.stateId].flowKey, false);
    Engine.render(rooms[data.stateId].flowKey);
}

function onMove(data) {
    Log.info('re-joining ' + data.stateId);

    const flowKey = rooms[data.stateId].flowKey;

    const tenantId = Utils.extractTenantId(flowKey);
    const flowId = Utils.extractFlowId(flowKey);
    const flowVersionId = Utils.extractFlowVersionId(flowKey);
    const stateId = Utils.extractStateId(flowKey);
    const element = Utils.extractElement(flowKey);

    // Re-join the flow here so that we sync with the latest state from the manywho server
    Engine.join(tenantId, flowId, flowVersionId, element, stateId, State.getAuthenticationToken(flowKey), Settings.flow(null, flowKey))
        .then(() => {
            socket.emit('getValues', data);
        });
}

function onFlowOut(data) {
    Log.info('joining subflow ' + data.subStateId);

    const element = Utils.extractElement(data.parentFlowKey);
    const tenantId = Utils.extractTenantId(data.parentFlowKey);

    State.setComponentLoading(element, null, data.parentFlowKey);
    Engine.render(data.parentFlowKey);

    Utils.removeFlow(data.parentFlowKey);
    const stateId = Utils.extractStateId(data.subFlowKey);

    // Re-join the flow here so that we sync with the latest state from the manywho server
    Engine.join(tenantId, null, null, element, stateId, null, Settings.flow(null, data.parentFlowKey));
}

function onReturnToParent(data) {
    Log.info('returning to parent ' + data.parentStateId);

    const tenantId = Utils.extractTenantId(data.subFlowKey);
    const element = Utils.extractElement(data.subFlowKey);

    State.setComponentLoading(element, null, data.subFlowKey);
    Engine.render(data.subFlowKey);

    Utils.removeFlow(data.subFlowKey);

    // Re-join the flow here so that we sync with the latest state from the manywho server
    Engine.join(tenantId,
                null,
                null,
                element,
                data.parentStateId,
                State.getAuthenticationToken(data.subFlowKey),
                Settings.flow(null, data.subFlowKey));
}

function onSync(data) {
    Log.info('syncing ' + data.stateId);
    Engine.sync(rooms[data.stateId].flowKey);
}

function onGetValues(data) {
    const stateId = data.subStateId || data.stateId;

    Log.info('get values from: ' + data.owner + ' in ' + stateId);
    socket.emit('setValues', { stateId, id: data.id, components: State.getComponents(rooms[stateId].flowKey) });
}

function onSetValues(data) {
    Log.info('setting values in ' + data.stateId);
    State.setComponents(data.components, rooms[data.stateId].flowKey);
    Engine.render(rooms[data.stateId].flowKey);
}

function onSyncFeed(data) {
    Log.info('syncing feed in ' + data.stateId);
    Social.refreshMessages(rooms[data.stateId].flowKey);
}

/**
 * Open a websocket connection to the collaboration server endpoint, as defined in the `collaboration.uri` setting
 * @param flowKey
 */
export const initialize = (flowKey: string) => {
    const stateId = Utils.extractStateId(flowKey);

    if (!socket) {
        socket = io(Settings.global('collaboration.uri'), {
            transports: ['websocket'],
        });

        socket.on('disconnect', onDisconnect);
        socket.on('joined', onJoined);
        socket.on('left', onLeft);
        socket.on('change', onChange);
        socket.on('move', onMove);
        socket.on('flowOut', onFlowOut);
        socket.on('returnToParent', onReturnToParent);
        socket.on('sync', onSync);
        socket.on('getValues', onGetValues);
        socket.on('setValues', onSetValues);
        socket.on('syncFeed', onSyncFeed);

        window.addEventListener('beforeunload', (event) => {
            onDisconnect();
        });
    }

    if (!rooms[stateId]) {
        rooms[stateId] = {
            flowKey,
            isEnabled: true,
        };
    }
};

/**
 * Has `initialize` been called for this state
 */
export const isInitialized = (flowKey: string): boolean => {
    return rooms.hasOwnProperty(Utils.extractStateId(flowKey));
};

/**
 * Set `isEnabled` to true for this state, if we have initialized a socket yet then `initialize` will also be called
 * @param flowKey
 */
export const enable = (flowKey: string) => {
    rooms[Utils.extractStateId(flowKey)].isEnabled = true;

    if (!socket) {
        initialize(flowKey);
    }
};

/**
 * Set `isEnabled` to false for this state
 */
export const disable = (flowKey: string) => {
    rooms[Utils.extractStateId(flowKey)].isEnabled = false;
};

/**
 * Emit a `join` event to the collaboration server, then call `getValues`
 */
export const join = (user, flowKey) => {
    const stateId = Utils.extractStateId(flowKey);

    if (socket && rooms[stateId] && rooms[stateId].isEnabled) {
        rooms[stateId].user = user;
        emit(flowKey, 'join', { user });

        if (!socket.connected) {
            socket.on('connect', this.getValues.bind(null, flowKey));
        }
        else {
            getValues(flowKey);
        }
    }
};

/**
 * Emit a `left` event to the collaboration server
 */
export const leave = (user: any, flowKey: string) => {
    const stateId = Utils.extractStateId(flowKey);
    socket.emit('left', { user, stateId });
};

/**
 * Emit a `change` event to the collaboration server
 */
export const push = (id: string, values, flowKey: string) => {
    emit(flowKey, 'change', { values, component: id });
};

/**
 * Emit a `sync` event to the collaboration server
 */
export const sync = (flowKey: string) => {
    emit(flowKey, 'sync');
};

/**
 * Emit a `move` event to the collaboration server
 */
export const move = (flowKey: string) => {
    emit(flowKey, 'move');
};

/**
 * Emit a `flowOut` event to the collaboration server
 */
export const flowOut = (flowKey: string, stateId: string, subFlowKey: string) => {
    emit(flowKey, 'flowOut', { subFlowKey, subStateId: stateId, parentFlowKey: flowKey });
};

/**
 * Emit a `returnToParent` event to the collaboration server
 */
export const returnToParent = (flowKey: string, parentStateId: string) => {
    emit(flowKey, 'returnToParent', { parentStateId, subFlowKey: flowKey, stateId: Utils.extractStateId(flowKey) });
};

/**
 * Emit a `getValues` event to the collaboration server
 */
export const getValues = (flowKey: string) => {
    socket.emit('getValues', { stateId: Utils.extractStateId(flowKey), id: socket.id });
};

/**
 * Emit a `syncFeed` event to the collaboration server
 */
export const syncFeed = (flowKey: string) => {
    emit(flowKey, 'syncFeed');
};

/**
 * Remove all local data about the collaboration state
 * @param flowKey
 */
export const remove = (flowKey: string) => {
    const stateId = Utils.extractStateId(flowKey);
    rooms[stateId] == null;
    delete rooms[stateId];
};
