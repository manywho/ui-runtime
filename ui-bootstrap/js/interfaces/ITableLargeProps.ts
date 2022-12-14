import IComponentProps from './IComponentProps';
import IColumn from './IColumn';
import ISelectable from './ISelectable';
import ISortable from './ISortable';

interface ITableLargeProps extends IComponentProps, ISortable, ISelectable {
    model: any;
    objectData: any;
    selectedRows: { externalId: string }[];
    totalObjectData: any;
    onHeaderClick: any;
    onRowClicked: any;
    outcomes: { id: string }[];
    // eslint-disable-next-line @typescript-eslint/ban-types
    onOutcome: Function;
    isFiles: boolean;
    displayColumns: IColumn[];
}

export default ITableLargeProps;
