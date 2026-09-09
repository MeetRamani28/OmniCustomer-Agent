// Autonomous Micro-Compensation & Policy Guards

export interface RefundPolicyResult {
  approved: boolean;
  reason: string;
  compensationAmount?: number;
}

export const evaluateRefundPolicy = (userQuery: string): RefundPolicyResult => {
  console.log('[Guard: Policy] Evaluating autonomous compensation eligibility...');
  
  // Simple deterministic heuristic for demonstration of zero-trust policy walls
  const isSmallAmount = userQuery.includes('$10') || userQuery.includes('$5') || userQuery.includes('small');
  const isAngry = userQuery.toLowerCase().includes('angry') || userQuery.toLowerCase().includes('unacceptable');
  
  if (isSmallAmount) {
    return {
      approved: true,
      reason: 'Micro-compensation auto-approved per Policy #42-B.',
      compensationAmount: 10.00
    };
  }

  if (isAngry) {
    return {
      approved: false,
      reason: 'Escalation required. High churn risk detected. Manual review flagged.'
    };
  }

  return {
    approved: false,
    reason: 'Refund exceeds autonomous threshold or requires receipt validation.'
  };
};
