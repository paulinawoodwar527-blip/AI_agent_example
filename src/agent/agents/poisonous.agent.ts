import { Agent, webSearchTool } from '@openai/agents';
import { poisonousPrompt } from '../prompts/poisonous.prompt';
import { PoisonousSchema } from '../schemas/poisonous.schema';

export const PoisonousAgent = new Agent({
  name: 'Poisonous Plant Analyzer',
  instructions: poisonousPrompt.join('\n'),
  tools: [webSearchTool()],
  model: 'gpt-4.1-mini',
  outputType: PoisonousSchema,
});
