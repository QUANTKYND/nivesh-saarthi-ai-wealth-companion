import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  BankApprovedProductType,
  GenerateRecommendationRequest,
  Goal,
  ProductCatalogItem,
  RecommendedAllocationItem,
  RecommendationNextBestAction,
  RecommendationResult,
  RecommendationSuitability,
  RiskProfile,
  RiskProfileCategory,
  SpendingInsights,
} from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { SpendingInsightsService } from '../spending-insights/spending-insights.service';

interface AllocationRule {
  productType: BankApprovedProductType;
  percentage: number;
  rationale: string;
}

interface RecommendationContext {
  goal: Goal;
  riskProfile: RiskProfile;
  riskCategory: RiskProfileCategory;
  spendingInsights: SpendingInsights;
  monthlyAmount: number;
  oneTimeAmount: number;
  emergencyFundCoverageMonths: number;
  idleBalance: number;
  horizonMonths: number;
  suitability: RecommendationSuitability;
  nextBestAction: RecommendationNextBestAction;
  reasoning: string[];
}

const marketLinkedProductTypes: BankApprovedProductType[] = [
  'CONSERVATIVE_MF_BASKET',
  'BALANCED_MF_BASKET',
  'EQUITY_SIP_BASKET',
  'TAX_SAVING',
];

@Injectable()
export class RecommendationEngineService {
  constructor(
    private readonly repository: InMemoryWealthRepository,
    private readonly spendingInsightsService: SpendingInsightsService,
  ) {}

  generate(
    customerId: string,
    request: GenerateRecommendationRequest,
  ): RecommendationResult {
    this.validateRequest(request);
    this.repository.findCustomerById(customerId);
    const goal = this.repository.findGoalByCustomerId(
      customerId,
      request.goalId,
    );
    const spendingInsights =
      this.spendingInsightsService.getSpendingInsights(customerId);
    const accountSummary =
      this.repository.findAccountSummaryByCustomerId(customerId);
    const emergencyFundCoverageMonths =
      spendingInsights.monthlyExpenses > 0
        ? accountSummary.savingsBalance / spendingInsights.monthlyExpenses
        : 0;
    const idleBalance = Math.max(
      0,
      accountSummary.savingsBalance - spendingInsights.monthlyExpenses * 2,
    );

    let riskProfile: RiskProfile;
    try {
      riskProfile = this.repository.findRiskProfileByCustomerId(customerId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return this.repository.createRecommendationResult(
          this.buildNoRiskProfileResponse(customerId, goal.id),
        );
      }
      throw error;
    }

    const riskCategory = this.toRiskCategory(riskProfile.band);
    const monthlyAmount = this.calculateMonthlyAmount(
      request,
      goal,
      spendingInsights,
    );

    if (spendingInsights.monthlySurplus <= 0 || monthlyAmount <= 0) {
      return this.repository.createRecommendationResult(
        this.buildNoSurplusResponse(customerId, goal, riskCategory),
      );
    }

    const horizonMonths = this.calculateHorizonMonths(goal.targetDate);
    const suitability = this.determineSuitability(
      spendingInsights.emiBurden.percentageOfIncome,
      emergencyFundCoverageMonths,
    );
    const oneTimeAmount = this.calculateOneTimeAmount(
      idleBalance,
      emergencyFundCoverageMonths,
    );
    const nextBestAction = this.determineNextBestAction(
      goal,
      riskCategory,
      emergencyFundCoverageMonths,
      spendingInsights.emiBurden.percentageOfIncome,
    );
    const context: RecommendationContext = {
      goal,
      riskProfile,
      riskCategory,
      spendingInsights,
      monthlyAmount,
      oneTimeAmount,
      emergencyFundCoverageMonths,
      idleBalance,
      horizonMonths,
      suitability,
      nextBestAction,
      reasoning: this.buildBaseReasoning({
        riskCategory,
        horizonMonths,
        spendingInsights,
        emergencyFundCoverageMonths,
        monthlyAmount,
        goal,
      }),
    };

    const allocationRules = this.selectAllocationRules(context);
    const allocation = this.buildAllocationItems(allocationRules, context);
    const includesMarketLinked = allocation.some((item) =>
      marketLinkedProductTypes.includes(item.productType),
    );
    const result: RecommendationResult = {
      recommendationId: `rec-${customerId}-${Date.now()}`,
      customerId,
      goalId: goal.id,
      suitability,
      riskProfile: riskCategory,
      recommendedPlan: {
        name: this.planName(goal, riskCategory, nextBestAction.type),
        description: this.planDescription(goal, suitability),
        monthlyAmount,
        oneTimeAmount: allocation.reduce(
          (sum, item) => sum + item.oneTimeAmount,
          0,
        ),
        allocation,
      },
      reasoning: context.reasoning,
      riskWarnings: includesMarketLinked
        ? [
            'Market-linked investments can fluctuate and returns are not guaranteed.',
          ]
        : [],
      disclaimer: includesMarketLinked
        ? 'This recommendation is based on available banking data, stated goal, and risk profile. Market-linked investments are subject to risk. Returns are not guaranteed. Please review product documents or speak to a certified advisor before investing.'
        : 'This recommendation is based on available banking data, stated goal, and risk profile. Please review applicable product terms, liquidity conditions, and charges before investing.',
      nextBestAction,
      createdAt: new Date().toISOString(),
    };

    return this.repository.createRecommendationResult(result);
  }

