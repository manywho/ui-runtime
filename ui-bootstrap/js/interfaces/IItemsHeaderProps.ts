import IComponentProps from './IComponentProps';

interface IItemsHeaderProps extends IComponentProps {
    isSearchable: boolean;
    isRefreshable: any;
    outcomes: any[];
    refresh: any;
    isDisabled?: boolean;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onSearch?: Function;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onSearchChanged?: Function;
    search?: any;
}

export default IItemsHeaderProps;
