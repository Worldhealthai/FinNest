// FinNest ISA Knowledge Base & Constants

export const ISA_TYPES = {
  CASH: 'cash',
  STOCKS_SHARES: 'stocks_shares',
  LIFETIME: 'lifetime',
  INNOVATIVE_FINANCE: 'innovative_finance',
} as const;

export const ISA_ANNUAL_ALLOWANCE = 20000;
export const LIFETIME_ISA_MAX = 4000;
export const LIFETIME_ISA_BONUS_RATE = 0.25; // 25% government bonus
export const JUNIOR_ISA_ALLOWANCE = 9000;
export const FSCS_PROTECTION_LIMIT = 85000;

export const TAX_YEAR = {
  START_MONTH: 4, // April
  START_DAY: 6,
  END_MONTH: 4, // April
  END_DAY: 5,
};

export interface ISAType {
  id: string;
  name: string;
  shortName: string;
  description: string;
  maxContribution: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  potentialReturn: string;
  icon: string;
  benefits: string[];
  risks: string[];
  bestFor: string[];
  color: string;
}

export const ISA_INFO: Record<string, ISAType> = {
  [ISA_TYPES.CASH]: {
    id: ISA_TYPES.CASH,
    name: 'Cash ISA',
    shortName: 'Cash',
    description: 'A tax-free savings account offering guaranteed interest rates. Your money is safe and protected by FSCS up to £85,000.',
    maxContribution: ISA_ANNUAL_ALLOWANCE,
    riskLevel: 'Low',
    potentialReturn: '4-5% AER',
    icon: 'cash',
    benefits: [
      'Tax-free interest on your savings',
      'FSCS protection up to £85,000',
      'Easy access to your money (varies by account)',
      'No risk to your capital',
      'Ideal for emergency funds',
    ],
    risks: [
      'Returns may not keep pace with inflation',
      'Lower returns compared to other ISA types',
      'Interest rates can change',
    ],
    bestFor: [
      'Short-term savings goals',
      'Emergency fund building',
      'Risk-averse savers',
      'Those needing quick access to funds',
    ],
    color: '#00C9FF',
  },
  [ISA_TYPES.STOCKS_SHARES]: {
    id: ISA_TYPES.STOCKS_SHARES,
    name: 'Stocks & Shares ISA',
    shortName: 'Stocks & Shares',
    description: 'Invest in stocks, bonds, and funds with no tax on capital gains or dividends. Higher potential returns but your capital is at risk.',
    maxContribution: ISA_ANNUAL_ALLOWANCE,
    riskLevel: 'Medium',
    potentialReturn: '6-10% annually (historic average)',
    icon: 'trending-up',
    benefits: [
      'Tax-free capital gains',
      'No tax on dividends',
      'Higher potential returns than Cash ISAs',
      'Wide range of investment options',
      'Compound growth over time',
    ],
    risks: [
      'Your capital is at risk',
      'Value can go down as well as up',
      'Market volatility',
      'Not FSCS protected (FCA regulated)',
    ],
    bestFor: [
      'Long-term wealth building (5+ years)',
      'Higher risk tolerance',
      'Retirement savings',
      'Beating inflation',
    ],
    color: '#FFD700',
  },
  [ISA_TYPES.LIFETIME]: {
    id: ISA_TYPES.LIFETIME,
    name: 'Lifetime ISA (LISA)',
    shortName: 'Lifetime',
    description: 'Save up to £4,000 per year and get a 25% government bonus (max £1,000/year). Use for first home or retirement after 60.',
    maxContribution: LIFETIME_ISA_MAX,
    riskLevel: 'Low',
    potentialReturn: '4-5% + 25% government bonus',
    icon: 'home',
    benefits: [
      '25% government bonus on contributions',
      'Up to £1,000 free money per year',
      'Tax-free growth',
      'Can be cash or stocks & shares',
      'Ideal for first-time buyers',
    ],
    risks: [
      '25% penalty for early withdrawal (except first home/60+)',
      'Must be 18-39 to open',
      'First home must cost £450,000 or less',
      'Loses government bonus if withdrawn early',
    ],
    bestFor: [
      'First-time homebuyers',
      'Aged 18-39',
      'Long-term savers',
      'Those wanting government bonus',
    ],
    color: '#5B9BD5',
  },
  [ISA_TYPES.INNOVATIVE_FINANCE]: {
    id: ISA_TYPES.INNOVATIVE_FINANCE,
    name: 'Innovative Finance ISA (IFISA)',
    shortName: 'Innovative Finance',
    description: 'Earn tax-free returns through peer-to-peer lending and crowdfunding. Higher returns but higher risk - not FSCS protected.',
    maxContribution: ISA_ANNUAL_ALLOWANCE,
    riskLevel: 'High',
    potentialReturn: '5-10% annually',
    icon: 'flash',
    benefits: [
      'Tax-free interest',
      'Potentially higher returns than Cash ISAs',
      'Support UK businesses',
      'Diversification option',
    ],
    risks: [
      'No FSCS protection',
      'Borrowers may default',
      'Money may be locked for fixed terms',
      'Platform risk',
      'Not easily accessible',
    ],
    bestFor: [
      'Experienced investors',
      'Those with high risk tolerance',
      'Diversifying ISA portfolio',
      'Understanding P2P lending',
    ],
    color: '#FF6B9D',
  },
};

