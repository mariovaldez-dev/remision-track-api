import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleVencimientosCron() {
    this.logger.debug('Ejecutando cron job de vencimientos...');
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const result = await this.prisma.notaDeRemision.updateMany({
      where: {
        estadoPago: { in: ['PENDIENTE', 'PARCIAL'] },
        fechaVencimiento: { lt: hoy }
      },
      data: {
        estadoPago: 'VENCIDO'
      }
    });

    this.logger.log(`Se actualizaron ${result.count} notas a estado VENCIDO.`);
  }
}
