import React, { ReactElement } from 'react';

/*
 * In order to avoid React errors we need to export the two 'mocked'
 * Svg icons
 */

const OfflineSvg = (): ReactElement => <div />;
export const OnlineSvg = (): ReactElement => <div />;

export default OfflineSvg;
