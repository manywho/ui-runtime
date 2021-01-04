import * as React from 'react';
import { mount } from 'enzyme';
import { GoOnline } from '../../js/components/GoOnline';
import Request from '../../js/components/Request';
import { IGoOnlineProps } from '../../js/interfaces/IGoOnline';

jest.mock('../../js/services/Storage', () => ({
    getOfflineData: jest.fn(() => Promise.resolve({})),
    removeOfflineData: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../js/models/Flow', () => ({
    FlowInit: jest.fn(() => ({
        requests: [{ request: { key: 'test' }, assocData: null }],
        state: {
            id: 'test',
            token: 'test',
        },
        tenantId: 'test',
    })),
}));

const globalAny: any = global;

describe('GoOnline component behaviour', () => {

    globalAny.window.manywho.settings.global = jest.fn();

    let componentWrapper;

    const props: IGoOnlineProps = {
        flowKey: '',
        onOnline: jest.fn(),
        onClose: jest.fn(),
        isReplaying: jest.fn(),
    };

    beforeEach(() => {
        componentWrapper = mount(<GoOnline {...props} />);
    });

    afterEach(() => {
        componentWrapper.unmount();
    });

    test('GoOnline component renders without crashing', () => {
        expect(componentWrapper.length).toEqual(1);
    });

    test('The request component always gets an auth token from state passed as a prop', () => {
        const mockAuthenticationToken = 'test auth';
        globalAny.manywho.state.getAuthenticationToken.mockImplementation(() => mockAuthenticationToken);
        componentWrapper.setState({});
        const requestComponent = componentWrapper.find(Request);
        expect(requestComponent.props().authenticationToken).toEqual(mockAuthenticationToken);
    });

    test('When auto replay setting is switched on', () => {
        globalAny.manywho.settings.global.mockImplementation(() => true);
        componentWrapper = mount(<GoOnline {...props} />);
        expect(componentWrapper.state().isReplayAll).toBeTruthy();
    });

    test('When auto replay setting is switched off', () => {
        globalAny.manywho.settings.global.mockImplementation(() => false);
        componentWrapper = mount(<GoOnline {...props} />);
        expect(componentWrapper.state().isReplayAll).toBeFalsy();
    });

});
