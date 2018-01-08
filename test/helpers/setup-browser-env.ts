require('browser-env')();
import * as sinon from 'sinon';

window['numbro'] = { cultures: sinon.stub() };
