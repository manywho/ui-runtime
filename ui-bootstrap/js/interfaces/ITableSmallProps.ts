import IComponentProps from './IComponentProps';
import IColumn from './IColumn';

interface ITableSmallProps extends IComponentProps {
    // eslint-disable-next-line @typescript-eslint/ban-types
    onOutcome: Function;
    isValid: boolean;
    objectData: any;
    outcomes: {
        id: string;
        pageActionType: string;
    }[];
    displayColumns: IColumn[];
    selectedRows: any[];
    // eslint-disable-next-line @typescript-eslint/ban-types
    onRowClicked: Function;
    isFiles: boolean;
}

export default ITableSmallProps;
