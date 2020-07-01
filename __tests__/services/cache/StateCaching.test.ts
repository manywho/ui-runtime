import { pollForStateValues, periodicallyPollForStateValues } from '../../../js/services/cache/StateCaching';
import { setStateValue } from '../../../js/models/State';

const globalAny:any = global;
const castSetStateValue: any = setStateValue;

jest.mock('../../../js/models/State', () => ({
    setStateValue: jest.fn(),
}));

const responseJsonMock = jest.fn(() => new Promise((resolve) => {
    const mockResponse = ['test', 'test'];
    resolve(mockResponse);
}));

globalAny.fetch = jest.fn(() => new Promise((resolve) => {
    const mockResponse = { json: responseJsonMock };
    resolve(mockResponse);
}));

describe('State caching service behaviour', () => {

    beforeEach(() => {
        castSetStateValue.mockClear();
    });

    test.skip('Fetch call is made only when network is available', () => {
        expect.assertions(1);
        return periodicallyPollForStateValues().then(() => {
            expect(globalAny.fetch).not.toHaveBeenCalled();
        });
    });

    test.skip('Polling happens recursively based on polling interval', async () => {
        expect.assertions(2);
        jest.useFakeTimers();
        await periodicallyPollForStateValues();
        jest.runOnlyPendingTimers();
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 30000);
    });

    test('Every value returned gets injected into offline state when polling periodically', () => {
        expect.assertions(1);
        jest.useFakeTimers();
        return periodicallyPollForStateValues()
            .then(() => {
                jest.runOnlyPendingTimers();
                expect(setStateValue).toHaveBeenCalledTimes(2);
            });
    });

    test('Every value returned gets injected into offline state when polling', () => {
        expect.assertions(1);
        return pollForStateValues()
            .then(() => {
                expect(setStateValue).toHaveBeenCalledTimes(2);
            });
    });
});
