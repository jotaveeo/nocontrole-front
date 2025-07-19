
import React, { useState } from 'react';
import { usePlan } from '@/contexts/PlanContext';
import { PremiumTooltip } from '@/components/PremiumTooltip';
import { UpgradeModal } from '@/components/UpgradeModal';
import { PlanType } from '@/types/plans';

interface PlanFeatureGateProps {
  children: React.ReactNode;
  feature?: keyof typeof import("@/types/plans").PLANS.free.features;
  requiredPlan: PlanType;
  featureName: string;
  description?: string;
  fallback?: React.ReactNode;
  showTooltip?: boolean;
}

export const PlanFeatureGate: React.FC<PlanFeatureGateProps> = ({
  children,
  feature,
  requiredPlan,
  featureName,
  description,
  fallback,
  showTooltip = true,
}) => {
  const { canAccess, currentPlan } = usePlan();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check if user has access to the feature
  const hasAccess = feature ? canAccess(feature) : 
    (currentPlan === requiredPlan || 
     (requiredPlan === 'essencial' && currentPlan === 'plus') ||
     (requiredPlan === 'free' && (currentPlan === 'essencial' || currentPlan === 'plus')));

  if (hasAccess) {
    return <>{children}</>;
  }

  const handleClick = () => {
    setShowUpgradeModal(true);
  };

  const restrictedContent = (
    <div 
      className="relative cursor-pointer opacity-60 hover:opacity-80 transition-opacity"
      onClick={handleClick}
    >
      {fallback || children}
    </div>
  );

  return (
    <>
      {showTooltip ? (
        <PremiumTooltip
          feature={featureName}
          requiredPlan={requiredPlan}
          description={description}
        >
          {restrictedContent}
        </PremiumTooltip>
      ) : (
        restrictedContent
      )}
      
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredPlan={requiredPlan}
        feature={featureName}
      />
    </>
  );
};