export const ISA_RULES = {
  NEW_2024: 'From April 2024, you can open multiple ISAs of the same type in one tax year',
  USE_IT_OR_LOSE_IT: 'Unused allowance does not carry over to next tax year',
  TAX_YEAR_DEADLINE: 'Tax year ends 5 April - use allowance before midnight!',
  ONE_LIFETIME: 'You can only pay into one Lifetime ISA per tax year',
  AGE_RESTRICTIONS: {
    LISA_MIN: 18,
    LISA_MAX_OPEN: 39,
    LISA_MAX_CONTRIBUTE: 50,
    LISA_WITHDRAW: 60,
  },
};

export const TAX_BENEFITS = [
  'No income tax on interest earned',
  'No capital gains tax on investment profits',
  'No dividend tax on stock dividends',
  'Lifetime allowance adds up tax-free',
  'Protect your Personal Savings Allowance',
];

export const EDUCATIONAL_CONTENT = {
  BEGINNER: [
    {
      title: 'What is an ISA?',
      content: 'ISA stands for Individual Savings Account. It\'s a tax-efficient way to save or invest money. Any interest, dividends, or capital gains you make are completely tax-free.',
      category: 'Basics',
    },
    {
      title: 'The £20,000 Annual Allowance',
      content: 'Each tax year (6 April - 5 April), you can put up to £20,000 into ISAs. This is "use it or lose it" - unused allowance doesn\'t roll over.',
      category: 'Basics',
    },
    {
      title: 'Tax Year Explained',
      content: 'The UK tax year runs from 6 April to 5 April. You must use your ISA allowance before midnight on 5 April, or it\'s lost forever.',
      category: 'Basics',
    },
  ],
  INTERMEDIATE: [
    {
      title: 'Splitting Your Allowance',
      content: 'You can split your £20,000 across different ISA types. For example: £10,000 in Cash ISA, £6,000 in Stocks & Shares, £4,000 in Lifetime ISA.',
      category: 'Strategy',
    },
    {
      title: 'Multiple ISAs (New 2024 Rule)',
      content: 'From April 2024, you can open multiple ISAs of the same type. You could have 2 Cash ISAs or 3 Stocks & Shares ISAs, as long as total contributions don\'t exceed £20,000.',
      category: 'Strategy',
    },
    {
      title: 'FSCS Protection',
      content: 'Cash ISAs are protected up to £85,000 per institution by the Financial Services Compensation Scheme. Stocks & Shares ISAs are FCA regulated but not FSCS protected.',
      category: 'Protection',
    },
  ],
  ADVANCED: [
    {
      title: 'Lifetime ISA Strategy',
      content: 'Open a LISA early (18-39) to maximize the government bonus. £4,000 contribution = £1,000 free money. Over 20 years, that\'s £20,000 in bonuses!',
      category: 'Advanced',
    },
    {
      title: 'ISA Transfers',
      content: 'You can transfer ISAs between providers without losing tax benefits. Current year ISA transfers must include all contributions, but previous years can be partial.',
      category: 'Advanced',
    },
    {
      title: 'Maximize Tax Efficiency',
      content: 'Use your Personal Savings Allowance (£1,000 basic rate) for regular savings first, then maximize ISAs for higher amounts and long-term growth.',
      category: 'Advanced',
    },
  ],
};

