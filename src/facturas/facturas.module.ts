import { Module } from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { FacturasController } from './facturas.controller';

@Module({
  providers: [FacturasService],
  controllers: [FacturasController]
})
export class FacturasModule {}
