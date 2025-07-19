import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlanType, PLANS, PlanFeatures } from '@/types/plans';

interface PlanContextType {
  currentPlan: PlanType;
  setCurrentPlan: (plan: PlanType) => void;
  features: PlanFeatures;
  canAccess: (feature: keyof PlanFeatures) => boolean;
  hasReachedLimit: (feature: 'categories' | 'goals', currentCount: number) => boolean;
  isDevMode: boolean;
  setDevMode: (enabled: boolean) => void;
}

const PlanContext = createContext<PlanContextType | null>(null);

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPlan, setCurrentPlanState] = useState<PlanType>('free');
  const [isDevMode, setDevMode] = useState(false);

  // Load plan from localStorage
  useEffect(() => {
    const savedPlan = localStorage.getItem('financicontrol_plan') as PlanType;
    const savedDevMode = localStorage.getItem('financicontrol_dev_mode') === 'true';
    
    if (savedPlan && PLANS[savedPlan]) {
      setCurrentPlanState(savedPlan);
    }
    setDevMode(savedDevMode);
  }, []);

  const setCurrentPlan = (plan: PlanType) => {
    setCurrentPlanState(plan);
    localStorage.setItem('financicontrol_plan', plan);
  };

  const setDevModeWithStorage = (enabled: boolean) => {
    setDevMode(enabled);
    localStorage.setItem('financicontrol_dev_mode', enabled.toString());
  };

  const features = PLANS[currentPlan].features;

  const canAccess = (feature: keyof PlanFeatures): boolean => {
    if (isDevMode) return true; // Dev mode bypasses all restrictions
    return features[feature] === true;
  };

  const hasReachedLimit = (feature: 'categories' | 'goals', currentCount: number): boolean => {
    if (isDevMode) return false; // Dev mode bypasses all limits
    const limit = feature === 'categories' ? features.maxCategories : features.maxGoals;
    return limit !== -1 && currentCount >= limit;
  };

  return (
    <PlanContext.Provider value={{
      currentPlan,
      setCurrentPlan,
      features,
      canAccess,
      hasReachedLimit,
      isDevMode,
      setDevMode: setDevModeWithStorage,
    }}>
      {children}
    </PlanContext.Provider>
  );
};


