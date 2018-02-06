import * as $ from 'jquery';
import * as Log from 'loglevel';
import * as Settings from './settings';
import * as Utils from './utils';

/**
 * @private
 * */
function onError(xhr, status, error) {
    Log.error(error);
}

/**
 * @private
 * */
function beforeSend(xhr: XMLHttpRequest, tenantId: string, authenticationToken: string, event: string, request) {
    xhr.setRequestHeader('ManyWhoTenant', tenantId);

    if (authenticationToken)
        xhr.setRequestHeader('Authorization', authenticationToken);

    if (Settings.event(event + '.beforeSend'))
        Settings.event(event + '.beforeSend').call(this, xhr, request);
}

/**
 * Make an AJAX request to the Boomi Flow platform
 * @param context TODO
 * @param event Type of event, `Settings.event(event + '.done')` will be called when the request completes
 * @param url The path to make the request against, excluding the host which is fetched from `Settings.global('platform.uri')`
 * @param type AJAX request type e.g. GET, POST, etc
 * @param tenantId The GUID of the tenant to make the request against
 * @param stateId The GUID of the state we are making the request from
 * @param authenticationToken Current running users authentication token
 * @param data Body of the request data
 * @returns JQuery deferred from the $.ajax request
 */
export const request = (context,
                        event: string, 
                        url: string, 
                        type: string, 
                        tenantId: string, 
                        stateId: string,
                        authenticationToken: string, 
                        data: object) => {
    let json = null;

    if (data != null)
        json = JSON.stringify(data);

    return $.ajax({
        type,
        url: Settings.global('platform.uri') + url,
        dataType: 'json',
        contentType: 'application/json',
        processData: true,
        data: json,
        beforeSend: (xhr) => {
            beforeSend.call(this, xhr, tenantId, authenticationToken, event, data);

            if (!Utils.isNullOrWhitespace(stateId))
                xhr.setRequestHeader('ManyWhoState', stateId);
        },
    })
    .done(Settings.event(event + '.done'))
    .fail(onError)
    .fail(Settings.event(event + '.fail'));
};

/**
 * Upload a file to the Boomi Flow platform
 * @param context TODO
 * @param event Type of event, `Settings.event(event + '.done')` will be called when the request completes
 * @param url The path to make the request against, excluding the host which is fetched from `Settings.global('platform.uri')`
 * @param formData FormData for the file being uploaded
 * @param tenantId The GUID of the tenant to make the request against
 * @param authenticationToken Current running users authentication token
 * @param onProgress Callback to recieve progress event info
 * @returns JQuery deferred from the $.ajax request
 */
export const upload = (context, 
                       event: string, 
                       url: string, 
                       formData: FormData, 
                       tenantId: string, 
                       authenticationToken: string,
                       onProgress: EventListenerOrEventListenerObject) => {
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
        beforeSend: (xhr) => {
            beforeSend.call(this, xhr, tenantId, authenticationToken, event);
        },
    })
    .done(Settings.event(event + '.done'))
    .fail(onError)
    .fail(Settings.event(event + '.fail'));
};
