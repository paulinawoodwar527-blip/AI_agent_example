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