  private validateRequest(request: GenerateRecommendationRequest): void {
    if (!request.goalId?.trim()) {
      throw new BadRequestException('goalId is required');
    }

    if (
      request.monthlyInvestmentCapacity !== undefined &&
      request.monthlyInvestmentCapacity < 0
    ) {
      throw new BadRequestException(
        'monthlyInvestmentCapacity must be greater than or equal to 0',
      );
    }
  }

  private calculateMonthlyAmount(
    request: GenerateRecommendationRequest,
    goal: Goal,
    spendingInsights: SpendingInsights,
  ): number {
    const requestedCapacity =
      request.monthlyInvestmentCapacity ??
      goal.plannedMonthlyContribution ??
      spendingInsights.investableSurplusEstimate.min ??
      Math.max(0, spendingInsights.monthlySurplus * 0.25);
    const cappedAmount = Math.min(
      requestedCapacity,
      spendingInsights.investableSurplusEstimate.max,
      spendingInsights.monthlySurplus * 0.5,
    );
    const emiAdjustedAmount =
      spendingInsights.emiBurden.percentageOfIncome > 45
        ? cappedAmount * 0.5
        : spendingInsights.emiBurden.percentageOfIncome > 30
          ? cappedAmount * 0.75
          : cappedAmount;

    return this.roundToHundred(Math.max(0, emiAdjustedAmount));
  }

  private determineSuitability(
    emiBurdenPercent: number,
    emergencyFundCoverageMonths: number,
  ): RecommendationSuitability {
    if (emiBurdenPercent > 45) {
      return 'NEEDS_ADVISOR_REVIEW';
    }
    if (emiBurdenPercent > 30 || emergencyFundCoverageMonths < 1) {
      return 'PARTIALLY_SUITABLE';
    }
    return 'SUITABLE';
  }

