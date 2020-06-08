import { pollForStateValues, periodicallyPollForStateValues } from '../../../js/services/cache/StateCaching';
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
        periodicallyPollForStateValues();
        expect(globalAny.fetch).not.toHaveBeenCalled();
    });

    test('Polling happens recursively based on polling interval', () => {
        jest.useFakeTimers();
        periodicallyPollForStateValues()
            .then(() => {
                jest.runOnlyPendingTimers();

                expect(setTimeout).toHaveBeenCalledTimes(1);
                expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 30000);
            });
    });

    test('Every value returned gets injected into offline state when polling periodically', () => {
        jest.useFakeTimers();
        periodicallyPollForStateValues()
            .then(() => {
                jest.runOnlyPendingTimers();
                expect(setStateValue).toHaveBeenCalledTimes(2);
            });
    });

    test('Every value returned gets injected into offline state when polling' , () => {
        pollForStateValues()
            .then(() => {
                expect(setStateValue).toHaveBeenCalledTimes(2);
            });
    });
});
