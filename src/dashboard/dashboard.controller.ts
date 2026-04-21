import { Controller, Get, UseGuards, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('api/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  async getMetrics() {
    const data = await this.dashboardService.getMetrics();
    return { statusCode: HttpStatus.OK, message: 'Métricas obtenidas', data };
  }
}
