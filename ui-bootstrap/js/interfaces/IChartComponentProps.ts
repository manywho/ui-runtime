import * as React from 'react';
import IComponentProps from './IComponentProps';

interface IChartComponentProps extends IComponentProps {
    type: string;
    options: any;
    outcomes: any[];
    contentElement: JSX.Element;
    objectData: any[];
    isLoading: boolean;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onOutcome: Function;
    refresh: (event: React.SyntheticEvent<HTMLElement>) => void;
}

export default IChartComponentProps;
