# 🤖 AI Agent Development with NestJS

A comprehensive guide and example project demonstrating how to build an intelligent photo recognition system for identifying cat-safe plants using NestJS framework.

## 📖 About This Project

This project is a photo recognition system designed to identify whether plant leaves are harmful, poisonous, or safe for cats. Using AI-powered image analysis, the system can analyze photos submitted by clients and determine the potential danger level of various plants to feline companions. The application leverages OpenAI's Agent SDK integrated with NestJS to provide intelligent plant identification and safety assessment.

## 🔧 Implementation

### Step 1: Install @openai/agents

First you need to install the @openai/agents package:

```bash
npm install @openai/agents
```

### Step 2: Create Agent Module

Create a module for the AI agent:

```bash
nest g module agent
```

### Step 3: Create Agent Service

Create an agent service:

```bash
nest g service agent
```

## 📁 Project Structure

```
src/
├── agent/
│   ├── agent.module.ts
│   └── agent.service.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

### Step 4: Initialize Agent Service(agent.service)

Initialize the agent service with OpenAI API key. The `setDefaultOpenAIKey` function configures the global API key for all OpenAI agent operations:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setDefaultOpenAIKey } from '@openai/agents';

@Injectable()
export class AgentService {
  constructor(private configService: ConfigService) {
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is required but not provided');
    }
    setDefaultOpenAIKey(openaiApiKey);
  }
}
```

### Step 5: Configure Environment(app.mudule)

Set up the ConfigModule in your app module:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentModule } from './agent/agent.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AgentModule],
})
export class AppModule {}
```

## 🚀 Getting Started(harmful.agent)

Create first agent to check if the plant is harmful

```typescript
import { Agent, webSearchTool } from '@openai/agents';
import { harmfulPrompt } from '../prompts/harmful.prompt';

export const HarmfulAgent = new Agent({
  name: 'Harmful Plant Identifier',
  instructions: harmfulPrompt.join('\n'),
  tools: [webSearchTool()],
  model: 'gpt-4.1-mini',
});
```

### Agent Configuration Explained

The agent configuration consists of several key components:

- **`name`**: Sets a descriptive name for the agent that identifies its purpose (in this case, "Harmful Plant Identifier")
- **`instructions`**: Contains the prompt that tells the agent how to behave and what tasks to perform
- **`tools`**: An array of tools the agent can use. Here we include `webSearchTool()` which enables the agent to search the internet for real-time information about plants
- **`model`**: Specifies which OpenAI model to use. We're using `gpt-4.1-mini` which provides a good balance of performance and cost for this type of analysis

So what about the prompt? Let's take a look at how we structure our prompt:

```typescript
export const harmfulPrompt: string[] = [
  'you are a veterinarian who is specialized in cat and at the same time you are a plant expert',
  'you search the internet for the plant name and the plant description',
  'Your task is to:',
  '1- identify the plant on the photo',
  '2- provide the which part of the plant is harmful to cats or which part of the plant is safe for cats',
  '3- How much of a plant would harm a cat?',
  '4- provide the plant description',
  '6- provide the plant name',
  '7- provide comperensive chemicals list of the plant',
  '',
  'IMPORTANT: Always set agentType to "HARMFUL" in your response.',
];
```

### Why Use Prompt Arrays?

Instead of writing one long string, we use an array of strings for several advantages:

- **Better Readability**: Each instruction is on its own line, making the prompt easier to read and understand
- **Easier Maintenance**: You can easily add, remove, or reorder instructions without dealing with complex string concatenation
- **Version Control Friendly**: Changes to individual instructions are clearly visible in git diffs
- **Modular Structure**: You can break down complex prompts into logical sections

The `join('\n')` method converts the array back to a single string with newlines between each instruction, which is the format the agent expects.

### Step 6: Implementing the Harmful Agent to the Agent Service

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Agent,
  AgentInputItem,
  run,
  setDefaultOpenAIKey,
} from '@openai/agents';
import { HarmfulAgent } from './agents/harmful.agent';

@Injectable()
export class AgentService {
  private harmfulAgent: Agent;
  constructor(private configService: ConfigService) {
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is required but not provided');
    }
    setDefaultOpenAIKey(openaiApiKey);
    this.harmfulAgent = HarmfulAgent;
  }

  async checkThePlantIsHarmful(base64Image: string) {
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;
    const agentInputItem: AgentInputItem = {
      role: 'user',
      content: [
        {
          type: 'input_image',
          image: imageUrl,
        },
      ],
    };
    const result = await run(this.harmfulAgent, [agentInputItem]);
    return result.finalOutput;
  }
}
```

### Understanding the `checkThePlantIsHarmful` Function

