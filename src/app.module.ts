import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentModule } from './agent/agent.module';
import { ConfigModule } from '@nestjs/config';
import { CatSafeModule } from './cat-safe/cat-safe.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AgentModule,
    CatSafeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