  private selectAllocationRules(
    context: RecommendationContext,
  ): AllocationRule[] {
    if (context.goal.type === 'emergency-fund') {
      return [
        {
          productType: 'FIXED_DEPOSIT',
          percentage: 60,
          rationale: 'Keeps emergency savings stable and bank-approved.',
        },
        {
          productType: 'RECURRING_DEPOSIT',
          percentage: 40,
          rationale: 'Builds emergency savings through disciplined deposits.',
        },
      ];
    }

    if (context.emergencyFundCoverageMonths < 1) {
      return [
        {
          productType: 'RECURRING_DEPOSIT',
          percentage: 100,
          rationale:
            'Emergency fund is below one month, so stable savings are prioritized.',
        },
      ];
    }

    if (context.spendingInsights.emiBurden.percentageOfIncome > 45) {
      return [
        {
          productType: 'FIXED_DEPOSIT',
          percentage: 50,
          rationale: 'High EMI burden calls for stable, liquid allocation.',
        },
        {
          productType: 'RECURRING_DEPOSIT',
          percentage: 50,
          rationale: 'Debt load limits new market-linked exposure.',
        },
      ];
    }

    if (context.riskCategory === 'CONSERVATIVE') {
      if (context.horizonMonths < 36) {
        return [
          {
            productType: 'FIXED_DEPOSIT',
            percentage: 60,
            rationale: 'Short horizon and conservative profile favor deposits.',
          },
          {
            productType: 'RECURRING_DEPOSIT',
            percentage: 40,
            rationale: 'Supports disciplined low-risk saving.',
          },
        ];
      }

      return [
        {
          productType: 'RECURRING_DEPOSIT',
          percentage: 50,
          rationale: 'Maintains stable monthly saving discipline.',
        },
        {
          productType: 'CONSERVATIVE_MF_BASKET',
          percentage: 50,
          rationale:
            'Adds limited market-linked exposure suitable for a conservative profile.',
        },
      ];
    }

    if (context.riskCategory === 'MODERATE') {
      if (context.emergencyFundCoverageMonths < 3) {
        return [
          {
            productType: 'RECURRING_DEPOSIT',
            percentage: 70,
            rationale: 'Partial emergency fund calls for stable allocation.',
          },
          {
            productType: 'CONSERVATIVE_MF_BASKET',
            percentage: 30,
            rationale: 'Limits market-linked exposure while allowing growth.',
          },
        ];
      }

      if (context.horizonMonths < 36) {
        return [
          {
            productType: 'RECURRING_DEPOSIT',
            percentage: 50,
            rationale: 'Shorter horizon needs stable monthly savings.',
          },
          {
            productType: 'CONSERVATIVE_MF_BASKET',
            percentage: 50,
            rationale: 'Conservative basket fits the shorter goal timeline.',
          },
        ];
      }

      if (context.horizonMonths <= 60) {
        return [
          {
            productType: 'RECURRING_DEPOSIT',
            percentage: 30,
            rationale: 'Keeps part of the plan in stable monthly savings.',
          },
          {
            productType: 'BALANCED_MF_BASKET',
            percentage: 70,
            rationale:
              'Balanced basket matches moderate risk and medium horizon.',
          },
        ];
      }

      return [
        {
          productType: 'RECURRING_DEPOSIT',
          percentage: 20,
          rationale: 'Maintains a stable base for the plan.',
        },
        {
          productType: 'BALANCED_MF_BASKET',
          percentage: 70,
          rationale: 'Dominant balanced exposure fits a long-term goal.',
        },
        {
          productType: 'EQUITY_SIP_BASKET',
          percentage: 10,
          rationale:
            'Small equity SIP exposure is allowed for long horizon and healthy liquidity.',
        },
      ];
    }

    if (context.emergencyFundCoverageMonths < 3) {
      return [
        {
          productType: 'RECURRING_DEPOSIT',
          percentage: 50,
          rationale:
            'Weak emergency fund limits equity despite aggressive profile.',
        },
        {
          productType: 'BALANCED_MF_BASKET',
          percentage: 50,
          rationale: 'Balanced exposure avoids aggressive concentration.',
        },
      ];
    }

    if (context.horizonMonths < 36) {
      return [
        {
          productType: 'RECURRING_DEPOSIT',
          percentage: 40,
          rationale: 'Short goal horizon overrides aggressive risk appetite.',
        },
        {
          productType: 'BALANCED_MF_BASKET',
          percentage: 60,
          rationale: 'Balanced exposure is preferred for short timelines.',
        },
      ];
    }

    if (context.horizonMonths <= 60) {
      return [
        {
          productType: 'BALANCED_MF_BASKET',
          percentage: 30,
          rationale: 'Balanced basket moderates medium-horizon volatility.',
        },
        {
          productType: 'EQUITY_SIP_BASKET',
          percentage: 70,
          rationale: 'Equity SIP exposure fits aggressive risk with 3-5 years.',
        },
      ];
    }

    return [
      {
        productType: 'BALANCED_MF_BASKET',
        percentage: 20,
        rationale: 'Balanced basket diversifies the long-term plan.',
      },
      {
        productType: 'EQUITY_SIP_BASKET',
        percentage: 80,
        rationale: 'Long horizon and aggressive profile support equity SIP.',
      },
    ];
  }

