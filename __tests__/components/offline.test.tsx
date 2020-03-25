import * as React from 'react';
import { shallow } from 'enzyme';
import { Offline } from '../../js/components/Offline';

describe('Offline component behaviour', () => {

    let componentWrapper;

    const props = {
        flowKey: 'test',
        isOffline: false,
        hasNetwork: true,
        cachingProgress: 0,
        toggleIsOffline: jest.fn(),
        toggleIsOnline: jest.fn(),
        toggleIsReplaying: jest.fn(),
    };

    beforeEach(() => {
        componentWrapper = shallow(<Offline {...props} />);
    });

    test('Offline component renders without crashing', () => {
        expect(componentWrapper.length).toEqual(1);
    });
});
