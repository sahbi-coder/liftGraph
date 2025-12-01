import React from 'react';

import { LoadingView, ErrorView } from '@/components/StatusViews';
import { ExportDataScreen } from '@/components/export/ExportDataScreen';
import { useUserWorkouts } from '@/hooks/useUserWorkouts';

export default function ExportDataPage() {
  const { workouts, isLoading, isError, refetch } = useUserWorkouts();

  if (isLoading) {
    return <LoadingView />;
  }

  if (isError) {
    return <ErrorView onRetry={refetch} />;
  }

  const validatedWorkouts = (workouts ?? []).filter((workout) => workout.validated);

  return <ExportDataScreen workouts={validatedWorkouts} />;
}
