import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignTenantDto } from './dto/assign-tenant.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RolUsuario, TipoUsuario } from '../../common/enums/user.enum';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Verificar si ya existe un usuario con el mismo email
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    // Verificar cédula única si se proporciona
    if (createUserDto.cedula) {
      const existingCedula = await this.prisma.usuario.findUnique({
        where: { cedula: createUserDto.cedula },
      });

      if (existingCedula) {
        throw new BadRequestException('La cédula ya está registrada');
      }
    }

    // Hacer hash de la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Crear el usuario
    return this.prisma.usuario.create({
      data: {
        email: createUserDto.email,
        passwordHash: hashedPassword,
        cedula: createUserDto.cedula,
        nombres: createUserDto.nombres,
        apellidos: createUserDto.apellidos,
        fechaNacimiento: createUserDto.fechaNacimiento,
        telefono: createUserDto.telefono,
        esDiscapacitado: createUserDto.esDiscapacitado || false,
        porcentajeDiscapacidad: createUserDto.porcentajeDiscapacidad,
        tipoUsuario: createUserDto.tipoUsuario || TipoUsuario.CLIENTE,
        fechaRegistro: new Date(),
        activo: true,
      },
      select: {
        id: true,
        email: true,
        cedula: true,
        nombres: true,
        apellidos: true,
        fechaNacimiento: true,
        telefono: true,
        esDiscapacitado: true,
        porcentajeDiscapacidad: true,
        tipoUsuario: true,
        fechaRegistro: true,
        activo: true,
        // Excluimos la contraseña hash de la respuesta
        passwordHash: false,
      },
    });
  }

  async findAll(query?: { active?: boolean; type?: TipoUsuario }) {
    const where = {};

    if (query?.active !== undefined) {
      where['activo'] = query.active;
    }

    if (query?.type) {
      where['tipoUsuario'] = query.type;
    }

    return this.prisma.usuario.findMany({
      where,
      select: {
        id: true,
        email: true,
        cedula: true,
        nombres: true,
        apellidos: true,
        fechaNacimiento: true,
        telefono: true,
        esDiscapacitado: true,
        porcentajeDiscapacidad: true,
        tipoUsuario: true,
        fechaRegistro: true,
        ultimoAcceso: true,
        activo: true,
        // Incluir los tenants a los que pertenece el usuario
        tenants: {
          select: {
            id: true,
            rol: true,
            tenant: {
              select: {
                id: true,
                nombre: true,
                identificador: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        cedula: true,
        nombres: true,
        apellidos: true,
        fechaNacimiento: true,
        telefono: true,
        esDiscapacitado: true,
        porcentajeDiscapacidad: true,
        tipoUsuario: true,
        fechaRegistro: true,
        ultimoAcceso: true,
        activo: true,
        tenants: {
          select: {
            id: true,
            rol: true,
            tenant: {
              select: {
                id: true,
                nombre: true,
                identificador: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        tenants: {
          include: {
            tenant: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Verificar si existe el usuario
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Verificar la unicidad del email si se está actualizando
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.usuario.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new BadRequestException(
          'El correo electrónico ya está registrado',
        );
      }
    }

    // Verificar la unicidad de la cédula si se está actualizando
    if (updateUserDto.cedula && updateUserDto.cedula !== user.cedula) {
      const existingCedula = await this.prisma.usuario.findUnique({
        where: { cedula: updateUserDto.cedula },
      });

      if (existingCedula) {
        throw new BadRequestException('La cédula ya está registrada');
      }
    }

    // Preparar datos para actualización
    const updateData: any = { ...updateUserDto };

    // Si hay cambio de password, hashear la nueva
    if (updateUserDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete updateData.password; // Eliminar el password del objeto de actualización
    }

    // Actualizar el usuario
    return this.prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        cedula: true,
        nombres: true,
        apellidos: true,
        fechaNacimiento: true,
        telefono: true,
        esDiscapacitado: true,
        porcentajeDiscapacidad: true,
        tipoUsuario: true,
        fechaRegistro: true,
        ultimoAcceso: true,
        activo: true,
      },
    });
  }

  async remove(id: number) {
    // Verificar si existe el usuario
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // En lugar de eliminar el usuario, lo marcamos como inactivo
    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: {
        id: true,
        email: true,
        activo: true,
      },
    });
  }

  async assignToTenant(userId: number, assignTenantDto: AssignTenantDto) {
    // Verificar si existe el usuario
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Verificar si existe el tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: assignTenantDto.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(
        `Tenant con ID ${assignTenantDto.tenantId} no encontrado`,
      );
    }

    // Verificar si ya existe la asignación con el mismo rol
    const existingAssignment = await this.prisma.usuarioTenant.findFirst({
      where: {
        usuarioId: userId,
        tenantId: assignTenantDto.tenantId,
        rol: assignTenantDto.rol,
      },
    });

    if (existingAssignment) {
      throw new BadRequestException(
        `El usuario ya está asignado a este tenant con el rol ${assignTenantDto.rol}`,
      );
    }

    // Crear la asignación
    return this.prisma.usuarioTenant.create({
      data: {
        usuarioId: userId,
        tenantId: assignTenantDto.tenantId,
        rol: assignTenantDto.rol,
        fechaAsignacion: new Date(),
        activo: true,
      },
      include: {
        tenant: {
          select: {
            nombre: true,
            identificador: true,
          },
        },
      },
    });
  }

  async removeFromTenant(userId: number, tenantId: number, rol: RolUsuario) {
    // Verificar si existe la asignación
    const assignment = await this.prisma.usuarioTenant.findFirst({
      where: {
        usuarioId: userId,
        tenantId: tenantId,
        rol: rol,
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Asignación no encontrada para el usuario ${userId} en el tenant ${tenantId} con rol ${rol}`,
      );
    }

    // Marcar como inactivo en lugar de eliminar
    return this.prisma.usuarioTenant.update({
      where: { id: assignment.id },
      data: { activo: false },
      include: {
        tenant: {
          select: {
            nombre: true,
          },
        },
      },
    });
  }

  async updateLastAccess(userId: number) {
    return this.prisma.usuario.update({
      where: { id: userId },
      data: { ultimoAcceso: new Date() },
    });
  }
}
