import React from 'react';
import ECBGenericDataCard from './ECBGenericDataCard';
import { useECBIVF } from '../../../hooks/macro/useECBIVF';

const ECBIVFCard: React.FC = () => (
  <ECBGenericDataCard
    title="Investment Fund Statistics (IVF)"
    description="Assets of euro area investment funds"
    useHook={useECBIVF}
  />
);

export default ECBIVFCard; 