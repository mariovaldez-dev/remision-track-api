import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ClientesModule } from './clientes/clientes.module';
import { ProductosModule } from './productos/productos.module';
import { NotasModule } from './notas/notas.module';
import { PagosModule } from './pagos/pagos.module';
import { FacturasModule } from './facturas/facturas.module';
import { TasksModule } from './tasks/tasks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DashboardModule } from './dashboard/dashboard.module';
import { CortesModule } from './cortes/cortes.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule, 
    UsersModule, 
    PrismaModule, 
    ClientesModule, 
    ProductosModule, 
    NotasModule, 
    PagosModule, 
    FacturasModule, 
    TasksModule, DashboardModule, CortesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
