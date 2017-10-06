import * as React from 'react';
import ReactDOM from 'react-dom';

import * as Component from './component';
import * as Log from 'loglevel';
import * as Settings from './settings';
import * as Utils from './utils';

const configs = {};
let domWatcher = null;

const onInterval = function (tour, step, nextStep, moveImmediately: boolean) {
    if (getTargetElement(nextStep)
        && (moveImmediately || !getTargetElement)) {

        clearInterval(domWatcher);
        move(tour, tour.steps.indexOf(nextStep));
    }
};

const onDoneInterval = function (tour, step) {
    if (!getTargetElement(step)) {
        clearInterval(domWatcher);
        done(tour);
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

export interface ITourState {
    foundTarget: boolean,
    style: React.CSSProperties
}

export interface ITourProps {
    tour: ITour,
    stepIndex: number
}

export interface ITour {
    id: string,
    steps: Array<ITourStep>,
    currentStep: number
}

export interface ITourStep {
    target: string,
    title: string,
    content: string,
    placement: string,
    showNext: boolean,
    showBack: boolean,
    offset?: number,
    align?: string,
    order?: number
}

export let current: ITour;

export const addTours = (tours: Array<ITour>) => {
    tours.forEach(tour => {
        configs[tour.id] = tour;
    });
};

/**
 * Kick off a tour and render the first step
 * @param id Id of the Tour to start
 * @param containerSelector Selector for the top level container that the `.mw-tours` container will be appended to
 * @param getElement Function that provides the target node / element that `step` should be rendered next to
 */
export const start = (id: string, containerSelector: string, flowKey: string, getElement?: (step: ITourStep) => any): ITour => {
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

        current = JSON.parse(JSON.stringify(configs[id])) as ITour;
        current.steps = (current.steps || []).map((step, index) => Object.assign({}, Settings.global('tours.defaults', flowKey, {}), { order: index }, step));

        current.currentStep = 0;

        if (getElement)
            getTargetElement = getElement;

        watchForStep(current);
        ReactDOM.render(React.createElement(Component.getByName('mw-tour'), { tour: current, stepIndex: 0 }), tourContainer);
        return current;
    }
    else
        Log.error(`A Container matching the selector ${containerSelector} could not be found when attempting to start a Tour`);
};

export const next = (tour: ITour = current) => {
    if (!tour)
        return;

    if (tour.currentStep + 1 >= tour.steps.length)
        done(tour);
    else
        tour.currentStep++;

    watchForStep(tour);
    render();
};

export const previous = (tour: ITour = current) => {
    if (!tour)
        return;

    tour.currentStep = Math.max(0, tour.currentStep - 1);

    watchForStep(tour);
    render();
};

/**
 * Move the `currentStep` of the tour to the provided `index` and re-render
 */
export const move = (tour: ITour = current, index) => {
    if (!tour)
        return;

    if (index >= tour.steps.length) {
        Log.warning(`Cannot move Tour ${tour.id} to Step ${index} as it is out of bounds`);
        return;
    }

    tour.currentStep = index;

    watchForStep(tour);
    render();
};

/**
 * Either re-render the current step, or move through the tour until a matching target node is found, or if no target nodes can be found unmount the `.mw-tours` node
 */
export const refresh = (tour: ITour = current) => {
    if (!tour)
        return;

    if (!getTargetElement(tour.steps[tour.currentStep])) {
        for (let i = tour.currentStep; i < tour.steps.length; i++) {
            if (getTargetElement(tour.steps[i])) {
                move(tour, i);
                return;
            }
        }

        ReactDOM.unmountComponentAtNode(document.querySelector('.mw-tours'));
    }
    else
        render(tour);
};

/**
 * Reset `current` to null and unmount the `.mw-tours` node
 */
export const done = (tour: ITour = current) => {
    current = null;
    ReactDOM.unmountComponentAtNode(document.querySelector('.mw-tours'));
};

export const render = (tour: ITour = current) => {
    if (!tour)
        return;

    ReactDOM.render(React.createElement(Component.getByName('mw-tour'), { tour: tour, stepIndex: tour.currentStep }), document.querySelector('.mw-tours'));
};

/**
 * Get the target element for the provided step. No default implementation is provided
 */
export let getTargetElement = (step: ITourStep): any => {
    return null;
};
