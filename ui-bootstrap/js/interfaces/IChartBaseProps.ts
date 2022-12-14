interface IChartBaseProps {
    isVisible: boolean;
    columns: any[];
    objectData: any[][];
    // eslint-disable-next-line @typescript-eslint/ban-types
    onClick: Function;
    flowKey: string;
    type: string;
    options: any;
    width: number;
    height: number;
    labels?: string[];
    isLoading?: boolean;
}

export default IChartBaseProps;
