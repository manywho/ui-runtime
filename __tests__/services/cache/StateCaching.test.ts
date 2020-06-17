import { pollForStateValues } from '../../../js/services/cache/StateCaching';
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

    test.skip('Fetch call is made only when network is available', async () => {
        await pollForStateValues('test', 'test', 'test');
        expect(globalAny.fetch).not.toHaveBeenCalled();
    });

    test.skip('Polling happens recursively based on polling interval', async () => {
        // TODO - FLOW-1618 has changed these tests and js/services/cache/StateCaching.ts. Fix in merge conflict.
        jest.useFakeTimers();
        await pollForStateValues('test', 'test', 'test');

        jest.runOnlyPendingTimers();

        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 30000);
    });

    test('Every value returned gets injected into offline state', async () => {
        await pollForStateValues('test', 'test', 'test');
        expect(setStateValue).toHaveBeenCalledTimes(2);
    });

});
