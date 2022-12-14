import IComponentProps from './IComponentProps';

interface IItemsComponentProps extends IComponentProps {
    id: string;
    parentId: string;
    flowKey: string;
    isDesignTime: boolean;
    contentElement: JSX.Element;
    hasMoreResults: boolean;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onOutcome: Function;
    // eslint-disable-next-line @typescript-eslint/ban-types
    select: Function;
    // eslint-disable-next-line @typescript-eslint/ban-types
    selectAll: Function;
    // eslint-disable-next-line @typescript-eslint/ban-types
    clearSelection: Function;
    objectData: any[];
    // eslint-disable-next-line @typescript-eslint/ban-types
    onSearch: Function;
    outcomes: any[];
    refresh: any;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onNext: Function;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onPrev: Function;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onFirstPage: Function;
    page: number;
    limit: number;
    isLoading: boolean;
    // eslint-disable-next-line @typescript-eslint/ban-types
    sort: Function;
    sortedBy: boolean;
    sortedIsAscending: string;
}

export default IItemsComponentProps;
