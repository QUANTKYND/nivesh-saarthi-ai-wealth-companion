import { Module } from '@nestjs/common';
import { WealthDataModule } from '../data/wealth-data.module';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';

@Module({
  imports: [WealthDataModule],
  controllers: [GoalsController],
  providers: [GoalsService],
})
export class GoalsModule {}
