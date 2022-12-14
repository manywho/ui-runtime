import IComponentProps from './IComponentProps';

interface ITableInputProps extends IComponentProps {
    contentType: string;
    contentFormat: string;
    propertyId: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    onCommitted: Function;
    value: any;
}

export default ITableInputProps;
