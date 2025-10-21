import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Agent,
  AgentInputItem,
  run,
  setDefaultOpenAIKey,
} from '@openai/agents';
import { CatSafeAgent } from './agents/cat-safe.agent';

@Injectable()
export class AgentService {
  private catSafeAgent: Agent<unknown, typeof CatSafeAgent.outputType>;
  constructor(private configService: ConfigService) {
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is required but not provided');
    }
    setDefaultOpenAIKey(openaiApiKey);
    this.catSafeAgent = CatSafeAgent;
  }

  async checkThePlantIsHarmful(
    base64Image: string,
    longitude: number,
    latitude: number,
  ) {
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;
    const agentInputItem: AgentInputItem = {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: `The plant is located at ${longitude}, ${latitude}`,
        },
        {
          type: 'input_image',
          image: imageUrl,
        },
      ],
    };
    const result = await run(this.catSafeAgent, [agentInputItem]);
    return result.finalOutput;
  }
}
