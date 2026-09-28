import React from 'react';
import { OrganonView, OrganonViewProps } from './OrganonView';

export interface OrganonV3ViewProps extends OrganonViewProps {
  onSwitchToV1?: () => void;
  onSwitchToV2?: () => void;
}

export const OrganonV3View: React.FC<OrganonV3ViewProps> = (props) => {
  return <OrganonView {...props} />;
};

export default OrganonV3View;
