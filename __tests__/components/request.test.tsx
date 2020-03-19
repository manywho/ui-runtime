import * as React from 'react';
import { shallow } from 'enzyme';
import { guid, str } from '../../test-utils';
import Request from '../../js/components/Request';
import OfflineCore from '../../js/services/OfflineCore';
import extractExternalId from '../../js/services/extractExternalId';

jest.mock('../../js/services/extractExternalId');

OfflineCore.rejoin = jest.fn();

const globalAny: any = global;
const extractExternalIdMock: any = extractExternalId;

declare const $: any;

describe('Request component behaviour', () => {

    globalAny.window.manywho.ajax.uploadFiles = jest.fn(() => {
        return {
            then: jest.fn(() => {
                return { fail: jest.fn() };
            }),
        };
    });

    let componentWrapper;

    let props: any = {
        flowKey: '',
        cachedRequest: {
            request: {
                invokeType: 'invoke',
            },
            assocData: null,
        },
        tenantId: guid(),
        authenticationToken: str(10),
        onReplayDone: jest.fn(),
        onDelete: jest.fn(),
        replayNow: true,
        isDisabled: true,
        cancelReplay: jest.fn(),
    };

    beforeEach(() => {
        componentWrapper = shallow(<Request {...props} />);
    });

    test('Request component renders without crashing', () => {
        expect(componentWrapper.length).toEqual(1);
    });

    test('File is uploaded on replay', () => {
        const stateId = guid();
        const request = {
            stateId,
            type: 'fileData',
            files: [],
        };

        props.cachedRequest.request = request;

        componentWrapper.find('.btn-primary').simulate('click');
        const progressFuction = componentWrapper.instance().onProgress;

        expect(globalAny.window.manywho.ajax.uploadFiles).toHaveBeenCalledWith(
            [],
            request,
            props.tenantId,
            props.authenticationToken,
            progressFuction,
            stateId,
        );
    });

    test('Replay is cancelled and flow is rejoined if replay request is unauthorised', () => {
        const wrapperInstance = componentWrapper.instance();
        wrapperInstance.onReplayResponse({ invokeType: 'NOT_ALLOWED' });
        expect(props.cancelReplay).toHaveBeenCalled();
        expect(OfflineCore.rejoin).toHaveBeenCalled();
    });

    test('The external id extraction method is called on replay', () => {
        props.cachedRequest.request = {
            type: 'invoke',
            stateId: guid(),
        };

        globalAny.manywho.ajax.invoke.mockImplementation(() => {
            return { then: (success) => {
                success();
                return { fail: jest.fn() };
            }};
        });
        globalAny.manywho.utils.extractStateId.mockImplementation(() => {
            return 'testStateId';
        });
        extractExternalIdMock.mockResolvedValue(Promise.resolve());
        componentWrapper.find('.btn-primary').simulate('click');
        expect(extractExternalId).toHaveBeenCalledWith(props.cachedRequest, props.tenantId, props.authenticationToken, 'testStateId');
    });

});
