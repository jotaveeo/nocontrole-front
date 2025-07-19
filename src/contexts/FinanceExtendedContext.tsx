import React, { createContext, useContext } from "react";
import { useFinanceExtended } from "@/hooks/useFinanceExtended";

const FinanceExtendedContext = createContext<ReturnType<
  typeof useFinanceExtended
> | null>(null);

export const useFinanceExtendedContext = () => {
  const context = useContext(FinanceExtendedContext);
  if (!context) {
    throw new Error(
      "useFinanceExtendedContext must be used within a FinanceExtendedProvider"
    );
  }
  return context;
};

export const FinanceExtendedProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const financeData = useFinanceExtended();

  return (
    <FinanceExtendedContext.Provider value={financeData}>
      {children}
    </FinanceExtendedContext.Provider>
  );
};
