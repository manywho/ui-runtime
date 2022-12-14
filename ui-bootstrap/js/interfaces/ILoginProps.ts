import IComponentProps from './IComponentProps';

interface ILoginProps extends IComponentProps {
    callback: {
        // eslint-disable-next-line @typescript-eslint/ban-types
        execute: Function;
        context: any;
        args: any;
    };
    loginUrl: string;
    stateId: string;
    username: string;
    directoryName: string;
}

export default ILoginProps;
