import { Agent, webSearchTool } from '@openai/agents';
import { harmfulPrompt } from '../prompts/harmful.prompt';
import { HarmfulSchema } from '../schemas/harmful.schema';

export const HarmfulAgent = new Agent({
  name: 'Harmful Plant Identifier',
  instructions: harmfulPrompt.join('\n'),
  tools: [webSearchTool()],
  model: 'gpt-4.1-mini',
  outputType: HarmfulSchema,
});
