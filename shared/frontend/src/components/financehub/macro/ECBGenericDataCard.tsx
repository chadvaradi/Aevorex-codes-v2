import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Skeleton } from '../../ui/Skeleton';
import { ErrorState } from '../../ui';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useUserPreferences } from '../../../hooks/ui/useUserPreferences.tsx';

interface HookResult {
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  isLoading: boolean;
  isError: boolean;
  mutate: () => void;
}

interface Props {
  title: string;
  description?: string;
  useHook: () => HookResult;
}

const getRecordCount = (records: unknown): number => {
  if (!records) return 0;
  if (Array.isArray(records)) return records.length;
  if (typeof records === 'object') return Object.keys(records).length;
  return 0;
};

const ECBGenericDataCard: React.FC<Props> = ({ title, description, useHook }) => {
  const { data, isLoading, isError, mutate } = useHook();

  // Favorite indicator handling
  const { favoriteIndicators, toggleFavoriteIndicator } = useUserPreferences();
  const isFavorite = favoriteIndicators.includes(title);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <ErrorState message={`Failed to load ${title} data.`} retryFn={mutate} />
    );
  }

  const count = getRecordCount(data);
  const empty = count === 0;

  return (
    <Card>
      <CardHeader className="flex items-start gap-2">
        <CardTitle className="flex-1">{title}</CardTitle>
        <button
          onClick={() => toggleFavoriteIndicator(title)}
          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
        >
          {isFavorite ? (
            <StarIconSolid className="w-5 h-5 text-yellow-400" />
          ) : (
            <StarIconOutline className="w-5 h-5 text-neutral-400" />
          )}
        </button>
        {description && <p className="text-sm text-content-secondary w-full">{description}</p>}
      </CardHeader>
      <CardContent>
        {empty ? (
          <div className="text-sm text-content-secondary">No data available yet ➜ coming soon.</div>
        ) : (
          <div className="text-2xl font-bold text-content-primary">{count.toLocaleString()} records</div>
        )}
      </CardContent>
    </Card>
  );
};

export default ECBGenericDataCard; 