This function demonstrates the proper way to handle image inputs when working with OpenAI agents. Here's what's happening:

1. **Function Purpose**: The function takes a base64-encoded image string as input and uses the harmful agent to analyze whether the plant in the image is safe for cats.

2. **Base64 to Data URL Conversion**: The function converts the base64 image data to a data URL format that the OpenAI agent can process:

   ```typescript
   const imageUrl = `data:image/jpeg;base64,${base64Image}`;
   ```

3. **AgentInputItem Structure**: Instead of passing the image URL as a plain string, we create an `AgentInputItem` object with:
   - `role: 'user'` - Indicates this is a user input
   - `content` - An array containing the actual input data
   - `type: 'input_image'` - Specifies that this is an image input
   - `image: imageUrl` - The data URL of the image to analyze

4. **Why Use AgentInputItem Instead of Plain Strings?**

   **❌ Problem with String Approach:**

   ```typescript
   // DON'T DO THIS - Can cause token limit issues
   const result = await run(this.harmfulAgent, [
     { role: 'user', content: `Analyze this image: ${imageUrl}` },
   ]);
   ```

   **✅ Correct Approach (What We're Using):**

   ```typescript
   // DO THIS - Efficient and avoids token limits
   const agentInputItem: AgentInputItem = {
     role: 'user',
     content: [{ type: 'input_image', image: imageUrl }],
   };
   ```

5. **Token Limit Benefits**: When you use the `input_image` type, the agent processes the image directly without converting it to text tokens. This means:
   - You avoid consuming large amounts of tokens for image data
   - The agent can process high-resolution images efficiently
   - You stay within OpenAI's token limits even with complex images
   - Better performance and cost-effectiveness

6. **Agent Execution**: The function then runs the harmful agent with the properly formatted input and returns the analysis result.

7. **Integration with File Upload**: This function is designed to work with file upload middleware (like Multer) that provides base64-encoded image data, making it easy to integrate with web forms and mobile applications.

Now let's create an endpoint to run our agent and analyze plant images.

Created a new controller to handle the request and response:

Create cat-safe module

```bash
nest g module cat-safe
```

Create cat-safe controller

```bash
nest g controller cat-safe
```

Create cat-safe service

```bash
nest g service cat-safe
```

## 📁 Updated Project Structure

```

src/
├── agent/
│ ├── agent.module.ts
│ ├── agent.service.ts
│ ├── agents/
│ │ └── harmful.agent.ts
│ └── prompts/
│ └── harmful.prompt.ts
├── cat-safe/
│ ├── cat-safe.controller.ts
│ ├── cat-safe.module.ts
│ └── cat-safe.service.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts

```

Implement the agent service to the cat-safe service

```typescript
import { Injectable } from '@nestjs/common';
import { AgentService } from '../agent/agent.service';

@Injectable()
export class CatSafeService {
  constructor(private readonly agentService: AgentService) {}

  async checkThePlantIsHarmful(image: Express.Multer.File) {
    const base64Image = image.buffer.toString('base64');
    const result = await this.agentService.checkThePlantIsHarmful(base64Image);
    return result;
  }
}
```

Now We can use the cat-safe service in the cat-safe controller

```typescript
import {
  Body,
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CatSafeService } from './cat-safe.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('cat-safe')
export class CatSafeController {
  constructor(private readonly catSafeService: CatSafeService) {}

  @Post('check-harmful')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'the image of the user',
        },
      },
    },
  })
  async checkHarmful(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    image: Express.Multer.File,
  ) {
    return this.catSafeService.checkThePlantIsHarmful(image);
  }
}
```

Implement the swagger documentation to main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Cat Safe API')
    .setDescription('API for checking if a plant is harmful to cats')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  await app.listen(3000);
}
bootstrap();
```

Now We can run the application and test the api using the swagger ui

```bash
npm run start:dev
```

We can go to http://localhost:3000/swagger to see the swagger ui

When I test the api with the image of Spider Plant 🕷️, I got the following result:

![Pure harmful agent response](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ajmh143nwf0h767qa8bf.png)

## ⚠️ **IMPORTANT: Response Format Issue**

As we can see, the agent is able to identify the plant and provide the information about the plant. **However, there's a critical issue with the response format that needs immediate attention:**

### 🚨 **Current Problem:**

The response body is **not in a good format** - it's raw, unstructured text that's difficult to parse and understand programmatically.

### 🎯 **Why This Matters:**

- **API Integration**: Other applications can't easily consume unstructured responses
- **User Experience**: Frontend applications need structured data to display information properly
- **Error Handling**: Without structured responses, it's hard to handle different types of responses
- **Scalability**: Unstructured responses make it difficult to add features like response caching or analytics

### 🔧 **What We Need to Fix:**

We need to improve the response body to be more **readable, structured, and easy to understand**. This is a **critical improvement** that will make our API production-ready.

**Next Steps:** We'll implement structured response formatting to ensure consistent, parseable responses.

## 🔍 **Solution: Structured Response Formatting**

We'll implement structured response formatting to ensure consistent, parseable responses using **`outputType`** in the harmful agent.

### 🎯 **What is `outputType`?**

`outputType` is a **powerful function** that takes a **Zod schema** and returns a function that can be used to parse and validate the response body. This ensures:

- ✅ **Consistent Response Structure**: Every response follows the same format
- ✅ **Type Safety**: TypeScript can infer the response type
- ✅ **Validation**: Automatic validation of response data
- ✅ **Error Handling**: Clear error messages for invalid responses

### 🔧 **How `outputType` Works:**

1. **Define a Zod Schema**: Create a schema that describes your expected response structure
2. **Apply to Agent**: Use `outputType(schema)` when creating your agent
3. **Automatic Parsing**: The agent will automatically format responses according to your schema
4. **Type Safety**: TypeScript will know exactly what structure your response will have

### 📋 **Benefits of Using `outputType`:**

| Benefit            | Description                                   |
| ------------------ | --------------------------------------------- |
| **🏗️ Structure**   | Consistent JSON responses instead of raw text |
| **🔒 Validation**  | Automatic validation of response data         |
| **📝 Type Safety** | TypeScript can infer the response type        |
| **🐛 Debugging**   | Clear error messages for malformed responses  |
| **⚡ Performance** | Faster parsing and processing                 |
| **🔄 Integration** | Easy integration with frontend applications   |

### 🚀 **Implementation Steps:**

1. **Define Response Schema** using Zod
2. **Update Agent Configuration** with `outputType`
3. **Test Structured Responses**

Let's implement this step by step!

Define the response schema using zod. but before that, we need to create a new enum for the agent type.

agent.enum.ts

```typescript
export enum AgentType {
  HARMFUL = 'HARMFUL',
  POISONOUS = 'POISONOUS',
}
```

In `agent.enum.ts`, we define the agent type.

In `harmful.schema.ts`, we use the agent type enum to define the agent type.

harmful.schema.ts

```typescript
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
```

Update the harmful agent and agent service to use the harmful schema

In `harmful.agent.ts`, we need to update the outputType to use the harmful schema.

```typescript
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
```

In `agent.service.ts`, we need to update the harmfulAgent to use the harmful schema. This is done by using the `Agent<unknown, typeof HarmfulAgent.outputType>` type. This facilitates the type safety and validation of the response body.

```typescript
private harmfulAgent: Agent<unknown, typeof HarmfulAgent.outputType>;
```

When we run the application, we can see the response body is in a good format like this:

```json
{
  "isHarmful": false,
  "plantName": "Spider Plant",
  "plantScientificName": "Chlorophytum comosum",
  "chemicalComposition": "Spider plants are known for their air-purifying properties, effectively removing toxins like formaldehyde, xylene, and carbon monoxide from indoor environments. However, specific chemical compositions of the plant are not well-documented in available sources.",
  "chemicalList": [
    {
      "name": "Formaldehyde",
      "description": "A common indoor air pollutant that spider plants can absorb, improving air quality.",
      "toxicity": true,
      "toxicityLevel": 2,
      "toxicityDescription": "Formaldehyde is a toxic compound that can cause respiratory issues and other health problems in humans and animals.",
      "toxicitySymptoms": ["Respiratory irritation", "Headaches", "Dizziness"],
      "toxicityTreatment": "Remove the source of exposure and seek medical attention if symptoms persist."
    },
    {
      "name": "Xylene",
      "description": "An organic compound found in indoor air that spider plants can help reduce.",
      "toxicity": true,
      "toxicityLevel": 3,
      "toxicityDescription": "Xylene exposure can lead to headaches, dizziness, and nausea in humans and animals.",
      "toxicitySymptoms": ["Headaches", "Dizziness", "Nausea"],
      "toxicityTreatment": "Ensure fresh air circulation and consult a healthcare professional if symptoms continue."
    },
    {
      "name": "Carbon Monoxide",
      "description": "A colorless, odorless gas that spider plants can help mitigate in indoor spaces.",
      "toxicity": true,
      "toxicityLevel": 5,
      "toxicityDescription": "Carbon monoxide is highly toxic and can be fatal at high concentrations.",
      "toxicitySymptoms": [
        "Headaches",
        "Dizziness",
        "Nausea",
        "Confusion",
        "Loss of consciousness"
      ],
      "toxicityTreatment": "Move to fresh air immediately and seek emergency medical care."
    }
  ],
  "toxicityThreshold": "Spider plants are non-toxic to cats and are safe for them to ingest. There is no known harmful threshold for cats consuming spider plants.",
  "agentType": "HARMFUL"
}
```

What would happen if the plant was poisonous? For this reason, we need to create a new agent for the poisonous plants.

## 🌿 Building the Poisonous Plant Analysis System

### 🔄 **Step-by-Step Development Process**

We'll follow a systematic approach to build the poisonous plant agent:

1. **📝 Create Prompts** - Define the AI's behavior and analysis framework
2. **🏗️ Create Schema** - Structure the response data format
3. **🤖 Create Agent** - Combine prompts and schema into a working agent

---

### 📝 **Step 1: Create the Poisonous Plant Prompt**

First, we need to create a comprehensive prompt that guides the AI to perform detailed toxicological analysis.

Create `src/agent/prompts/poisonous.prompt.ts`:

```typescript
export const poisonousPrompt: string[] = [
  'You are an expert veterinary toxicologist and botanist specializing in feline health and plant identification.',
  'You have extensive knowledge of plant toxicology, chemical compounds, and their effects on cats.',
  'IMPORTANT: You MUST use web search throughout your analysis to find current and accurate information.',
  '',
  'CONTEXT:',
  'You will be provided with images of plants and cats. Your role is to assess potential toxicity risks.',
  '',
  'YOUR ANALYSIS MUST INCLUDE:',
  '',
  '1. PLANT IDENTIFICATION:',
  '   - Scientific name (genus and species)',
  '   - Common names',
  '   - Plant family classification',
  '   - Key identifying characteristics visible in the image',
  '',
  '2. TOXICITY ASSESSMENT:',
  '   - Overall toxicity level to cats (Non-toxic, Mildly toxic, Moderately toxic, Highly toxic, Lethal)',
  '   - Specific plant parts that are toxic (leaves, stems, flowers, roots, seeds, sap, etc.)',
  '   - Parts that are safe (if any)',
  '',
  '3. TOXIC COMPOUNDS:',
  '   - Identify specific toxic chemicals/compounds present',
  '   - Chemical classification (alkaloids, glycosides, saponins, oxalates, etc.)',
  '   - Mechanism of action (how these compounds affect cat physiology)',
  '   - Target organs/systems affected',
  '',
  '4. DOSAGE AND SEVERITY:',
  '   - Minimum toxic dose (if known)',
  '   - Relationship between amount consumed and severity of symptoms',
  '   - Factors affecting toxicity (cat size, age, health status)',
  '',
  '5. CLINICAL PRESENTATION:',
  '   - Early symptoms and signs',
  '   - Progressive symptoms if untreated',
  '   - Timeline of symptom onset',
  '   - Potential complications',
  '',
  '6. EMERGENCY RESPONSE:',
  '   - Immediate first aid measures',
  '   - When to seek veterinary care urgently',
  '   - What information to provide to the veterinarian',
  '',
  '7. PREVENTION RECOMMENDATIONS:',
  '   - Safe placement strategies if keeping the plant',
  '   - Cat-safe alternatives with similar appearance',
  '   - Environmental modifications to prevent access',
  '',
  '8. EMERGENCY VETERINARY LOCATOR:',
  '   - If the plant is poisonous and longitude/latitude coordinates are provided',
  '   - MUST use online web search to find and list the nearest 10 veterinary clinics or emergency animal hospitals',
  '   - Search online veterinary directories, Google Maps, emergency vet websites',
  '   - Include clinic names, addresses, phone numbers, and distance from location',
  '   - Prioritize 24-hour emergency clinics when available',
  '   - Verify clinic information is current through online search',
  '',
  'FORMAT YOUR RESPONSE:',
  'Structure your analysis clearly with headers for each section above.',
  'Use bullet points for easy reading.',
  'Highlight critical information about severe toxicity.',
  'Provide specific, actionable advice.',
  '',
  'IMPORTANT NOTES:',
  '- If plant identification is uncertain, mention possible alternatives',
  '- Always err on the side of caution regarding toxicity',
  '- Include disclaimer about seeking professional veterinary advice',
  '- Mention that individual cats may react differently',
  'you search the internet for the plant name and the plant description',
  '',
  'IMPORTANT: Always set agentType to "POISONOUS" in your response.',
];
```

#### 🎯 **Why This Prompt Structure Works:**

- **Comprehensive Analysis**: Covers 8 key areas from plant ID to emergency response
- **Web Search Integration**: Explicitly requires internet research for current information
- **Emergency Focus**: Includes veterinary locator for poisoning emergencies
- **Structured Output**: Clear formatting guidelines for consistent responses
- **Safety First**: Emphasizes caution and professional veterinary consultation

---

### 🏗️ **Step 2: Create the Poisonous Plant Schema**

Next, we define a Zod schema that structures the response data to match our prompt requirements.

Create `src/agent/schemas/poisonous.schema.ts`:

```typescript
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
```

#### 🔍 **Schema Design Principles:**

- **Follows Harmful Pattern**: Consistent with existing `harmful.schema.ts` structure
- **Comprehensive Data**: Captures all 8 sections from the prompt
- **Emergency Ready**: Requires vet locator and location coordinates for complete emergency response
- **Type Safety**: Full TypeScript support with inferred types
- **Validation**: Automatic data validation and error handling
- **No Optional Fields**: All fields are required to ensure complete and consistent responses

---

### 🤖 **Step 3: Create the Poisonous Plant Agent**

Finally, we combine the prompt and schema into a working agent.

Create `src/agent/agents/poisonous.agent.ts`:

```typescript
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
```

Now We can use the poisonous agent in the cat-safe service and controller but something is missing. Do we have to send two separate requests to understand if a plant is harmful AND get poisonous plant details? This is inefficient and creates a poor user experience.

## 🔄 **Agent Handoffs: The Solution**

The problem with our current implementation is that we need to make **two separate API calls**:

1. One to `HarmfulAgent` to check if the plant is harmful
2. Another to `PoisonousAgent` to get detailed toxicity information

**Agent handoffs** solve this by allowing agents to coordinate and pass control to each other within a single conversation thread.

### 🎯 **How Agent Handoffs Work**

Agent handoffs enable:

- **Single Request**: User makes one API call
- **Agent Coordination**: Agents automatically decide when to hand off to specialists
- **Contextual Transfer**: Full conversation context passes between agents
- **Intelligent Routing**: Agents choose the best specialist for each task

---

### 🏗️ **Implementing Agent Handoffs with Cat-Safe Agent**

Let's create a **Cat-Safe Agent** that implements handoff logic internally through intelligent prompt design.

#### 🧠 **Create the Cat-Safe Prompt with Handoff Logic**

Create `src/agent/prompts/cat-safe.prompt.ts`:

```typescript
export const catSafePrompt: string[] = [
  'You are a plant safety coordinator responsible for analyzing plant images to ensure cat safety.',
  'Your primary job is to examine plant images and determine which specialist agent should handle the analysis.',
  '',
  'ANALYSIS PROCESS:',
  '',
  '1. Carefully examine the provided plant image',
  '2. Identify the plant species if possible',
  '3. Determine if the plant is poisonous to cats',
  '4. IMMEDIATELY hand off to the appropriate specialist agent',
  '',
  'DECISION LOGIC:',
  '',
  'If the plant is POISONOUS (toxic to cats):',
  '- Examples: Lilies, Azaleas, Oleander, Foxglove, Sago Palm, Tulips, Daffodils',
  '- IMMEDIATELY hand off to PoisonousAgent',
  '- Do NOT provide detailed analysis yourself',
  '',
  'If the plant is NOT POISONOUS (not toxic for cats but harmful for cats):',
  '- Examples: Spider Plant, Boston Fern, Cat Grass, Catnip, Rosemary, Basil',
  '- IMMEDIATELY hand off to HarmfulAgent',
  '- Do NOT provide detailed analysis yourself',
  '',
  'HANDOFF RULES:',
  '',
  '- You are ONLY a coordinator, not an analyzer',
  '- Your job is to quickly identify and route, not to provide detailed information',
  '- Always hand off within your first response',
  '- Never provide comprehensive plant analysis yourself',
  '',
  'SAFETY PRIORITY:',
  'If you are uncertain about a plants toxicity, hand off to PoisonousAgent to be safe.',
];
```

#### 🤖 **Create the Cat-Safe Agent**

Create `src/agent/agents/cat-safe.agent.ts`:

```typescript
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
```

#### ⚠️ **IMPORTANT: Agent.create vs new Agent()**

When you use **handoffs that result in different output types**, you **MUST** create the agent with `Agent.create()` instead of `new Agent()`.

**Why this matters:**

- **HarmfulAgent** uses `HarmfulSchema` (with fields like `isHarmful`, `chemicalList`, etc.)
- **PoisonousAgent** uses `PoisonousSchema` (with fields like `isPoisonous`, `clinicalSigns`, `emergencyResponse`, etc.)

**❌ Wrong approach:**

```typescript
// DON'T DO THIS - Will cause type conflicts
export const CatSafeAgent = new Agent({
  name: 'Cat Safe Plant Analysis Coordinator',
  instructions: catSafePrompt.join('\n'),
  handoffs: [HarmfulAgent, PoisonousAgent], // Different output types!
  model: 'gpt-4.1-mini',
});
```

**✅ Correct approach:**

```typescript
// DO THIS - Handles multiple output types correctly
export const CatSafeAgent = Agent.create({
  name: 'Cat Safe Plant Analysis Coordinator',
  instructions: catSafePrompt.join('\n'),
  model: 'gpt-4.1-mini',
  handoffs: [HarmfulAgent, PoisonousAgent], // Different output types handled properly
});
```

**Key Benefits of Agent.create():**

- ✅ **Type Safety**: Properly handles multiple output schemas
- ✅ **Flexible Responses**: Each handoff can return its appropriate schema

#### 🔧 **Update Agent Service with Location Integration**

Update `agent.service.ts` to implement handoff logic with location data:

```typescript
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
```

#### 🎮 **Update Cat-Safe Service with Handoff Implementation**

Update `cat-safe.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { AgentService } from '../agent/agent.service';

