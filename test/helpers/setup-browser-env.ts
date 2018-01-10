require('browser-env')();

import * as sinon from 'sinon';

window['numbro'] = {
    culture: sinon.stub(),
    cultures: () => {
        return { 'en-US': sinon.stub() };
    },
};

