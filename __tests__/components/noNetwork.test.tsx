import * as React from 'react';
import { shallow } from 'enzyme';
import NoNetwork from '../../js/components/NoNetwork';

describe('NoNetwork component behaviour', () => {

    let componentWrapper;

    const props = {
        onClose: jest.fn(),
    };

    beforeEach(() => {
        componentWrapper = shallow(<NoNetwork {...props} />);
    });

    test('NoNetwork component renders without crashing', () => {
        expect(componentWrapper.length).toEqual(1);
    });

});