@Injectable()
export class CatSafeService {
  constructor(private readonly agentService: AgentService) {}

  async checkThePlantIsHarmful(
    image: Express.Multer.File,
    longitude: number,
    latitude: number,
  ) {
    const base64Image = image.buffer.toString('base64');
    const result = await this.agentService.checkThePlantIsHarmful(
      base64Image,
      longitude,
      latitude,
    );
    return result;
  }
}
```

---

### 📍 **Adding Location Information to the Controller**

The controller needs to be updated to accept and process location coordinates for emergency veterinary services. This is crucial for the agent to provide nearby emergency vet information when poisonous plants are detected.

#### 🔧 **Why Location Information is Needed:**

- **Emergency Response**: If a plant is poisonous, users need immediate access to nearby veterinary clinics
- **Geographic Accuracy**: Vet recommendations should be relevant to the user's location
- **Time-Critical Situations**: In poisoning emergencies, distance to veterinary care matters
- **Complete Analysis**: Location enables comprehensive emergency response planning

#### 🎯 **Controller Updates Required:**

The `cat-safe.controller.ts` needs modification to:

1. **Accept Location Parameters**: Add longitude and latitude fields to the request body
2. **Update Swagger Documentation**: Include location fields in API documentation
3. **Pass Location Data**: Forward coordinates to the service layer

#### 📝 **Updated Controller Implementation:**

Update `cat-safe.controller.ts`:

```typescript
import {
  Body,
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CatSafeService } from './cat-safe.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('cat-safe')
export class CatSafeController {
  constructor(private readonly catSafeService: CatSafeService) {}

