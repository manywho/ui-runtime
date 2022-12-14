import IComponentProps from './IComponentProps';

interface IFeedInputProps extends IComponentProps {
    // eslint-disable-next-line @typescript-eslint/ban-types
    send: Function;
    isAttachmentsEnabled: boolean;
    caption: string;
    messageId?: string;
}

export default IFeedInputProps;
