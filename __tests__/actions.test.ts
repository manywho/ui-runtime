import { cachingProgress } from '../js/actions';
import store from '../js/stores/store';
import { setStateValue } from '../js/models/State';

declare const manywho;
const globalAny:any = global;
const castSetStateValue: any = setStateValue;

jest.mock('../js/models/State', () => ({
    setStateValue: jest.fn(),
}));

const responseJsonMock = jest.fn(() => {
    return new Promise((resolve) => {
        const mockResponse = ['test', 'test', 'test'];
        resolve(mockResponse);
    });
});

globalAny.fetch = jest.fn(() => {
    return new Promise((resolve) => {
        const mockResponse = { json: responseJsonMock };
        resolve(mockResponse);
    });
});

describe('Actions behaviour ', () => {

    beforeEach(() => {
        castSetStateValue.mockClear();
    });

    test('The cache progress to bu updated to 100%', (done) => {
        store.subscribe(() => {
            expect(globalAny.fetch).toHaveBeenCalled();
            expect(setStateValue).toHaveBeenCalledTimes(3);
            expect(manywho.model.addNotification).toBeCalledWith('123', {
                message: 'Caching is complete. You are ready to go offline',
                position: 'bottom',
                type: 'success',
                dismissible: true,
            });
            expect(store.getState().cachingProgress).toEqual(0);
            done();
        });

        store.dispatch(cachingProgress({ progress: 100, flowKey: '123' }));
    });
});
