import * as io from 'socket.io-client';

import * as Log from 'loglevel';
import Engine from './engine';
import Model from './model';
import * as Settings from './settings';
import Social from './social';
import State from './state';
import Utils from './utils';

let socket = null;
const rooms = {};

function emit(flowKey, kind, data?) {
    const stateId = Utils.extractStateId(flowKey);

    if (socket && rooms[stateId] && rooms[stateId].isEnabled) {
        data = data || {};
        data.stateId = stateId;
        data.id = socket.id;
        data.owner = socket.id;

        if (socket.connected)
            socket.emit(kind, data);
        else
            socket.on('connect', socket.emit.bind(socket, kind, data));
    }
}

function onDisconnect() {
    for (const stateId in rooms) {
        socket.emit('left', { user: rooms[stateId].user, stateId: stateId });
    }
}

function onJoined(data) {
    if (rooms[data.stateId]) {
        Log.info(data.user + ' has joined ' + data.stateId + '. Users in Flow: ' + data.users);

        Model.addNotification(rooms[data.stateId].flowKey, {
            message: data.user + ' has joined. Users currently in Flow: ' + data.users,
            position: 'right',
            type: 'success',
            timeout: '2000',
            dismissible: false
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
            timeout: '2000',
            dismissible: false
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
    Engine.join(tenantId, null, null, element, data.parentStateId, State.getAuthenticationToken(data.subFlowKey), Settings.flow(null, data.subFlowKey));
}

function onSync(data) {
    Log.info('syncing ' + data.stateId);
    Engine.sync(rooms[data.stateId].flowKey);
}

function onGetValues(data) {
    const stateId = data.subStateId || data.stateId;

    Log.info('get values from: ' + data.owner + ' in ' + stateId);
    socket.emit('setValues', { stateId: stateId, id: data.id, components: State.getComponents(rooms[stateId].flowKey) });
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

export default {

    initialize(enable, flowKey) {
        const stateId = Utils.extractStateId(flowKey);

        if (!socket && enable) {
            socket = io(Settings.global('collaboration.uri'), {
                transports: ['websocket']
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

            window.addEventListener('beforeunload', event => {
                onDisconnect();
            });
        }

        if (!rooms[stateId] && enable) {
            rooms[stateId] = {
                isEnabled: true,
                flowKey: flowKey
            };
        }
    },

    isInitialized(flowKey) {
        return rooms.hasOwnProperty(Utils.extractStateId(flowKey));
    },

    enable(flowKey) {
        rooms[Utils.extractStateId(flowKey)].isEnabled = true;

        if (!socket)
            this.initialize(true, flowKey);
    },

    disable(flowKey) {
        rooms[Utils.extractStateId(flowKey)].isEnabled = false;
    },

    join(user, flowKey) {
        const stateId = Utils.extractStateId(flowKey);

        if (socket && rooms[stateId] && rooms[stateId].isEnabled) {
            rooms[stateId].user = user;
            emit(flowKey, 'join', { user: user });

            if (!socket.connected)
                socket.on('connect', this.getValues.bind(null, flowKey));
            else
                exports.default.getValues(flowKey);
        }
    },

    leave(user, flowKey) {
        const stateId = Utils.extractStateId(flowKey);
        socket.emit('left', { user: user, stateId: stateId });
    },

    push(id, values, flowKey) {
        emit(flowKey, 'change', { component: id, values: values });
    },

    sync(flowKey) {
        emit(flowKey, 'sync');
    },

    move(flowKey) {
        emit(flowKey, 'move');
    },

    flowOut(flowKey, stateId, subFlowKey) {
        emit(flowKey, 'flowOut', { subStateId: stateId, parentFlowKey: flowKey, subFlowKey: subFlowKey });
    },

    returnToParent(flowKey, parentStateId) {
        emit(flowKey, 'returnToParent', { subFlowKey: flowKey, parentStateId: parentStateId, stateId: Utils.extractStateId(flowKey) });
    },

    getValues(flowKey) {
        socket.emit('getValues', { stateId: Utils.extractStateId(flowKey), id: socket.id });
    },

    syncFeed(flowKey) {
        emit(flowKey, 'syncFeed');
    },

    remove(flowKey) {
        const stateId = Utils.extractStateId(flowKey);
        rooms[stateId] == null;
        delete rooms[stateId];
    }

};
