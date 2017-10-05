
/// <reference path="../interfaces/ITour.ts" />

import * as React from 'react';
import ReactDOM from 'react-dom';

import * as Component from './component';
import * as Log from 'loglevel';
import * as Settings from './settings';
import * as Utils from './utils';

declare var manywho: any;

let configs = {};
let domWatcher = null;

const onInterval = function (tour, step, nextStep, moveImmediately: boolean) {
    if (exports.default.getTargetElement(nextStep)
        && (moveImmediately || !exports.default.getTargetElement)) {

        clearInterval(domWatcher);
        exports.default.move(tour, tour.steps.indexOf(nextStep));
    }
};

const onDoneInterval = function (tour, step) {
    if (!exports.default.getTargetElement(step)) {
        clearInterval(domWatcher);
        exports.default.done(tour);
    }
};

const watchForStep = function (tour: ITour) {
    clearInterval(domWatcher);

    const step = tour.steps[tour.currentStep];

    if (step.showNext === false && tour.currentStep < tour.steps.length - 1)
        domWatcher = setInterval(() => onInterval(tour, step, tour.steps[tour.currentStep + 1], !step.showNext && !step.showBack), 500);

    if (tour.currentStep === tour.steps.length - 1)
        domWatcher = setInterval(() => onDoneInterval(tour, tour.steps[tour.currentStep]), 500);
};

export default {
    current: null,

    addTours(tours) {
        tours.forEach(tour => {
            configs[tour.id] = tour;
        });
    },

    start(id: string, containerSelector: string, flowKey: string) {
        const container = document.querySelector(containerSelector);

        if (container) {
            let tourContainer = container.querySelector('.mw-tours');
            if (!tourContainer) {
                tourContainer = document.createElement('div');
                tourContainer.className = 'mw-tours mw-bs';
                container.appendChild(tourContainer);
            }

            if (Utils.isNullOrWhitespace(id))
                id = Object.keys(configs)[0];

            if (!configs[id]) {
                Log.error(`A Tour with the id ${id} could not be found`);
                return;
            }

            if (!configs[id].steps || configs[id].steps.length === 0) {
                Log.error(`The Tour ${id} contains zero Steps`);
                return;
            }

            exports.default.current = JSON.parse(JSON.stringify(configs[id])) as ITour;
            exports.default.current.steps = (exports.default.current.steps || []).map((step, index) => Object.assign({}, Settings.global('tours.defaults', flowKey, {}), { order: index }, step));

            exports.default.current.currentStep = 0;

            watchForStep(exports.default.current);
            ReactDOM.render(React.createElement(Component.getByName('mw-tour'), { tour: exports.default.current, stepIndex: 0 }), tourContainer);
            return exports.default.current;
        }
        else
            Log.error(`A Container matching the selector ${containerSelector} could not be found when attempting to start a Tour`);
    },

    next(tour = exports.default.current) {
        if (!tour)
            return;

        if (tour.currentStep + 1 >= tour.steps.length)
            exports.default.done(tour);
        else
            tour.currentStep++;

        watchForStep(tour);
        exports.default.render();
    },

    previous(tour = exports.default.current) {
        if (!tour)
            return;

        tour.currentStep = Math.max(0, tour.currentStep - 1);

        watchForStep(tour);
        exports.default.render();
    },

    move(tour = exports.default.current, index) {
        if (!tour)
            return;

        if (index >= tour.steps.length) {
            Log.warning(`Cannot move Tour ${tour.id} to Step ${index} as it is out of bounds`);
            return;
        }

        tour.currentStep = index;

        watchForStep(tour);
        exports.default.render();
    },

    refresh(tour = exports.default.current) {
        if (!tour)
            return;

        if (!exports.default.getTargetElement(tour.steps[tour.currentStep])) {
            for (let i = tour.currentStep; i < tour.steps.length; i++) {
                if (exports.default.getTargetElement(tour.steps[i])) {
                    exports.default.move(tour, i);
                    return;
                }
            }

            ReactDOM.unmountComponentAtNode(document.querySelector('.mw-tours'));
        }
        else
            exports.default.render(tour);
    },

    done(tour = exports.default.current) {
        exports.default.current = null;
        ReactDOM.unmountComponentAtNode(document.querySelector('.mw-tours'));
    },

    render(tour = exports.default.current) {
        if (!tour)
            return;

        ReactDOM.render(React.createElement(Component.getByName('mw-tour'), { tour: tour, stepIndex: tour.currentStep }), document.querySelector('.mw-tours'));
    },

    getTargetElement(step: ITourStep) {
        return null;
    }
};
