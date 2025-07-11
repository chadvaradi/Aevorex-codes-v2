import { useState } from 'react';
import { useForexPair } from '../../../hooks/macro/useForexPair';

export const useFXDetailModal = () => {
  const [open, setOpen] = useState(false);
  const [pair, setPair] = useState<string | null>(null);

  const { data, error, isLoading } = useForexPair(pair);

  const openModal = (p: string) => {
    setPair(p);
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  return {
    open,
    pair,
    data,
    error,
    isLoading,
    openModal,
    closeModal,
  };
}; 