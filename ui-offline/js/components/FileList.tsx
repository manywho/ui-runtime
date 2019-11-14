import * as React from 'react';
import { humanFileSize } from '../services/Utils';

const FileList = ({ files = [] }) => (
    <ul className="file-list">
        {
            files.map(file => (
                <li key={file.size}>
                    <span>{ file.name }</span><span className="file-size">{ humanFileSize(file.size) }</span>
                </li>
            ))
        }
    </ul>
);

export default FileList;
