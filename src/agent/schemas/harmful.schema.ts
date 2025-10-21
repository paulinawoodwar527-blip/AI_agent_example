import { z } from 'zod';
import { AgentType } from '../agent.enum';

export const HarmfulSchema = z.object({
  isHarmful: z.boolean(),
  plantName: z.string(),
  plantScientificName: z.string(),
  chemicalComposition: z.string(),
  chemicalList: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      toxicity: z.boolean(),
      toxicityLevel: z.number().min(0).max(10),
      toxicityDescription: z.string(),
      toxicitySymptoms: z.array(z.string()),
      toxicityTreatment: z.string(),
    }),
  ),
  toxicityThreshold: z.string(),
  agentType: z.nativeEnum(AgentType),
});

export type HarmfulSchemaType = z.infer<typeof HarmfulSchema>;