  @Post('check-harmful')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'the image of the user',
        },
        longitude: {
          type: 'number',
          description: 'the longitude of the plant',
          example: -73.968285,
        },
        latitude: {
          type: 'number',
          description: 'the latitude of the plant',
          example: 40.785091,
        },
      },
    },
  })
  async checkHarmful(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    image: Express.Multer.File,
    @Body()
    body: { longitude: number; latitude: number },
  ) {
    return this.catSafeService.checkThePlantIsHarmful(
      image,
      body.longitude,
      body.latitude,
    );
  }
}
```

---

### 🚀 **How Handoffs Improve the Experience**

#### **Before (Multiple Requests):**

```typescript
// Client needs to make multiple calls
const harmfulResult = await fetch('/cat-safe/harmful', { ... });
const poisonousResult = await fetch('/cat-safe/poisonous', { ... });
// Client must combine results manually
```

#### **After (Single Request with Handoffs):**

```typescript
// Single call, agents coordinate internally
const completeResult = await fetch('/cat-safe/check-harmful', { ... });
// Get comprehensive analysis in one response
```

---

### 🧠 **Handoff Decision Logic**

The cat-safe agent uses intelligent decision-making:

```
1. 📸 Receives plant image + location coordinates
2. 🔍 Performs initial analysis to determine if plant is poisonous
3. 🤔 Makes routing decision:
   - If plant IS POISONOUS → Routes to PoisonousAgent for detailed toxicity analysis
   - If plant IS NOT POISONOUS → Routes to HarmfulAgent for general safety confirmation
