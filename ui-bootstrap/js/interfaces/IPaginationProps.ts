interface IPaginationProps {
    // eslint-disable-next-line @typescript-eslint/ban-types
    onFirstPage: Function;
    pageIndex: number;
    onPrev(): void;
    onNext(): void;
    hasMoreResults: boolean;
}

export default IPaginationProps;
