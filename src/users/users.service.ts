import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // Excluir `password` del spread — Prisma solo conoce `passwordHash`
    const { password: _pw, ...rest } = createUserDto;

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        passwordHash: hashedPassword,
      }
    });

    const { passwordHash, ...result } = user;
    return result;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        activo: true,
        telefono: true,
        lastLoginAt: true,
        createdAt: true,
      }
    });
    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        activo: true,
        telefono: true,
        lastLoginAt: true,
        createdAt: true,
      }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email }
      });
      if (existingEmail) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
    }

    // Si viene nuevo password, hashearlo; si no, solo actualizar los otros campos
    const { password: newPassword, ...restDto } = updateUserDto as any;
    const dataToUpdate: Record<string, unknown> = { ...restDto };

    if (newPassword) {
      dataToUpdate.passwordHash = await bcrypt.hash(newPassword, await bcrypt.genSalt());
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        activo: true,
        telefono: true,
        lastLoginAt: true,
        createdAt: true,
      }
    });

    return updatedUser;
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const passwordHash = await bcrypt.hash(dto.newPassword, await bcrypt.genSalt());
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Soft delete o desactivación
    return this.prisma.user.update({
      where: { id },
      data: { activo: false },
      select: { id: true, activo: true }
    });
  }
}
