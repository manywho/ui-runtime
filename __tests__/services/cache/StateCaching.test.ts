import { pollForStateValues } from '../../../js/services/cache/StateCaching';
import { setStateValue } from '../../../js/models/State';

const globalAny:any = global;
const castSetStateValue: any = setStateValue;

jest.mock('../../../js/models/State', () => ({
    setStateValue: jest.fn(),
}));

const responseJsonMock = jest.fn(() => {
    return new Promise((resolve) => {
        const mockResponse = ['test', 'test'];
        resolve(mockResponse);
    });
});

globalAny.fetch = jest.fn(() => {
    return new Promise((resolve) => {
        const mockResponse = { json: responseJsonMock };
        resolve(mockResponse);
    });
});

describe('State caching service behaviour', () => {

    beforeEach(() => {
        castSetStateValue.mockClear();
    });

    test.skip('Fetch call is made only when network is available', () => {
        pollForStateValues('test', 'test', 'test');
        expect(globalAny.fetch).not.toHaveBeenCalled();
    });

    test('Polling happens recursively based on polling interval', () => {
        jest.useFakeTimers();
        pollForStateValues('test', 'test', 'test')
            .then(() => {

                jest.runOnlyPendingTimers();

                expect(setTimeout).toHaveBeenCalledTimes(1);
                expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 30000);
            });
    });

    test('Every value returned gets injected into offline state', () => {
        pollForStateValues('test', 'test', 'test')
            .then(() => {
                expect(setStateValue).toHaveBeenCalledTimes(2);
            });
    });

});
