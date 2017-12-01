import * as Ajax from './ajax';
import * as Collaboration from './collaboration';
import * as Engine from './engine';
import * as Settings from './settings';
import * as State from './state';
import * as Utils from './utils';

const streams = {};

/**
 * Initialize the social stream by requesting `Ajax.getSocialMe` then `Ajax.getSocialMessages`, then render the feed
 */
export const initialize = (flowKey: string, streamId: string) => {
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
};

/**
 * Get the currently active stream
 */
export const getStream = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return streams[lookUpKey];
};

/**
 * Refresh the current page of messages via `Ajax.getSocialMessages` then display them in the feed
 */
export const refreshMessages = (flowKey: string) => {
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

};

/**
 * Get the messages for this stream via `Ajax.getSocialMessages` then display them in the feed
 */
export const getMessages = (flowKey: string) => {
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

};

/**
 * Send a message to the social stream
 * @param message Message content
 * @param repliedTo Id of the message thats being replied to (optional)
 * @param mentionedUsers @ mentioned users
 * @param attachments Files to be uploaded as part of the message
 */
export const sendMessage = (flowKey: string, message: string, repliedTo: string, mentionedUsers: any, attachments: any) => {
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
};

/**
 * Display the loading indicator in the social feed, toggle follow status with `Ajax.follow` then re-render
 */
export const toggleFollow = (flowKey: string) => {
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
};

/**
 * Get the users for this stream via `Ajax.getUsers`, optionally filter by a specific name
 */
export const getUsers = (flowKey: string, name?: string): JQueryXHR => {
    const lookUpKey = Utils.getLookUpKey(flowKey);

    const tenantId = Utils.extractTenantId(flowKey);
    const stateId = Utils.extractStateId(flowKey);
    const authenticationToken = State.getAuthenticationToken(flowKey);
    const stream = streams[lookUpKey];

    return Ajax.getSocialUsers(tenantId, stream.id, stateId, name, authenticationToken);
};

/**
 * Upload a file to the stream via `Ajax.uploadSocialFile`
 */
export const attachFiles = (flowKey: string, formData: FormData, onProgress: EventListenerOrEventListenerObject): JQueryXHR => {
    const lookUpKey = Utils.getLookUpKey(flowKey);

    const tenantId = Utils.extractTenantId(flowKey);
    const authenticationToken = State.getAuthenticationToken(flowKey);
    const stream = streams[lookUpKey];

    return Ajax.uploadSocialFile(formData, stream.id, tenantId, authenticationToken, onProgress);
};

/**
 * Remove locally cached data on the social stream for this state
 */
export const remove = (flowKey: string) => {
    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (streams[lookUpKey]) {
        streams[lookUpKey] == null;
        delete streams[lookUpKey];
    }
};