  private buildAllocationItems(
    rules: AllocationRule[],
    context: RecommendationContext,
  ): RecommendedAllocationItem[] {
    const products = this.repository.findProductCatalog();
    const allowedRules = rules.filter((rule) =>
      this.isAllowedProductType(rule.productType, context),
    );
    const totalPercentage = allowedRules.reduce(
      (sum, rule) => sum + rule.percentage,
      0,
    );

    if (totalPercentage === 0) {
      throw new BadRequestException(
        'No approved product is available for this recommendation',
      );
    }

    const oneTimeTargetType =
      allowedRules.find((rule) =>
        ['FIXED_DEPOSIT', 'RECURRING_DEPOSIT'].includes(rule.productType),
      )?.productType ?? allowedRules[0]?.productType;

    return allowedRules.map((rule) => {
      const normalizedPercentage = Math.round(
        (rule.percentage / totalPercentage) * 100,
      );
      const product = this.findProductByType(products, rule.productType);

      return {
        productId: product.id,
        productName: product.name,
        productType: product.productType,
        percentage: normalizedPercentage,
        monthlyAmount: this.roundToHundred(
          (context.monthlyAmount * normalizedPercentage) / 100,
        ),
        oneTimeAmount:
          rule.productType === oneTimeTargetType ? context.oneTimeAmount : 0,
        rationale: rule.rationale,
      };
    });
  }

  private isAllowedProductType(
    productType: BankApprovedProductType,
    context: RecommendationContext,
  ): boolean {
    const product = this.repository
      .findProductCatalog()
      .find((item) => item.productType === productType);

    if (!product) {
      return false;
    }

    if (
      context.riskCategory === 'CONSERVATIVE' &&
      productType === 'EQUITY_SIP_BASKET'
    ) {
      return false;
    }

    if (
      context.spendingInsights.emiBurden.percentageOfIncome > 45 &&
      product.riskLevel !== 'low'
    ) {
      return false;
    }

    if (context.emergencyFundCoverageMonths < 1) {
      return product.riskLevel === 'low';
    }

    if (
      context.emergencyFundCoverageMonths < 3 &&
      productType === 'EQUITY_SIP_BASKET'
    ) {
      return false;
    }

    return true;
  }

  private findProductByType(
    products: ProductCatalogItem[],
    productType: BankApprovedProductType,
  ): ProductCatalogItem {
    const product = products.find((item) => item.productType === productType);

    if (!product) {
      throw new BadRequestException(
        `Approved product ${productType} is not available`,
      );
    }

    return product;
  }

  private buildNoRiskProfileResponse(
    customerId: string,
    goalId: string,
  ): RecommendationResult {
    return {
      recommendationId: `rec-${customerId}-${Date.now()}`,
      customerId,
      goalId,
      suitability: 'NEEDS_ADVISOR_REVIEW',
      riskProfile: null,
      recommendedPlan: null,
      reasoning: [
        'Risk profiling is required before generating any market-linked investment recommendation.',
      ],
      riskWarnings: [],
      disclaimer:
        'This recommendation is based on available banking data. Complete risk profiling and review product documents or speak to a certified advisor before investing.',
      nextBestAction: {
        type: 'COMPLETE_RISK_PROFILE',
        label: 'Complete risk profile',
        description:
          'Answer the risk questionnaire before receiving investment recommendations.',
      },
      createdAt: new Date().toISOString(),
    };
  }

  private buildNoSurplusResponse(
    customerId: string,
    goal: Goal,
    riskCategory: RiskProfileCategory,
  ): RecommendationResult {
    return {
      recommendationId: `rec-${customerId}-${Date.now()}`,
      customerId,
      goalId: goal.id,
      suitability: 'NOT_SUITABLE',
      riskProfile: riskCategory,
      recommendedPlan: null,
      reasoning: [
        'Monthly surplus is not positive, so a new investment commitment is not suitable right now.',
      ],
      riskWarnings: [],
      disclaimer:
        'This recommendation is based on available banking data, stated goal, and risk profile. Please review affordability with a certified advisor before investing.',
      nextBestAction: {
        type: 'REVIEW_WITH_ADVISOR',
        label: 'Review with advisor',
        description:
          'Review expenses, debt, and goal timeline before starting a new investment.',
      },
      createdAt: new Date().toISOString(),
    };
  }

