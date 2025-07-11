import React from 'react';
import ECBGenericDataCard from './ECBGenericDataCard';
import { useECBSec } from '../../../hooks/macro/useECBSec';

const ECBSECCard: React.FC = () => (
  <ECBGenericDataCard
    title="Securities Statistics (SEC)"
    description="Outstanding debt & equity securities"
    useHook={useECBSec}
  />
);

export default ECBSECCard; 