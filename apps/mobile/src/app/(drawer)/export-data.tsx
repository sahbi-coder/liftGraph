import React from 'react';

import { LoadingView, ErrorView } from '@/components/StatusViews';
import { ExportDataScreen } from '@/components/export/ExportDataScreen';
import { useValidatedWorkouts } from '@/hooks/workout/useValidatedWorkouts';

export default function ExportDataPage() {
  const { workouts, isLoading, isError, refetch } = useValidatedWorkouts();

  if (isLoading) {
    return <LoadingView />;
  }

  if (isError) {
    return <ErrorView onRetry={refetch} />;
  }

  return <ExportDataScreen workouts={workouts} />;
}
