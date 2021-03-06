import test from 'ava'; // tslint:disable-line:import-name
import * as mockery from 'mockery';
import * as sinon from 'sinon';

const ReactDOM = {
    render: sinon.stub(),
    unmountComponentAtNode: sinon.stub(),
};

const react = {
    createElement: sinon.stub(),
};

const log = {
    error: sinon.stub(),
    warn: sinon.stub(),
};

const reactErrorBoundary = {
    withErrorBoundary: sinon.stub().returnsArg(0),
};

mockery.enable({
    useCleanCache: true,
    warnOnUnregistered: false,
});

mockery.registerMock('react', react);
mockery.registerMock('react-dom', ReactDOM);
mockery.registerMock('react-error-boundary', reactErrorBoundary);
mockery.registerMock('loglevel', log);

import * as Tours from '../js/services/tours';
import * as Component from '../js/services/component';

const id = 'test-tour';
const flowKey = 'key1_key2_key3_key4';

test.before((t) => {
    Tours.addTours([
        {
            id,
            currentStep: 0,
            steps: [
                {
                    target: '.tour-target-1',
                    title: 'step 1 title',
                    content: 'step 1 content',
                    placement: 'left',
                    showBack: true,
                    showNext: true,
                },
                {
                    target: '.tour-target-2',
                    title: 'step 2 title',
                    content: 'step 2 content',
                    placement: 'left',
                    showBack: true,
                    showNext: true,
                },
                {
                    target: '.tour-target-3',
                    title: 'step 3 title',
                    content: 'step 3 content',
                    placement: 'left',
                    showBack: true,
                    showNext: true,
                },
            ],
        },
        {
            id: 'tour2',
            currentStep: 0,
            steps: [],
        },
        {
            id: 'tour3',
            currentStep: 0,
            steps: [
                {
                    target: '.tour-target-1',
                    title: 'step 1 title',
                    content: 'step 1 content',
                    placement: 'left',
                    showBack: false,
                    showNext: false,
                },
                {
                    target: '.tour-target-2',
                    title: 'step 2 title',
                    content: 'step 2 content',
                    placement: 'left',
                    showBack: false,
                    showNext: false,
                },
            ],
        },
    ]);

    const container = document.createElement('div');
    container.classList.add('container');
    
    document.body.appendChild(container);
});

test.beforeEach((t) => {
    react.createElement.resetHistory();
    ReactDOM.render.resetHistory();
    log.error.resetHistory();
    log.warn.resetHistory();
});

test.after((t) => {
    mockery.deregisterAll();
    mockery.disable();
});

test.afterEach((t) => {
    ReactDOM.unmountComponentAtNode.resetHistory();
});

test.serial('Get Target Element', (t) => {
    t.is(Tours.getTargetElement(null), null);
});

test.serial.cb('Start 1', (t) => {
    const tour = Tours.start(null, '.container', flowKey);
    t.is(tour.currentStep, 0);
    
    setTimeout(
        () => {
            t.is(ReactDOM.render.callCount, 1);
            t.is(react.createElement.callCount, 1);
            t.end();
        },
        600,
    );
});

test.serial('Start 2', (t) => {
    Tours.start(null, '.container1', flowKey);
    t.true(log.error.calledWith('A Container matching the selector .container1 could not be found when attempting to start a Tour'));
});

test.serial('Start 3', (t) => {
    Tours.start('tour5', '.container', flowKey);
    t.true(log.error.calledWith('A Tour with the id tour5 could not be found'));
});

test.serial('Start 4', (t) => {
    Tours.start('tour2', '.container', flowKey);
    t.true(log.error.calledWith('The Tour tour2 contains zero Steps'));
});

test.serial.cb('Next 1', (t) => {
    const tour = Tours.start(null, '.container', flowKey);

    setTimeout(
        () => {
            Tours.next(tour);

            setTimeout(
                () => {
                    t.is(ReactDOM.render.callCount, 2, 'Render');
                    t.is(react.createElement.callCount, 2, 'Create Element');
                    t.is(tour.currentStep, 1, 'Current Step');
                    t.end();
                },
                600,
            );
        },
        600,
    );
});

test.serial('Next 2', (t) => {
    Tours.next(null);
    t.false(ReactDOM.render.called);
});

test.serial('Next 3', (t) => {
    const tour = Tours.start(null, '.container', flowKey);
    Tours.next(tour);
    Tours.next(tour);
    Tours.next(tour);

    t.is(Tours.current, null);
    t.true(ReactDOM.unmountComponentAtNode.calledOnce);
});

test.serial.cb('Previous 1', (t) => {
    Tours.start(null, '.container', flowKey);

    setTimeout(
        () => {
            Tours.next();

            setTimeout(
                () => {
                    Tours.previous();

                    setTimeout(
                        () => {
                            t.is(ReactDOM.render.callCount, 3, 'Render');
                            t.is(react.createElement.callCount, 3, 'Create Element');
                            t.is(Tours.current.currentStep, 0, 'Current Step');
                            t.end();
                        },
                        600,
                    );
                },
                600,
            );
        },
        600,
    );
});

test.serial('Previous 2', (t) => {
    Tours.previous(null);
    t.false(ReactDOM.render.called);
});

test.serial('Render', (t) => {
    Tours.render(null);
    t.false(ReactDOM.render.called);
});

test.serial('Move 1', (t) => {
    Tours.move(null, 0);
    t.false(ReactDOM.render.called);
});

test.serial('Move 2', (t) => {
    const tour = Tours.start(null, '.container', flowKey);
    Tours.move(tour, 10);

    t.true(log.warn.calledWith(`Cannot move Tour ${tour.id} to Step 10 as it is out of bounds`));
});

test.serial('Move 3', (t) => {
    const tour = Tours.start(null, '.container', flowKey);
    Tours.move(tour, 1);

    t.is(ReactDOM.render.callCount, 2, 'Render');
    t.is(react.createElement.callCount, 2, 'Create Element');
    t.is(tour.currentStep, 1, 'Current Step');
});

test.serial('Refresh 1', (t) => {
    Tours.refresh(null);
    t.false(ReactDOM.render.called);
});

test.serial('Refresh 2', (t) => {
    Tours.start(null, '.container', flowKey, sinon.stub().returns({}));
    Tours.refresh();
    t.true(ReactDOM.render.called);
});

test.serial('Refresh 3', (t) => {
    const stub = sinon.stub().onFirstCall().returns(null);
    stub.onSecondCall().returns(null);
    stub.onThirdCall().returns({});

    Tours.start(null, '.container', flowKey, stub);
    Tours.refresh();
    t.is(Tours.current.currentStep, 1);
});

test.serial('Refresh 4', (t) => {
    Tours.start(null, '.container', flowKey);
    Tours.refresh();
    t.true(ReactDOM.unmountComponentAtNode.called);
});


test.serial.cb('Watch', (t) => {
    const stub = sinon.stub().onFirstCall().returns({});
    stub.onSecondCall().returns({});

    Tours.start('tour3', '.container', flowKey, stub);

    setInterval(
        () => {
            if (ReactDOM.unmountComponentAtNode.called)
                t.end();
        },
        100,
    );
});
