import * as React from 'react';
import Banner from '../../js/components/Banner';

import { shallow } from 'enzyme';
import { BANNER_TEXT } from '../../js/constants';

jest.mock('../../icons/Offline.svg', () => {
    return <div />;
});

jest.mock('../../icons/Online.svg', () => {
    return <div />;
});

describe('Banner component behaviour', () => {

    test('Banner component renders without crashing', () => {
        const props = {
            isOffline: false,
            hasNetwork: true,
        };
        const componentWrapper = shallow(<Banner {...props} />);
        expect(componentWrapper.length).toEqual(1);
    });

    test('Banner is hidden initially', () => {
        const props = {
            isOffline: false,
            hasNetwork: true,
        };
        const componentWrapper = shallow(<Banner {...props} />);
        expect(componentWrapper.find('#offline-banner').exists()).toBeFalsy();
    });

    test('Banner shows online text', () => {
        const props = {
            isOffline: true,
            hasNetwork: true,
        };
        const componentWrapper = shallow(<Banner {...props} />);
        componentWrapper.setState({ hide: false });
        expect(componentWrapper.find('.format-pre-line').text()).toEqual(BANNER_TEXT.online);
    });

    test('Banner shows offline text', () => {
        const props = {
            isOffline: true,
            hasNetwork: false,
        };
        const componentWrapper = shallow(<Banner {...props} />);
        componentWrapper.setState({ hide: false });
        expect(componentWrapper.find('.format-pre-line').text()).toEqual(BANNER_TEXT.offline);
    });

    test('Banner is hidden initally when there are requests to be replayed', () => {
        const props = {
            isOffline: true,
            hasNetwork: true,
        };
        const componentWrapper = shallow(<Banner {...props} />);
        componentWrapper.setState({ hide: true });
        expect(componentWrapper.find('#offline-banner').exists()).toBeFalsy();
    });

    test('Banner switches when network status changes', () => {
        const props = {
            isOffline: true,
            hasNetwork: true,
        };

        const componentWrapper = shallow(<Banner {...props} />);

        componentWrapper.setProps({ hasNetwork: false });

        const state: any = componentWrapper.state();
        expect(state.hide).toBeFalsy();
    });

    test('Banner does not switch when network status remains the same', () => {
        const props = {
            isOffline: true,
            hasNetwork: true,
        };

        const componentWrapper = shallow(<Banner {...props} />);
        componentWrapper.setProps({ hasNetwork: true });

        const state: any = componentWrapper.state();
        expect(state.hide).toBeTruthy();
    });
});
