require('browser-env')();
import * as sinon from 'sinon';

window['numbro'] = {
    cultures: (() => {
        return { 'en-US': sinon.stub() };
    }),
};
window['ReactDOM'] = { unmountComponentAtNode: sinon.stub() };