  private buildBaseReasoning(input: {
    riskCategory: RiskProfileCategory;
    horizonMonths: number;
    spendingInsights: SpendingInsights;
    emergencyFundCoverageMonths: number;
    monthlyAmount: number;
    goal: Goal;
  }): string[] {
    const reasoning = [
      `Customer has a ${input.riskCategory} risk profile.`,
      `Goal horizon is ${input.horizonMonths} months.`,
      `Recommended monthly amount is capped at INR ${input.monthlyAmount.toLocaleString('en-IN')} based on affordability rules.`,
      `Emergency fund coverage is ${input.emergencyFundCoverageMonths.toFixed(1)} months.`,
    ];

    if (input.spendingInsights.emiBurden.percentageOfIncome > 45) {
      reasoning.push(
        'EMI burden is high, so the recommendation reduces the suggested amount and avoids aggressive allocation.',
      );
    } else if (input.spendingInsights.emiBurden.percentageOfIncome > 30) {
      reasoning.push(
        'EMI burden is elevated, so monthly investment is conservatively capped.',
      );
    } else {
      reasoning.push(
        'Customer has positive monthly surplus and manageable EMI burden.',
      );
    }

    if (input.goal.type === 'emergency-fund') {
      reasoning.push(
        'Emergency fund goals use only stable bank-approved products.',
      );
    }

    return reasoning;
  }

  private determineNextBestAction(
    goal: Goal,
    riskCategory: RiskProfileCategory,
    emergencyFundCoverageMonths: number,
    emiBurdenPercent: number,
  ): RecommendationNextBestAction {
    if (emiBurdenPercent > 45) {
      return {
        type: 'REDUCE_DEBT',
        label: 'Reduce debt burden',
        description: 'Review EMIs before increasing investment commitments.',
      };
    }

    if (emergencyFundCoverageMonths < 1 || goal.type === 'emergency-fund') {
      return {
        type: 'BUILD_EMERGENCY_FUND',
        label: 'Build emergency fund',
        description:
          'Prioritize stable savings before increasing market-linked investments.',
      };
    }

    if (riskCategory === 'CONSERVATIVE') {
      return {
        type: 'START_RD',
        label: 'Start stable monthly saving',
        description: 'Proceed to review a lower-risk monthly saving plan.',
      };
    }

    return {
      type: 'START_SIP',
      label: 'Start recommended SIP',
      description: 'Proceed to review the recommended monthly investment plan.',
    };
  }

  private calculateOneTimeAmount(
    idleBalance: number,
    emergencyFundCoverageMonths: number,
  ): number {
    if (idleBalance <= 0) {
      return 0;
    }

    if (emergencyFundCoverageMonths < 3) {
      return this.roundToHundred(Math.min(idleBalance * 0.25, 100000));
    }

    return this.roundToHundred(Math.min(idleBalance * 0.25, 100000));
  }

  private calculateHorizonMonths(targetDate: string): number {
    const targetTime = new Date(targetDate).getTime();
    const now = Date.now();

    return Math.max(
      0,
      Math.ceil((targetTime - now) / (1000 * 60 * 60 * 24 * 30.4375)),
    );
  }

  private toRiskCategory(riskBand: RiskProfile['band']): RiskProfileCategory {
    if (riskBand === 'conservative') {
      return 'CONSERVATIVE';
    }
    if (riskBand === 'moderate') {
      return 'MODERATE';
    }
    return 'AGGRESSIVE';
  }

  private planName(
    goal: Goal,
    riskCategory: RiskProfileCategory,
    nextAction: RecommendationNextBestAction['type'],
  ): string {
    if (nextAction === 'BUILD_EMERGENCY_FUND') {
      return 'Emergency Buffer Builder Plan';
    }
    if (riskCategory === 'CONSERVATIVE') {
      return 'Stable Goal Savings Plan';
    }
    if (riskCategory === 'MODERATE') {
      return 'Balanced SIP + Safety Plan';
    }
    return `${this.toTitle(goal.type)} Growth SIP Plan`;
  }

  private planDescription(
    goal: Goal,
    suitability: RecommendationSuitability,
  ): string {
    if (suitability === 'NEEDS_ADVISOR_REVIEW') {
      return 'A reduced-risk plan that should be reviewed with an advisor before action.';
    }

    if (goal.type === 'emergency-fund') {
      return 'A stable plan focused on liquidity and emergency savings discipline.';
    }

    return 'A rule-based plan using bank-approved products aligned to goal, affordability, and risk profile.';
  }

  private toTitle(value: string): string {
    return value
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private roundToHundred(value: number): number {
    return Math.round(value / 100) * 100;
  }
}
