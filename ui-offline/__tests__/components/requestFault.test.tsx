import * as React from 'react';
import { shallow } from 'enzyme';
import RequestFault from '../../js/components/RequestFault';

describe('RequestFault component behaviour', () => {

    let componentWrapper;

    const props = {
        response: {
            mapElementInvokeResponses: [
                { rootFaults: [] },
            ],
        },
    };

    beforeEach(() => {
        componentWrapper = shallow(<RequestFault {...props} />);
    });

    test('RequestFault component renders without crashing', () => {
        expect(componentWrapper.length).toEqual(1);
    });

});
