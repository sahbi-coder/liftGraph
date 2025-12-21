import { useQuery } from '@tanstack/react-query';

import { useDependencies } from '@/dependencies/provider';
import { useAuthenticatedUser } from '@/contexts/AuthContext';

export function useProgram(programId: string | undefined) {
  const { services } = useDependencies();
  const { user } = useAuthenticatedUser();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: reactQueryRefetch,
  } = useQuery({
    queryKey: ['program', user.uid, programId],

    queryFn: async () => {
      if (!programId) {
        return null;
      }
      return services.firestore.getProgram(user.uid, programId);
    },
  });

  return {
    program: data ?? null,
    isLoading,
    isError,
    error,
    refetch: () => reactQueryRefetch(),
  };
}
