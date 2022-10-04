import * as React from 'react';

interface TableInputDateTimeProps {
    onChange: (event: React.SyntheticEvent<HTMLElement>) => void;
    format: string;
    value: string;
}

export default TableInputDateTimeProps;
