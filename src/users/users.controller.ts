import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Rol } from '@prisma/client';

@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.usersService.create(createUserDto);
    return { statusCode: HttpStatus.CREATED, message: 'Usuario creado', data };
  }

  @Get()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  async findAll() {
    const data = await this.usersService.findAll();
    return { statusCode: HttpStatus.OK, message: 'Usuarios listados', data };
  }

  @Get(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id);
    return { statusCode: HttpStatus.OK, message: 'Usuario obtenido', data };
  }

  @Patch(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const data = await this.usersService.update(id, updateUserDto);
    return { statusCode: HttpStatus.OK, message: 'Usuario actualizado', data };
  }

  @Delete(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  async remove(@Param('id') id: string) {
    const data = await this.usersService.remove(id);
    return { statusCode: HttpStatus.OK, message: 'Usuario desactivado', data };
  }
}
