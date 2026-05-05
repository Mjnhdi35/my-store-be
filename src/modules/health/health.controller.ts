import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  private startTime = Date.now();

  constructor() {}

  @Get()
  check() {
    const uptime = Date.now() - this.startTime;

    return {
      status: 'ok',
      uptime,
      timestamp: new Date().toISOString(),
    };
  }
}
