//CareerContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface CareerContextType {
  hasStartedCareer: boolean;
  currentCareer: string | null;
  startCareer: (careerId: string) => void;
  resetCareer: () => void;
}

const CareerContext = createContext<CareerContextType | undefined>(undefined);

export const useCareer = () => {
  const context = useContext(CareerContext);
  if (context === undefined) {
    throw new Error('useCareer must be used within a CareerProvider');
  }
  return context;
};

export const CareerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasStartedCareer, setHasStartedCareer] = useState(() => {
    return localStorage.getItem('skillx-hasStartedCareer') === 'true';
  });
  const [currentCareer, setCurrentCareer] = useState<string | null>(() => {
    return localStorage.getItem('skillx-currentCareer') || null;
  });

  const startCareer = (careerId: string) => {
    setHasStartedCareer(true);
    setCurrentCareer(careerId);
    localStorage.setItem('skillx-hasStartedCareer', 'true');
    localStorage.setItem('skillx-currentCareer', careerId);
  };

  const resetCareer = () => {
    setHasStartedCareer(false);
    setCurrentCareer(null);
    localStorage.removeItem('skillx-hasStartedCareer');
    localStorage.removeItem('skillx-currentCareer');
  };

  return (
    <CareerContext.Provider value={{
      hasStartedCareer,
      currentCareer,
      startCareer,
      resetCareer
    }}>
      {children}
    </CareerContext.Provider>
  );
};