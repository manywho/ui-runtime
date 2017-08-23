import * as $ from 'jquery';

import Log from './log';
import Settings from './settings';
import Utils from './utils';

declare var manywho: any;

function onError(xhr, status, error) {
    Log.error(error);
}

function beforeSend(xhr, tenantId, authenticationToken, event, request) {
    xhr.setRequestHeader('ManyWhoTenant', tenantId);

    if (authenticationToken)
        xhr.setRequestHeader('Authorization', authenticationToken);

    if (Settings.event(event + '.beforeSend'))
        Settings.event(event + '.beforeSend').call(this, xhr, request);
}

export default {

    request(context, event, url, type, tenantId, stateId, authenticationToken, request) {
        let json = null;

        if (request != null)
            json = JSON.stringify(request);

        return $.ajax({
                url: Settings.global('platform.uri') + url,
                type: type,
                dataType: 'json',
                contentType: 'application/json',
                processData: true,
                data: json,
                beforeSend: xhr => {
                    beforeSend.call(this, xhr, tenantId, authenticationToken, event, request);

                    if (Utils.isNullOrWhitespace(stateId) === false)
                        xhr.setRequestHeader('ManyWhoState', stateId);
                }
            })
            .done(Settings.event(event + '.done'))
            .fail(onError)
            .fail(Settings.event(event + '.fail'));
    },

    upload(context, event, url, formData, tenantId, authenticationToken, onProgress) {
        return $.ajax({
            url: Settings.global('platform.uri') + url,
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            xhr: () => {
                const xhr = new XMLHttpRequest();
                xhr.upload.addEventListener('progress', onProgress, false);
                return xhr;
            },
            beforeSend: xhr => {
                beforeSend.call(this, xhr, tenantId, authenticationToken, event);
            }
        })
        .done(Settings.event(event + '.done'))
        .fail(onError)
        .fail(Settings.event(event + '.fail'));
    }

};

