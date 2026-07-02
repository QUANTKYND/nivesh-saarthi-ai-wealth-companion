import { Module } from '@nestjs/common';
import { WealthDataModule } from '../data/wealth-data.module';
import { AdvisorChatController } from './advisor-chat.controller';
import { AdvisorChatService } from './advisor-chat.service';

@Module({
  imports: [WealthDataModule],
  controllers: [AdvisorChatController],
  providers: [AdvisorChatService],
})
export class AdvisorChatModule {}
