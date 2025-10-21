import { Agent } from '@openai/agents';
import { catSafePrompt } from '../prompts/cat-safe.prompt';
import { HarmfulAgent } from './harmful.agent';
import { PoisonousAgent } from './poisonous.agent';

export const CatSafeAgent = Agent.create({
  name: 'Cat Safe Plant Analysis Coordinator',
  instructions: catSafePrompt.join('\n'),
  model: 'gpt-4.1-mini',
  handoffs: [HarmfulAgent, PoisonousAgent],
});
