import * as React from 'react';
import { shallow } from 'enzyme';
import PdfDownloader from '../js/components/pdf-downloader';
import { noop } from '../test-utils';

describe('Pdf downloader component behaviour', () => {

    let componentWrapper;
    let props;

    const globalAny: any = global;

    function manyWhoMount(isDesignTime = false) {
        props = {
            id: 'id',
            flowKey: 'flowKey',
            isDesignTime,
            objectData: [
                {
                    developerName: '$File',
                    isSelected: false,
                    order: 0,
                    properties: [
                        {
                            contentFormat: '',
                            contentType: 'ContentString',
                            contentValue: '1',
                            developerName: 'Id',
                            objectData: null,
                        },
                        {
                            contentFormat: '',
                            contentType: 'ContentString',
                            contentValue: 'Pdf',
                            developerName: 'Name',
                            objectData: null,
                        },
                    ],
                },
            ],
            label: 'buttonText',
        };

        if (isDesignTime) {
            props = {
                isDesignTime,
            };
        }

        globalAny.window.manywho['model'] = {
            getComponent: jest.fn(() => props),
        };

        globalAny.window.manywho['utils'] = {
            extractTenantId: jest.fn(() => {
                return 'tenantId';
            }),
            extractStateId: jest.fn(() => {
                return 'stateId';
            }),
        };

        globalAny.window.manywho.state.getAuthenticationToken = jest.fn(() => {
            return 'authToken';
        });

        globalAny.window.manywho['ajax'] = {
            downloadPdf: jest.fn(),
        };

        return shallow(<PdfDownloader {...props} />);
    }

    afterEach(() => {
        componentWrapper.unmount();
    });

    test('Component renders without crashing', () => {
        componentWrapper = manyWhoMount();
        expect(componentWrapper.length).toEqual(1);
    });

    test('Component gets registered', () => {
        componentWrapper = manyWhoMount();
        expect(globalAny.window.manywho.component.register).toHaveBeenCalled();
    });

    test('Component gets rendered correctly in design time', () => {
        componentWrapper = manyWhoMount(true);
        
        const button = componentWrapper.find('.btn-link');

        expect(button).toBeTruthy();
        expect(button.text()).toEqual('Download Pdf');
    });

    test('Component should have button rendered with the correct text', () => {
        componentWrapper = manyWhoMount();
        
        const button = componentWrapper.find('.btn-link');

        expect(button).toBeTruthy();
        expect(button.text()).toEqual('buttonText');
    });

    test('On click sends correct data', () => {
        componentWrapper = manyWhoMount();

        componentWrapper.simulate('click', {
            preventDefault: noop,
            stopPropagation: noop,
        });

        expect(globalAny.window.manywho.utils.extractTenantId).toHaveBeenCalledWith('flowKey');
        expect(globalAny.window.manywho.utils.extractStateId).toHaveBeenCalledWith('flowKey');
        expect(globalAny.window.manywho.state.getAuthenticationToken).toHaveBeenCalledWith('flowKey');

        expect(globalAny.window.manywho.ajax.downloadPdf).toBeCalledWith('stateId', '1', 'Pdf', 'tenantId', 'authToken');
    });
});
