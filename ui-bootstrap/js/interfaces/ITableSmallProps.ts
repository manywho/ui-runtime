import IComponentProps from './IComponentProps';
import IColumn from './IColumn';

interface ITableSmallProps extends IComponentProps {
    onOutcome: Function;
    isValid: boolean;
    objectData: any;
    outcomes: { 
        id: string;
        pageActionType: string; 
    }[];
    displayColumns: IColumn[];
    selectedRows: any[];
    onRowClicked: Function;
    isFiles: boolean;
}

export default ITableSmallProps;
