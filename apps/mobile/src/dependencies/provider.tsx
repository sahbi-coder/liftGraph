import React, { PropsWithChildren, createContext, useContext } from 'react';

import { Dependencies } from '@/dependencies';

const DependenciesContext = createContext<Dependencies | null>(null);

type Props = {
  dependencies: Dependencies;
};

export function DependenciesProvider({ children, dependencies }: PropsWithChildren<Props>) {
  return (
    <DependenciesContext.Provider value={dependencies}>{children}</DependenciesContext.Provider>
  );
}

export function useDependencies() {
  const context = useContext(DependenciesContext);

  if (!context) {
    throw new Error('useDependencies must be used within a DependenciesProvider');
  }

  return context;
}
