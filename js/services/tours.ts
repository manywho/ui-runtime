/// <reference path="../../typings/index.d.ts" />
/// <reference path="../interfaces/ITour.ts" />

import Component from './component';
import Log from './log';
import Settings from './settings';

declare var manywho: any;

let configs = {};
let domWatcher = null;

const onInterval = function (tour, step, nextStep, moveImmediately: boolean) {
    if (exports.getTargetElement(nextStep)
        && (moveImmediately || !exports.getTargetElement)) {

        clearInterval(domWatcher);
        exports.move(tour, tour.steps.indexOf(nextStep));
    }
};

const onDoneInterval = function (tour, step) {
    if (!exports.getTargetElement(step)) {
        clearInterval(domWatcher);
        exports.done(tour);
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

            if (manywho.utils.isNullOrWhitespace(id))
                id = Object.keys(configs)[0];

            if (!configs[id]) {
                Log.error(`A Tour with the id ${id} could not be found`);
                return;
            }

            if (!configs[id].steps || configs[id].steps.length === 0) {
                Log.error(`The Tour ${id} contains zero Steps`);
                return;
            }

            this.current = JSON.parse(JSON.stringify(configs[id])) as ITour;
            this.current.steps = (this.current.steps || []).map((step, index) => Object.assign({}, Settings.global('tours.defaults', flowKey, {}), { order: index }, step));

            this.current.currentStep = 0;

            watchForStep(this.current);
            ReactDOM.render(React.createElement(Component.getByName('mw-tour'), { tour: this.current, stepIndex: 0 }), tourContainer);
            return this.current;
        }
        else
            Log.error(`A Container matching the selector ${containerSelector} could not be found when attempting to start a Tour`);
    },

    next(tour = this.current) {
        if (!tour)
            return;

        if (tour.currentStep + 1 >= tour.steps.length)
            exports.done(tour);
        else
            tour.currentStep++;

        watchForStep(tour);
        this.render();
    },

    previous(tour = this.current) {
        if (!tour)
            return;

        tour.currentStep = Math.max(0, tour.currentStep - 1);

        watchForStep(tour);
        this.render();
    },

    move(tour = this.current, index) {
        if (!tour)
            return;

        if (index >= tour.steps.length) {
            Log.warning(`Cannot move Tour ${tour.id} to Step ${index} as it is out of bounds`);
            return;
        }

        tour.currentStep = index;

        watchForStep(tour);
        this.render();
    },

    refresh(tour = this.current) {
        if (!tour)
            return;

        if (!this.getTargetElement(tour.steps[tour.currentStep])) {
            for (let i = tour.currentStep; i < tour.steps.length; i++) {
                if (this.getTargetElement(tour.steps[i])) {
                    this.move(tour, i);
                    return;
                }
            }

            ReactDOM.unmountComponentAtNode(document.querySelector('.mw-tours'));
        }
        else
            this.render(tour);
    },

    done(tour = this.current) {
        this.current = null;
        ReactDOM.unmountComponentAtNode(document.querySelector('.mw-tours'));
    },

    render(tour = this.current) {
        if (!tour)
            return;

        ReactDOM.render(React.createElement(Component.getByName('mw-tour'), { tour: tour, stepIndex: tour.currentStep }), document.querySelector('.mw-tours'));
    },

    getTargetElement(step: ITourStep) {
        return null;
    }
};
