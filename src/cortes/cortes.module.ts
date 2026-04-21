import { Module } from '@nestjs/common';
import { CortesService } from './cortes.service';
import { CortesController } from './cortes.controller';

@Module({
  providers: [CortesService],
  controllers: [CortesController]
})
export class CortesModule {}
