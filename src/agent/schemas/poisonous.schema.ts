import { z } from 'zod';
import { AgentType } from '../agent.enum';

export const PoisonousSchema = z.object({
  isPoisonous: z.boolean(),
  plantName: z.string(),
  plantScientificName: z.string(),
  plantDescription: z.string(),
  toxicityLevel: z.string(), // Non-toxic, Mildly toxic, Moderately toxic, Highly toxic, Lethal
  toxicPlantParts: z.array(z.string()), // leaves, stems, flowers, roots, etc.
  safePlantParts: z.array(z.string()),
  toxicCompounds: z.array(
    z.object({
      name: z.string(),
      chemicalClassification: z.string(), // alkaloids, glycosides, saponins, etc.
      mechanismOfAction: z.string(),
      targetOrgans: z.array(z.string()),
      toxicityDescription: z.string(),
    }),
  ),
  clinicalSigns: z.object({
    earlySymptoms: z.array(z.string()),
    progressiveSymptoms: z.array(z.string()),
    onsetTimeline: z.string(),
  }),
  emergencyResponse: z.object({
    firstAidSteps: z.array(z.string()),
    whenToSeekHelp: z.string(),
    vetInformation: z.array(z.string()),
  }),
  nearestVets: z.array(
    z.object({
      name: z.string(),
      address: z.string(),
      phoneNumber: z.string(),
      distance: z.string(),
      isEmergency24h: z.boolean(),
    }),
  ),
  locationCoordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  toxicityThreshold: z.string(),
  agentType: z.nativeEnum(AgentType),
});

export type PoisonousSchemaType = z.infer<typeof PoisonousSchema>;
