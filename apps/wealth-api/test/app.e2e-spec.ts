import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import type {
  RiskProfileQuestionnaire,
  RiskProfileResult,
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

  afterEach(async () => {
    await app.close();
  });
});
