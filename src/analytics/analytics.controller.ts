import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('parcels/timeline')
  async getParcelsTimeline() {
    return this.analyticsService.getParcelsTimeline();
  }

  @Get('warehouses/timeline')
  async getWarehousesTimeline() {
    return this.analyticsService.getWarehousesTimeline();
  }
}
