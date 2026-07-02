import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import type {
  AdvisorChatResponse,
  RiskProfileQuestionnaire,
  RiskProfileResult,
  RecommendationResult,
} from '@wealth/shared-types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('/api/customers (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/customers')
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveLength(3);
      });
  });

  it('/api/risk-profile/questions (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/risk-profile/questions')
      .expect(200)
      .expect((response) => {
        const body = response.body as RiskProfileQuestionnaire;

        expect(body.questions).toHaveLength(8);
        expect(body.questions[0].id).toBe('investment_horizon');
      });
  });

  it('/api/customers/:customerId/risk-profile (POST then GET)', async () => {
    const answers = [
      { questionId: 'investment_horizon', optionId: '3_to_5_years' },
      { questionId: 'income_stability', optionId: 'stable' },
      { questionId: 'loss_tolerance', optionId: 'moderate_fluctuation' },
      { questionId: 'emergency_fund_status', optionId: '3_to_6_months' },
      { questionId: 'investment_experience', optionId: 'mutual_funds_or_sips' },
      { questionId: 'liquidity_needs', optionId: 'can_lock_for_3_years' },
      {
        questionId: 'dependence_on_invested_funds',
        optionId: 'partially_dependent',
      },
      { questionId: 'investment_objective', optionId: 'balanced_growth' },
    ];

    await request(app.getHttpServer())
      .post('/api/customers/cust-family-001/risk-profile')
      .send({ answers })
      .expect(201)
      .expect((response) => {
        const body = response.body as RiskProfileResult;

        expect(body.category).toBe('MODERATE');
        expect(body.scoreBreakdown).toHaveLength(8);
      });

    return request(app.getHttpServer())
      .get('/api/customers/cust-family-001/risk-profile')
      .expect(200)
      .expect((response) => {
        const body = response.body as RiskProfileResult;

        expect(body.category).toBe('MODERATE');
        expect(body.score).toBe(15);
      });
  });

  it('/api/customers/:customerId/risk-profile returns validation and not found errors', async () => {
    await request(app.getHttpServer())
      .post('/api/customers/cust-family-001/risk-profile')
      .send({ answers: [{ questionId: 'unknown', optionId: 'unknown' }] })
      .expect(400);

    return request(app.getHttpServer())
      .post('/api/customers/missing-customer/risk-profile')
      .send({ answers: [] })
      .expect(404);
  });

  it('/api/customers/:customerId/recommendations (POST then GET)', async () => {
    await request(app.getHttpServer())
      .post('/api/customers/cust-family-001/recommendations')
      .send({ goalId: 'goal-f-001', monthlyInvestmentCapacity: 10000 })
      .expect(201)
      .expect((response) => {
        const body = response.body as RecommendationResult;

        expect(body.customerId).toBe('cust-family-001');
        expect(body.goalId).toBe('goal-f-001');
        expect(body.recommendedPlan?.allocation.length).toBeGreaterThan(0);
        expect(body.disclaimer).toEqual(expect.any(String));
      });

    return request(app.getHttpServer())
      .get('/api/customers/cust-family-001/recommendations')
      .expect(200)
      .expect((response) => {
        const body = response.body as Array<Record<string, unknown>>;

        expect(body.some((item) => item.customerId === 'cust-family-001')).toBe(
          true,
        );
        expect(body.some((item) => 'recommendationId' in item)).toBe(true);
      });
  });

  it('/api/customers/:customerId/recommendations returns validation and not found errors', async () => {
    await request(app.getHttpServer())
      .post('/api/customers/cust-family-001/recommendations')
      .send({ goalId: 'goal-f-001', monthlyInvestmentCapacity: -1 })
      .expect(400);

    return request(app.getHttpServer())
      .post('/api/customers/cust-family-001/recommendations')
      .send({ goalId: 'missing-goal' })
      .expect(404);
  });

  it('/api/advisor-chat/message (POST then history GET)', async () => {
    await request(app.getHttpServer())
      .post('/api/advisor-chat/message')
      .send({
        customerId: 'cust-family-001',
        message: 'Can I invest INR 10000 per month?',
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as AdvisorChatResponse;

        expect(body.customerId).toBe('cust-family-001');
        expect(body.intent).toBe('investment_capacity');
        expect(body.actionCards.length).toBeGreaterThan(0);
        expect(body.disclaimer).toEqual(expect.any(String));
      });

    return request(app.getHttpServer())
      .get('/api/customers/cust-family-001/advisor-chat/messages')
      .expect(200)
      .expect((response) => {
        const body = response.body as Array<Record<string, unknown>>;

        expect(
          body.some(
            (item) =>
              item.role === 'advisor' &&
              typeof item.message === 'string' &&
              item.message.includes('monthly surplus'),
          ),
        ).toBe(true);
      });
  });

  it('/api/advisor-chat/message returns validation, not found, and guardrail responses', async () => {
    await request(app.getHttpServer())
      .post('/api/advisor-chat/message')
      .send({ customerId: 'cust-family-001', message: ' ' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/advisor-chat/message')
      .send({ customerId: 'missing-customer', message: 'Hello' })
      .expect(404);

    return request(app.getHttpServer())
      .post('/api/advisor-chat/message')
      .send({
        customerId: 'cust-family-001',
        message: 'Which crypto has guaranteed returns?',
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as AdvisorChatResponse;

        expect(body.intent).toBe('unsupported_advice');
        expect(body.actionCards[0]?.type).toBe('REQUEST_ADVISOR_CALLBACK');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
