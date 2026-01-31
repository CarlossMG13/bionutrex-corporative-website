import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface HomeDataContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const HomeDataContext = createContext<HomeDataContextType | undefined>(undefined);

interface HomeDataProviderProps {
  children: ReactNode;
}

export function HomeDataProvider({ children }: HomeDataProviderProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <HomeDataContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </HomeDataContext.Provider>
  );
}

export function useHomeDataRefresh() {
  const context = useContext(HomeDataContext);
  if (context === undefined) {
    throw new Error('useHomeDataRefresh must be used within a HomeDataProvider');
  }
  return context;
}