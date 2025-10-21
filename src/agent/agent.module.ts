import { Module, Global } from '@nestjs/common';
import { AgentService } from './agent.service';

@Global()
@Module({
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
