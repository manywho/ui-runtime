import * as React from 'react';

const Progress = ({ progress = 0 }) => (
    <div className={`progress  ${progress === 0 ? 'empty' : ''} ${progress === 100 ? 'full' : ''}`}>
        <div className="progress-indicator" style={{ width: `${progress === 100 ? 0 : progress}%` }} />
    </div>
);

export default Progress;
