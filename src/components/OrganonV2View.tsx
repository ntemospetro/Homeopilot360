import React from 'react';
import { OrganonView, OrganonViewProps } from './OrganonView';

export interface OrganonV2ViewProps extends OrganonViewProps {
  onSwitchToV1?: () => void;
  onSwitchToV3?: () => void;
}

export const OrganonV2View: React.FC<OrganonV2ViewProps> = (props) => {
  return <OrganonView {...props} />;
};

export default OrganonV2View;
