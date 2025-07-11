import React from 'react';
import ECBGenericDataCard from './ECBGenericDataCard';
import { useECBCbd } from '../../../hooks/macro/useECBCbd';

const ECBCBDCard: React.FC = () => (
  <ECBGenericDataCard
    title="Consolidated Banking Data (CBD)"
    description="Balance sheet items of EU banks"
    useHook={useECBCbd}
  />
);

export default ECBCBDCard; 