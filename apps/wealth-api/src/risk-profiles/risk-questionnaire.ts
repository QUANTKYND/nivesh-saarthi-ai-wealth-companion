import type { RiskProfileQuestionnaire } from '@wealth/shared-types';

export const RISK_PROFILE_MAX_SCORE = 23;

export const riskProfileQuestionnaire: RiskProfileQuestionnaire = {
  questions: [
    {
      id: 'investment_horizon',
      label: 'How long can you stay invested for this goal?',
      description:
        'Longer investment horizons can usually support more market-linked exposure.',
      type: 'SINGLE_CHOICE',
      required: true,
      options: [
        {
          id: 'less_than_1_year',
          label: 'Less than 1 year',
          score: 0,
          explanation:
            'A short horizon requires a conservative suitability stance.',
        },
        {
          id: '1_to_3_years',
          label: '1 to 3 years',
          score: 1,
          explanation:
            'A near-term horizon limits tolerance for market fluctuation.',
        },
        {
          id: '3_to_5_years',
          label: '3 to 5 years',
          score: 2,
          explanation:
            'A medium horizon can support balanced market-linked exposure.',
        },
        {
          id: 'more_than_5_years',
          label: 'More than 5 years',
          score: 3,
          explanation:
            'A longer horizon can support higher growth-oriented suitability.',
        },
      ],
    },
    {
      id: 'income_stability',
      label: 'How stable is your monthly income?',
      description:
        'More predictable income can improve capacity to handle investment volatility.',
      type: 'SINGLE_CHOICE',
      required: true,
      options: [
        {
          id: 'unstable',
          label: 'Irregular or uncertain',
          score: 0,
          explanation: 'Uncertain income reduces capacity for investment risk.',
        },
        {
          id: 'somewhat_stable',
          label: 'Somewhat stable',
          score: 1,
          explanation: 'Some income variability supports only measured risk.',
        },
        {
          id: 'stable',
          label: 'Stable',
          score: 2,
          explanation: 'Stable income can support balanced suitability.',
        },
        {
          id: 'very_stable',
          label: 'Very stable',
          score: 3,
          explanation:
            'Very stable income improves capacity for growth-oriented suitability.',
        },
      ],
    },
    {
      id: 'loss_tolerance',
      label: 'How would you react if your investment value fell temporarily?',
      description:
        'Loss tolerance is a key suitability guardrail for market-linked products.',
      type: 'SINGLE_CHOICE',
      required: true,
      options: [
        {
          id: 'cannot_tolerate_loss',
          label: 'I would not be comfortable with any loss',
          score: 0,
          explanation:
            'No loss tolerance requires a conservative suitability stance.',
        },
        {
          id: 'small_temporary_loss',
          label: 'I can tolerate a small temporary decline',
          score: 1,
          explanation:
            'Low loss tolerance supports capital-protection-first suitability.',
        },
        {
          id: 'moderate_fluctuation',
          label: 'I can tolerate moderate fluctuation',
          score: 2,
          explanation: 'Moderate loss tolerance supports balanced suitability.',
        },
        {
          id: 'high_fluctuation_for_growth',
          label: 'I can tolerate high fluctuation for higher long-term growth',
          score: 3,
          explanation:
            'Higher loss tolerance can support growth-oriented suitability.',
        },
      ],
    },
    {
      id: 'emergency_fund_status',
      label: 'How many months of expenses do you have as emergency savings?',
      description:
        'Emergency savings reduce the chance of forced withdrawals during volatility.',
      type: 'SINGLE_CHOICE',
      required: true,
      options: [
        {
          id: 'no_emergency_fund',
          label: 'No emergency fund',
          score: 0,
          explanation:
            'No emergency fund limits suitability until liquidity improves.',
        },
        {
          id: 'less_than_3_months',
          label: 'Less than 3 months',
          score: 1,
          explanation:
            'A small emergency fund calls for caution before taking risk.',
        },
        {
          id: '3_to_6_months',
          label: '3 to 6 months',
          score: 2,
          explanation:
            'A reasonable emergency fund supports balanced suitability.',
        },
        {
          id: 'more_than_6_months',
          label: 'More than 6 months',
          score: 3,
          explanation:
            'Strong emergency savings improve ability to stay invested.',
        },
      ],
    },
    {
      id: 'investment_experience',
      label: 'What is your investment experience?',
      description:
        'Investment experience helps assess familiarity with product risks.',
      type: 'SINGLE_CHOICE',
      required: true,
      options: [
        {
          id: 'none',
          label: 'I have not invested before',
          score: 0,
          explanation: 'No prior experience supports a cautious profile.',
        },
        {
          id: 'fixed_deposits_only',
          label: 'I mainly use fixed deposits or recurring deposits',
          score: 1,
          explanation:
            'Deposit-only experience suggests limited market-risk familiarity.',
        },
        {
          id: 'mutual_funds_or_sips',
          label: 'I have used mutual funds or SIPs',
          score: 2,
          explanation:
            'Mutual fund or SIP experience supports balanced suitability.',
        },
        {
          id: 'market_linked_experience',
          label: 'I have experience with market-linked investments',
          score: 3,
          explanation:
            'Market-linked experience can support higher risk suitability.',
        },
      ],
    },
    {
      id: 'liquidity_needs',
      label: 'How soon might you need this money?',
      description:
        'Near-term liquidity needs reduce suitability for volatile investments.',
      type: 'SINGLE_CHOICE',
      required: true,
      options: [
        {
          id: 'need_money_anytime',
          label: 'I may need it anytime',
          score: 0,
          explanation:
            'Immediate liquidity needs require a conservative suitability stance.',
        },
        {
          id: 'may_need_within_1_year',
          label: 'Within 1 year',
          score: 1,
          explanation:
            'Short-term liquidity needs limit market-linked suitability.',
        },
        {
          id: 'can_lock_for_3_years',
          label: 'I can keep it invested for around 3 years',
          score: 2,
          explanation: 'Medium liquidity flexibility supports balanced risk.',
        },
        {
          id: 'can_lock_for_5_plus_years',
          label: 'I can keep it invested for 5 years or more',
          score: 3,
          explanation:
            'Longer liquidity flexibility can support growth suitability.',
        },
      ],
    },
    {
      id: 'dependence_on_invested_funds',
      label: 'How dependent are you on this money for regular expenses?',
      description:
        'Dependence on invested funds reduces ability to withstand volatility.',
      type: 'SINGLE_CHOICE',
      required: true,
      options: [
        {
          id: 'fully_dependent',
          label: 'Fully dependent',
          score: 0,
          explanation:
            'Full dependence on the funds requires capital-protection focus.',
        },
        {
          id: 'partially_dependent',
          label: 'Partially dependent',
          score: 1,
          explanation:
            'Partial dependence supports only measured investment risk.',
        },
        {
          id: 'not_dependent',
          label: 'Not dependent',
          score: 2,
          explanation:
            'Lower dependence improves ability to stay invested through volatility.',
        },
      ],
    },
    {
      id: 'investment_objective',
      label: 'What is your main investment objective?',
      description:
        'The primary objective helps align risk category with expected outcome.',
      type: 'SINGLE_CHOICE',
      required: true,
      options: [
        {
          id: 'capital_protection',
          label: 'Capital protection',
          score: 0,
          explanation:
            'Capital protection points toward conservative suitability.',
        },
        {
          id: 'income_generation',
          label: 'Regular income',
          score: 1,
          explanation: 'Income needs support measured, lower-volatility risk.',
        },
        {
          id: 'balanced_growth',
          label: 'Balanced growth',
          score: 2,
          explanation: 'Balanced growth aligns with moderate suitability.',
        },
        {
          id: 'long_term_growth',
          label: 'Long-term growth',
          score: 3,
          explanation:
            'Long-term growth objective can support aggressive suitability.',
        },
      ],
    },
  ],
};
