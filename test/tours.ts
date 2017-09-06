import test from 'ava';
import * as mockery from 'mockery'
import * as sinon from 'sinon';

const reactDOM = {
    default: {
        render: sinon.stub(),
        unmountComponentAtNode: sinon.stub()
    }
};

const react = {
    createElement: sinon.stub()
};

const log = {
    error: sinon.stub(),
    warning: sinon.stub()
};

mockery.enable({ 
    useCleanCache: true,
    warnOnUnregistered: false 
});

mockery.registerMock('react', react);
mockery.registerMock('react-dom', reactDOM);
mockery.registerMock('loglevel', log);

import Tours from '../js/services/tours';
import Component from '../js/services/component';

const id = 'test-tour';
const flowKey = 'key1_key2_key3_key4';

test.before(t => {
    Tours.addTours([
        {
            id: id,
            steps: [
                {
                    target: '.tour-target-1',
                    title: 'step 1 title',
                    content: 'step 1 content',
                    placement: 'left',
                    showBack: true,
                    showNext: true
                },
                {
                    target: '.tour-target-2',
                    title: 'step 2 title',
                    content: 'step 2 content',
                    placement: 'left',
                    showBack: true,
                    showNext: true
                },
                {
                    target: '.tour-target-3',
                    title: 'step 3 title',
                    content: 'step 3 content',
                    placement: 'left',
                    showBack: true,
                    showNext: true
                }
            ]
        },
        {
            id: 'tour2',
            steps: null
        }
    ]);

    Tours.getTargetElement = sinon.stub().returns(null);

    const container = document.createElement('div');
    container.classList.add('container');

    document.body.appendChild(container);
});

test.beforeEach(t => {
    react.createElement.resetHistory();
    reactDOM.default.render.resetHistory();
    log.error.resetHistory();
    log.warning.resetHistory();
});

test.after(t => {
    mockery.deregisterAll();
    mockery.disable();
});

test.cb('Start 1', (t) => {
    const tour = Tours.start(null, '.container', flowKey);
    t.is(tour.currentStep, 0);

    setTimeout(() => {
        t.is(reactDOM.default.render.callCount, 1);
        t.is(react.createElement.callCount, 1);
        t.end();
    }, 600);
});

test('Start 2', (t) => {
    Tours.start(null, '.container1', flowKey);
    t.true(log.error.calledWith('A Container matching the selector .container1 could not be found when attempting to start a Tour'));
});

test('Start 3', (t) => {
    Tours.start('tour5', '.container', flowKey);
    t.true(log.error.calledWith('A Tour with the id tour5 could not be found'));
});

test('Start 4', (t) => {
    Tours.start('tour2', '.container', flowKey);
    t.true(log.error.calledWith('The Tour tour2 contains zero Steps'));
});

test.cb('Next 1', (t) => {
    const tour = Tours.start(null, '.container', flowKey);
    
    setTimeout(() => {
        Tours.next(tour);

        setTimeout(() => {
            t.is(reactDOM.default.render.callCount, 3, 'Render');
            t.is(react.createElement.callCount, 3, 'Create Element');
            t.is(tour.currentStep, 1, 'Current Step');
            t.end();
        }, 600);
    }, 600);
});

test('Next 2', (t) => {
    Tours.next(null);    
    t.false(reactDOM.default.render.called);
});

test('Next 3', (t) => {
    const tour = Tours.start(null, '.container', flowKey);
    Tours.next(tour);
    Tours.next(tour);
    Tours.next(tour);
    
    t.is(Tours.current, null);
    t.true(reactDOM.default.unmountComponentAtNode.calledOnce);
});

test.cb('Previous 1', (t) => {
    Tours.start(null, '.container', flowKey);
    
    setTimeout(() => {
        Tours.next();

        setTimeout(() => {
            Tours.previous();

            setTimeout(() => {
                t.is(reactDOM.default.render.callCount, 4, 'Render');
                t.is(react.createElement.callCount, 4, 'Creat Element');
                t.is(Tours.current.currentStep, 0, 'Current Step');
                t.end();
            }, 600);
        }, 600);

    }, 600);
});

test('Previous 2', (t) => {
    Tours.previous(null);    
    t.false(reactDOM.default.render.called);
});

test('Render', (t) => {
    Tours.render(null);
    t.false(reactDOM.default.render.called);
});

test('Move 1', (t) => {
    Tours.move(null, 0);
    t.false(reactDOM.default.render.called);
});

test('Move 2', (t) => {
    const tour = Tours.start(null, '.container', flowKey);
    Tours.move(tour, 10);

    t.true(log.warning.calledWith(`Cannot move Tour ${tour.id} to Step 10 as it is out of bounds`));
});

test('Move 3', (t) => {
    const tour = Tours.start(null, '.container', flowKey);
    Tours.move(tour, 1);

    t.is(reactDOM.default.render.callCount, 2, 'Render');
    t.is(react.createElement.callCount, 2, 'Create Element');
    t.is(tour.currentStep, 1, 'Current Step');
});

test('Refresh 1', (t) => {
    Tours.refresh(null);
    t.false(reactDOM.default.render.called);
});

test('Refresh 2', (t) => {
    Tours.getTargetElement = sinon.stub().returns({});

    Tours.start(null, '.container', flowKey);
    Tours.refresh();
    t.true(reactDOM.default.render.called);

    Tours.getTargetElement = sinon.stub().returns(null);
});

test('Refresh 3', (t) => {
    const stub = sinon.stub().onFirstCall().returns(null);
    stub.onSecondCall().returns(null);
    stub.onThirdCall().returns({});

    Tours.getTargetElement = stub;

    Tours.start(null, '.container', flowKey);
    Tours.refresh();
    t.is(Tours.current.currentStep, 1);

    Tours.getTargetElement = sinon.stub().returns(null);
});

test('Refresh 4', (t) => {
    Tours.start(null, '.container', flowKey);
    Tours.refresh();
    t.true(reactDOM.default.unmountComponentAtNode.called);

    Tours.getTargetElement = sinon.stub().returns(null);
});