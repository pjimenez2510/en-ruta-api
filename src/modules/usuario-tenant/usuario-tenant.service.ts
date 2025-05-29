import { Injectable } from '@nestjs/common';
import { CreateUsuarioTenantDto } from './dto/create-usuario-tenant.dto';
import { UpdateUsuarioTenantDto } from './dto/update-usuario-tenant.dto';

@Injectable()
export class UsuarioTenantService {
  create(createUsuarioTenantDto: CreateUsuarioTenantDto) {
    return 'This action adds a new usuarioTenant';
  }

  findAll() {
    return `This action returns all usuarioTenant`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usuarioTenant`;
  }

  update(id: number, updateUsuarioTenantDto: UpdateUsuarioTenantDto) {
    return `This action updates a #${id} usuarioTenant`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuarioTenant`;
  }
}
