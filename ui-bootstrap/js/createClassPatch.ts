// eslint-disable-next-line @typescript-eslint/no-var-requires
const createReactClass = require('create-react-class');

declare const React: any;

// eslint-disable-next-line react/no-deprecated
React.createClass = (args: any) => {
    console.error(
        'React.createClass is no longer supported. ' +
            'This method is deprecated and has been removed from React. ' +
            'The method has been patched but this may cause unexpected results. ' +
            'In a future update this patch will be removed from Boomi Flow. ' +
            'Please use the create-react-class script instead.',
    );
    return createReactClass(args);
};
