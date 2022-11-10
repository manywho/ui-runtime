import IComponentProps from './IComponentProps';

interface IModalContainerProps extends IComponentProps {
    title: string;
    content: any;
    onConfirm: any;
    onCancel: any;
    cancelLabel?: string;
    confirmLabel?: string;
    onClose?: any;
}

export default IModalContainerProps;
