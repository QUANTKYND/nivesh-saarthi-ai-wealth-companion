import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Digital Wealth Management API')
    .setDescription(
      'Read APIs for the AI-powered Digital Wealth Management MVP.',
    )
    .setVersion('0.1.0')
    .addTag('customers')
    .addTag('accounts')
    .addTag('transactions')
    .addTag('goals')
    .addTag('risk-profiles')
    .addTag('product-catalog')
    .addTag('recommendations')
    .addTag('advisor-chat')
    .addTag('audit-logs')
    .addTag('advisor-callbacks')
    .addTag('wealth-dashboard')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    jsonDocumentUrl: '/api/docs-json',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