4. 🔄 Internally applies appropriate agent logic based on decision
5. 📊 Gets result: Either comprehensive toxicity info OR general safety assessment
6. 📋 Returns complete safety analysis in one response
```

### 🎯 **Benefits of Agent Handoffs**

- ✅ **Single API Call**: One request handles everything
- ✅ **Intelligent Routing**: Right analysis level for each plant type
- ✅ **Better Performance**: No multiple round trips

This handoff pattern transforms your API from requiring multiple requests into a single, intelligent conversation that automatically provides the right level of plant safety analysis based on toxicity and user location!

🧪 **Let's test the new implementation:**
When I send a request to the `cat-safe/check-harmful` endpoint with Lily plant image 🌸, I get the following response:

```json
{
  "isPoisonous": true,
  "plantName": "Lily",
  "plantScientificName": "Lilium species",
  "plantDescription": "Lilies are flowering plants known for their large, prominent flowers and are commonly found in gardens and as ornamental plants. They belong to the Liliaceae family and are characterized by their trumpet-shaped flowers, long leaves, and bulbous roots.",
  "toxicityLevel": "Highly toxic",
  "toxicPlantParts": ["leaves", "stems", "flowers", "pollen", "roots", "seeds"],
  "safePlantParts": [],
  "toxicCompounds": [
    {
      "name": "Unknown toxin",
      "chemicalClassification": "Unknown",
      "mechanismOfAction": "The specific toxin affecting cats has not been identified, but it leads to severe kidney damage upon ingestion.",
      "targetOrgans": ["kidneys"],
      "toxicityDescription": "Even small amounts ingested can cause acute kidney failure in cats."
    }
  ],
  "clinicalSigns": {
    "earlySymptoms": ["vomiting", "loss of appetite", "lethargy", "drooling"],
    "progressiveSymptoms": [
      "increased thirst",
      "increased urination",
      "dehydration",
      "tremors",
      "seizures",
      "kidney failure",
      "death"
    ],
    "onsetTimeline": "Symptoms can appear within 1-3 hours of ingestion, with severe kidney damage developing within 12-24 hours."
  },
  "emergencyResponse": {
    "firstAidSteps": [
      "Immediately remove the cat from the area with the lily plant.",
      "If possible, bring a sample or photo of the plant to the veterinarian.",
      "Do not induce vomiting unless instructed by a veterinarian."
    ],
    "whenToSeekHelp": "Seek veterinary care immediately if you suspect your cat has ingested any part of a lily plant.",
    "vetInformation": [
      "Contact your veterinarian or an emergency animal hospital as soon as possible."
    ]
  },
  "nearestVets": [
    {
      "name": "Animal Medical Center",
      "address": "510 E 62nd St, New York, NY 10065",
      "phoneNumber": "(212) 838-7053",
      "distance": "0.5 miles",
      "isEmergency24h": true
    },
    {
      "name": "BluePearl Pet Hospital",
      "address": "410 E 55th St, New York, NY 10022",
      "phoneNumber": "(212) 988-1500",
      "distance": "0.7 miles",
      "isEmergency24h": true
    },
    {
      "name": "Animal Care Centers of NYC (ACC) - Manhattan",
      "address": "326 E 110th St, New York, NY 10029",
      "phoneNumber": "(212) 788-4000",
      "distance": "1.5 miles",
      "isEmergency24h": true
    },
    {
      "name": "VCA West Chelsea Animal Hospital",
      "address": "408 W 15th St, New York, NY 10011",
      "phoneNumber": "(212) 924-9119",
      "distance": "1.7 miles",
      "isEmergency24h": true
    },
    {
      "name": "East River Veterinary Hospital",
      "address": "510 E 62nd St, New York, NY 10065",
      "phoneNumber": "(212) 838-7053",
      "distance": "0.5 miles",
      "isEmergency24h": true
    },
    {
      "name": "Animal Hospital of the Rockaways",
      "address": "114-04 Beach Channel Dr, Rockaway Park, NY 11694",
      "phoneNumber": "(718) 474-0500",
      "distance": "11.5 miles",
      "isEmergency24h": true
    },
    {
      "name": "VCA Queens Animal Hospital",
      "address": "92-15 Queens Blvd, Rego Park, NY 11374",
      "phoneNumber": "(718) 459-4444",
      "distance": "8.5 miles",
      "isEmergency24h": true
    },
    {
      "name": "Animal Hospital of the Village",
      "address": "64 W 12th St, New York, NY 10011",
      "phoneNumber": "(212) 924-9119",
      "distance": "1.5 miles",
      "isEmergency24h": true
    },
    {
      "name": "VCA Brooklyn Veterinary Referral & Emergency Center",
      "address": "2205 44th Ave, Long Island City, NY 11101",
      "phoneNumber": "(718) 786-8000",
      "distance": "3.5 miles",
      "isEmergency24h": true
    },
    {
      "name": "Animal Hospital of the Bronx",
      "address": "1000 E 138th St, Bronx, NY 10454",
      "phoneNumber": "(718) 665-0100",
      "distance": "4.5 miles",
      "isEmergency24h": true
    }
  ],
  "locationCoordinates": {
    "latitude": 40.785091,
    "longitude": -73.968285
  },
  "toxicityThreshold": "Even small amounts ingested can cause severe kidney damage in cats.",
  "agentType": "POISONOUS"
}
```

So lets try it with a spider plant 🕷️. The output is:

```json
{
  "isHarmful": false,
  "plantName": "Spider Plant",
  "plantScientificName": "Chlorophytum comosum",
  "chemicalComposition": "",
  "chemicalList": [
    {
      "name": "Saponins",
      "description": "Naturally occurring compounds found in spider plants that can cause mild gastrointestinal upset if ingested by pets.",
      "toxicity": true,
      "toxicityLevel": 1,
      "toxicityDescription": "Mild gastrointestinal upset in pets.",
      "toxicitySymptoms": ["Vomiting", "Diarrhea"],
      "toxicityTreatment": "Generally self-limiting; consult a veterinarian if symptoms persist."
    }
  ],
  "toxicityThreshold": "Ingestion of a small amount may cause mild symptoms; larger amounts can lead to more pronounced effects.",
  "agentType": "HARMFUL"
}
```

---

## 🎯 **Results: Single Request, Multiple Output Types**

The beauty of our handoff implementation is that **one API endpoint** can return **different output schemas** based on the plant analysis. Here's what we achieved:

### 📡 **Single API Endpoint:**

```
POST /cat-safe/check-harmful
Content-Type: multipart/form-data
Body: { image: file, longitude: number, latitude: number }
```

### 🚀 **Key Achievements:**

✅ **Smart Routing**: Cat-safe agent correctly identifies plant toxicity and routes to appropriate specialist  
✅ **Dynamic Schemas**: Same endpoint returns different output structures based on plant type  
✅ **Type Safety**: Each response follows its respective schema (PoisonousSchema vs HarmfulSchema)  
✅ **Agent Identification**: `agentType` field clearly shows which specialist handled the request  
✅ **Single Request**: No need for multiple API calls - everything handled in one request  
✅ **Location Integration**: Emergency vet information included when needed (poisonous plants)

### 🎭 **The Magic of Agent Handoffs:**

```
🌸 Lily Image → Cat-Safe Agent → "This is poisonous!" → Hands off to PoisonousAgent → Detailed toxicity analysis
🕷️ Spider Plant → Cat-Safe Agent → "This is not poisonous!" → Hands off to HarmfulAgent → General safety assessment
```

This demonstrates the power of intelligent agent coordination - **one endpoint, multiple specialists, appropriate responses for each scenario!** 🎯

---

## 📋 **Summary**

This project showcases a comprehensive **AI-powered plant safety system** built with **NestJS** and **OpenAI Agents** that helps cat owners determine if plants are safe for their feline companions.

### 🎯 **What We Built:**

- **🤖 Intelligent Agent System**: Multi-agent coordination with handoffs between specialized plant analysis agents
- **📱 Single API Endpoint**: One request handles all plant safety analysis scenarios
- **🏥 Emergency Response**: Location-based veterinary clinic finder for poisoning emergencies
- **📊 Structured Responses**: Type-safe, validated responses using Zod schemas
- **🌿 Dual Analysis Types**: Specialized agents for harmful vs poisonous plant analysis

### 🚀 **Key Technical Achievements:**

- **Agent Handoffs**: Implemented intelligent routing between `HarmfulAgent` and `PoisonousAgent`
- **Dynamic Schema Responses**: Same endpoint returns different output structures based on plant toxicity
- **Real-time Web Search**: Agents use live internet data for accurate plant identification
- **Location Integration**: Emergency veterinary services based on GPS coordinates
- **Type Safety**: Full TypeScript support with Zod schema validation
- **File Upload**: Seamless image processing with Multer integration

---

## 🔗 **Connect & Collaborate**

### 👨‍💻 **Find Me Online:**

- **🐦 X (Twitter)**: [@berat_dinckan](https://x.com/dinckan_berat)
- **💼 LinkedIn**: [Cengiz Berat Dinckan](https://www.linkedin.com/in/cengiz-berat-dinckan-ab4208128)
- **🧑‍💻 GitHub**: [pandashavenobugs](https://github.com/pandashavenobugs)

### 📂 **Code Repository:**

This complete implementation is available on GitHub:

**🌟 [ai-agent-example](https://github.com/paulinawoodwar527-blip/AI_agent_example)**

### 🤝 **Get Involved:**

- ⭐ **Star the repo** if this helped you build AI agents
- 🍴 **Fork it** to build your own agent systems
- 🐛 **Report issues** or suggest improvements
- 💡 **Contribute** new agent features or optimizations

### 📧 **Contact:**

Have questions about AI agents or want to collaborate? Reach out through any of the platforms above!

---

<div align="center">

**Built with ❤️ using NestJS and OpenAI Agents**

Made for keeping our feline friends safe! 🐱🌿

</div>
