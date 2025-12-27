import { useQuery } from '@tanstack/react-query';

import { useDependencies } from '@/dependencies/provider';
import { useAuthenticatedUser } from '@/contexts/AuthContext';

export function useProgram(programId: string) {
  const { services } = useDependencies();
  const { user } = useAuthenticatedUser();

  const {
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    refetch: reactQueryRefetch,
  } = useQuery({
    queryKey: ['program', user.uid, programId],

    queryFn: async () => services.firestore.getProgram(user.uid, programId),
  });

  return {
    program: data ?? null,
    isLoading,
    isSuccess,
    isError,
    error,

    refetch: () => reactQueryRefetch(),
  };
}
