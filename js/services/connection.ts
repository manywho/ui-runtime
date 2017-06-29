/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.connection = class Connection {

    static onError(xhr, status, error) {
        manywho.log.error(error);
    }

    static beforeSend(xhr, tenantId, authenticationToken, event, request) {
        xhr.setRequestHeader('ManyWhoTenant', tenantId);

        if (authenticationToken)
            xhr.setRequestHeader('Authorization', authenticationToken);

        if (manywho.settings.event(event + '.beforeSend'))
            manywho.settings.event(event + '.beforeSend').call(this, xhr, request);
    }

    static request(context, event, url, type, tenantId, stateId, authenticationToken, request) {
        let json = null;

        if (request != null)
            json = JSON.stringify(request);

        return $.ajax({
                url: manywho.settings.global('platform.uri') + url,
                type: type,
                dataType: 'json',
                contentType: 'application/json',
                processData: true,
                data: json,
                beforeSend: xhr => {
                    manywho.connection.beforeSend.call(this, xhr, tenantId, authenticationToken, event, request);

                    if (manywho.utils.isNullOrWhitespace(stateId) === false)
                        xhr.setRequestHeader('ManyWhoState', stateId);
                }
            })
            .done(manywho.settings.event(event + '.done'))
            .fail(manywho.connection.onError)
            .fail(manywho.settings.event(event + '.fail'));
    }

    static upload(context, event, url, formData, tenantId, authenticationToken, onProgress) {
        return $.ajax({
            url: manywho.settings.global('platform.uri') + url,
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
                manywho.connection.beforeSend.call(this, xhr, tenantId, authenticationToken, event);
            }
        })
        .done(manywho.settings.event(event + '.done'))
        .fail(manywho.connection.onError)
        .fail(manywho.settings.event(event + '.fail'));
    }

};