export function getTaxYearDates(year: number = new Date().getFullYear()) {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;

  // If we're between April 6 and December 31, tax year is current year to next year
  // If we're between January 1 and April 5, tax year is previous year to current year
  const taxYearStart = currentMonth >= 4 && today.getDate() >= 6
    ? new Date(year, 3, 6) // April 6 of current year
    : new Date(year - 1, 3, 6); // April 6 of previous year

  const taxYearEnd = new Date(taxYearStart.getFullYear() + 1, 3, 5, 23, 59, 59); // April 5 next year

  return { start: taxYearStart, end: taxYearEnd };
}

export function getDaysUntilTaxYearEnd(): number {
  const { end } = getTaxYearDates();
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getRemainingAllowance(contributions: number): number {
  return Math.max(0, ISA_ANNUAL_ALLOWANCE - contributions);
}

export function getLifetimeISABonus(contribution: number): number {
  return Math.min(contribution * LIFETIME_ISA_BONUS_RATE, LIFETIME_ISA_MAX * LIFETIME_ISA_BONUS_RATE);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Flexible ISA Calculator Types
export interface FlexibleISAState {
  annualAllowance: number; // A
  contributionsThisYear: number; // C
  withdrawalsThisYear: number; // W
}

export interface FlexibleISAResult {
  allowed: boolean;
  errorMessage?: string;
  updatedContributions?: number; // Updated C
  unusedAllowance?: number; // Updated U
  replacementAllowance?: number; // Updated R
  totalRemainingCapacity?: number; // Updated T
  amountAllocatedToReplacement?: number;
  amountAllocatedToUnused?: number;
}

/**
 * Flexible ISA Calculator
 *
 * Calculates whether a deposit is allowed and how it affects allowances.
 *
 * Rules:
 * 1. UnusedAllowance (U) = A - C
 * 2. ReplacementAllowance (R) = W
 * 3. TotalPossible (T) = U + R
 * 4. User may deposit up to TotalPossible
 * 5. Deposits reduce ReplacementAllowance first, then UnusedAllowance
 * 6. Prevent deposits that exceed TotalPossible
 *
 * @param state - Current ISA state (A, C, W)
 * @param depositAmount - Amount user wants to deposit
 * @returns Result showing if deposit is allowed and updated values
 */
export function calculateFlexibleISA(
  state: FlexibleISAState,
  depositAmount: number
): FlexibleISAResult {
  const { annualAllowance, contributionsThisYear, withdrawalsThisYear } = state;

  // Calculate current allowances
  const unusedAllowance = annualAllowance - contributionsThisYear; // U = A - C
  const replacementAllowance = withdrawalsThisYear; // R = W
  const totalPossible = unusedAllowance + replacementAllowance; // T = U + R

  // Check if deposit exceeds total possible
  if (depositAmount > totalPossible) {
    return {
      allowed: false,
      errorMessage: `Deposit of ${formatCurrency(depositAmount)} exceeds available capacity of ${formatCurrency(totalPossible)}. You have ${formatCurrency(unusedAllowance)} unused allowance and ${formatCurrency(replacementAllowance)} replacement allowance.`,
    };
  }

  // Check for invalid deposit amount
  if (depositAmount <= 0) {
    return {
      allowed: false,
      errorMessage: 'Deposit amount must be greater than £0.',
    };
  }

  // Allocate deposit: Replacement allowance first, then unused allowance
  let remainingDeposit = depositAmount;
  let amountAllocatedToReplacement = 0;
  let amountAllocatedToUnused = 0;

  // Use replacement allowance first
  if (replacementAllowance > 0) {
    amountAllocatedToReplacement = Math.min(remainingDeposit, replacementAllowance);
    remainingDeposit -= amountAllocatedToReplacement;
  }

  // Use unused allowance for any remainder
  if (remainingDeposit > 0) {
    amountAllocatedToUnused = Math.min(remainingDeposit, unusedAllowance);
  }

  // Calculate updated values
  const updatedContributions = contributionsThisYear + depositAmount;
  const updatedReplacementAllowance = replacementAllowance - amountAllocatedToReplacement;
  const updatedUnusedAllowance = unusedAllowance - amountAllocatedToUnused;
  const updatedTotalCapacity = updatedUnusedAllowance + updatedReplacementAllowance;

  return {
    allowed: true,
    updatedContributions,
    unusedAllowance: updatedUnusedAllowance,
    replacementAllowance: updatedReplacementAllowance,
    totalRemainingCapacity: updatedTotalCapacity,
    amountAllocatedToReplacement,
    amountAllocatedToUnused,
  };
}
