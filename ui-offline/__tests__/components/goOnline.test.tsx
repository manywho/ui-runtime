import * as React from 'react';
import { mount } from 'enzyme';
import { GoOnline } from '../../js/components/GoOnline';
import Request from '../../js/components/Request';

jest.mock('../../js/services/Storage', () => ({
    getOfflineData: jest.fn(() => Promise.resolve({})),
    removeOfflineData: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../js/models/Flow', () => ({
    FlowInit: jest.fn(() => {
        return {
            requests: [{ request: { key: 'test' }, assocData: null }],
            state: {
                id: 'test',
                token: 'test',
            },
            tenantId: 'test',
        };
    }),
}));

const globalAny: any = global;

describe('GoOnline component behaviour', () => {

    globalAny.window.manywho.settings.global = jest.fn();

    let componentWrapper;

    const props = {
        flowKey: '',
        onOnline: jest.fn(),
        onClose: jest.fn(),
        toggleIsReplaying: jest.fn(),
    };

    beforeEach(() => {
        componentWrapper = mount(<GoOnline {...props} />);
    });

    test('GoOnline component renders without crashing', () => {
        expect(componentWrapper.length).toEqual(1);
    });

    test('The request component always gets an auth token from state passed as a prop', () => {
        const mockAuthenticationToken = 'test auth';
        globalAny.manywho.state.getAuthenticationToken.mockImplementation(() => {
            return mockAuthenticationToken;
        });
        componentWrapper.setState({});
        const requestComponent = componentWrapper.find(Request);
        expect(requestComponent.props().authenticationToken).toEqual(mockAuthenticationToken);
    });

    test('When auto replay setting is switched on', () => {
        globalAny.manywho.settings.global.mockImplementation(() => {
            return true;
        });
        const componentWrapper = mount(<GoOnline {...props} />);
        expect(componentWrapper.state().isReplayAll).toBeTruthy();
    });

    test('When auto replay setting is switched off', () => {
        globalAny.manywho.settings.global.mockImplementation(() => {
            return false;
        });
        const componentWrapper = mount(<GoOnline {...props} />);
        expect(componentWrapper.state().isReplayAll).toBeFalsy();
    });

});
