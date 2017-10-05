

import Ajax from './ajax';
import * as Collaboration from './collaboration';
import Engine from './engine';
import * as Settings from './settings';
import State from './state';
import Utils from './utils';

declare var manywho: any;

const streams = {};

export default {

    initialize: function(flowKey, streamId) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        State.setComponentLoading('feed', { message: Settings.global('localization.loading') }, flowKey);

        const tenantId = Utils.extractTenantId(flowKey);
        const stateId = Utils.extractStateId(flowKey);
        const authenticationToken = State.getAuthenticationToken(flowKey);

        streams[lookUpKey] = {
            id: streamId
        };

        return Ajax.getSocialMe(tenantId, streamId, stateId, authenticationToken)
            .then(response => {
                streams[lookUpKey].me = response;
                return Ajax.getSocialFollowers(tenantId, streamId, stateId, authenticationToken);
            })
            .then(response => {
                streams[lookUpKey].followers = response;
                return Ajax.getSocialMessages(tenantId, streamId, stateId, 1, 10, authenticationToken);
            })
            .then(response => {
                streams[lookUpKey].messages = response;
                State.setComponentLoading('feed', null, flowKey);
                Engine.render(flowKey);
            });
    },

    getStream: function(flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);
        return streams[lookUpKey];
    },

    refreshMessages: function(flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        State.setComponentLoading('feed', { message: Settings.global('localization.loading') }, flowKey);
        Engine.render(flowKey);

        const tenantId = Utils.extractTenantId(flowKey);
        const stateId = Utils.extractStateId(flowKey);
        const authenticationToken = State.getAuthenticationToken(flowKey);
        const streamId = streams[lookUpKey].id;

        return Ajax.getSocialMessages(tenantId, streamId, stateId, 1, 10, authenticationToken)
            .then(response => {
                streams[lookUpKey].messages = response;
                State.setComponentLoading('feed', null, flowKey);
                Engine.render(flowKey);
            });

    },

    getMessages: function(flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        State.setComponentLoading('feed', { message: Settings.global('localization.loading') }, flowKey);
        Engine.render(flowKey);

        const tenantId = Utils.extractTenantId(flowKey);
        const stateId = Utils.extractStateId(flowKey);
        const authenticationToken = State.getAuthenticationToken(flowKey);
        const streamId = streams[lookUpKey].id;

        return Ajax.getSocialMessages(tenantId, streamId, stateId, streams[lookUpKey].messages.nextPage, 10, authenticationToken)
            .then(response => {
                streams[lookUpKey].messages.messages = streams[lookUpKey].messages.messages.concat(response.messages);
                streams[lookUpKey].messages.nextPage = response.nextPage;

                State.setComponentLoading('feed', null, flowKey);
                Engine.render(flowKey);
            });

    },

    sendMessage: function (flowKey, message, repliedTo, mentionedUsers, attachments) {
        if (Utils.isNullOrWhitespace(message))
            return;

        const lookUpKey = Utils.getLookUpKey(flowKey);

        const tenantId = Utils.extractTenantId(flowKey);
        const stateId = Utils.extractStateId(flowKey);
        const authenticationToken = State.getAuthenticationToken(flowKey);
        const stream = streams[lookUpKey];

        const request: any = {
            mentionedWhos: Utils.convertToArray(mentionedUsers),
            messageText: message,
            senderId: stream.me.id,
            uploadedFiles: attachments,
        };

        if (repliedTo)
            request.repliedTo = repliedTo;

        request.messageText = request.messageText.replace(/@\[[A-za-z0-9 ]*\]/ig, match => {
            return match.substring(2, match.length - 1);
        });

        State.setComponentLoading('feed', { message: Settings.global('localization.sending') }, flowKey);
        Engine.render(flowKey);

        return Ajax.sendSocialMessage(tenantId, stream.id, stateId, request, authenticationToken)
            .then(response => {

                if (repliedTo) {
                    const repliedToMessage = stream.messages.messages.find(message => message.id === repliedTo);
                    repliedToMessage.comments = repliedToMessage.comments || [];
                    repliedToMessage.comments.push(response);
                }
                else {
                    stream.messages.messages = stream.messages.messages || [];
                    stream.messages.messages.unshift(response);
                }

                Collaboration.syncFeed(flowKey);

                State.setComponentLoading('feed', null, flowKey);
                Engine.render(flowKey);
            });
    },

    toggleFollow: function(flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        const tenantId = Utils.extractTenantId(flowKey);
        const stateId = Utils.extractStateId(flowKey);
        const authenticationToken = State.getAuthenticationToken(flowKey);
        const stream = streams[lookUpKey];

        State.setComponentLoading('feed', { message: Settings.global('localization.loading') }, flowKey);
        Engine.render(flowKey);

        return Ajax.follow(tenantId, stream.id, stateId, !stream.me.isFollower, authenticationToken)
            .then(response => {
                stream.me.isFollower = !stream.me.isFollower;
                return Ajax.getSocialFollowers(tenantId, stream.id, stateId, authenticationToken);
            })
            .then(response => {
                streams[lookUpKey].followers = response;
                State.setComponentLoading('feed', null, flowKey);
                Engine.render(flowKey);
            });
    },

    getUsers: function (flowKey, name) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        const tenantId = Utils.extractTenantId(flowKey);
        const stateId = Utils.extractStateId(flowKey);
        const authenticationToken = State.getAuthenticationToken(flowKey);
        const stream = streams[lookUpKey];

        return Ajax.getSocialUsers(tenantId, stream.id, stateId, name, authenticationToken);
    },

    attachFiles: function (flowKey, formData, progress) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        const tenantId = Utils.extractTenantId(flowKey);
        const authenticationToken = State.getAuthenticationToken(flowKey);
        const stream = streams[lookUpKey];

        return Ajax.uploadSocialFile(formData, stream.id, tenantId, authenticationToken, progress);
    },

    remove: function(flowKey) {
        const lookUpKey = Utils.getLookUpKey(flowKey);

        if (streams[lookUpKey]) {
            streams[lookUpKey] == null;
            delete streams[lookUpKey];
        }
    }

};
