import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlavesController } from './llaves/llaves.controller';
import { DebitsController } from './intents/debits.controller';
import { CreditsController } from './intents/credits.controller';
import { WalletsController } from './wallets/wallets.controller';

@Module({
  imports: [],
  controllers: [AppController, LlavesController, DebitsController, WalletsController, CreditsController],
  providers: [AppService],
})
export class AppModule {}
