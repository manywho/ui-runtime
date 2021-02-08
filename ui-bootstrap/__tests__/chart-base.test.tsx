import { str } from '../test-utils';


import * as React from 'react';
import { mount } from 'enzyme';

import ChartBase from '../js/components/chart-base';

jest.mock('chart.js', () => {
    return {
        Chart() {
            this.destroy = jest.fn();
        },
    };
});


describe('ChartBase component behaviour', () => {

    let componentWrapper;

    const globalAny: any = global;
    globalAny.window.manywho.settings.global = jest.fn();

    function manyWhoMount(
        // props
        {
            id = str(5),
            flowKey = str(5),
            isVisible = true,
            columns = [],
            onClick = null,
            type = str(5), 
            width = 0,
            height = 0,
            objectData = [], 
            options = {}, 
            isLoading = false,
            labels = [],
        } = {},
    ) {

        globalAny.window.manywho.styling.getClasses = () => [str(5)];

        const props = {
            id, flowKey, isVisible, columns, onClick, type, width, height,
            objectData, options, isLoading, labels,
        };

        return mount(<ChartBase {...props} />);
    }

    afterEach(() => {
        componentWrapper.unmount();
    });

    test('Component renders without crashing', () => {
        componentWrapper = manyWhoMount();
        expect(componentWrapper.length).toEqual(1);
    });

    test('Component gets registered', () => {
        componentWrapper = manyWhoMount();
        expect(globalAny.window.manywho.component.register)
            .toHaveBeenCalledWith('mw-chart-base', ChartBase);
    });

    test('Component runs updateChart on load', () => {
        globalAny.window.manywho.settings.global.mockClear();
        componentWrapper = manyWhoMount({ isVisible: true });

        expect(globalAny.window.manywho.settings.global)
            .toHaveBeenCalledTimes(4);
    });

    test('Component doesn\'t run updateChart when turning invisible', () => {
        componentWrapper = manyWhoMount({ isVisible: true });

        globalAny.window.manywho.settings.global.mockClear();
        componentWrapper.setProps({ isVisible: false });

        expect(globalAny.window.manywho.settings.global)
            .toHaveBeenCalledTimes(0);
    });

    test('Component runs updateChart when turning visible', () => {
        componentWrapper = manyWhoMount({ isVisible: false });

        globalAny.window.manywho.settings.global.mockClear();
        componentWrapper.setProps({ isVisible: true });
        
        expect(globalAny.window.manywho.settings.global)
            .toHaveBeenCalledTimes(4);
    });

});
