import { Injectable } from '@nestjs/common';
import { CreateConfiguracionesTenantDto } from './dto/create-configuraciones-tenant.dto';
import { UpdateConfiguracionesTenantDto } from './dto/update-configuraciones-tenant.dto';

@Injectable()
export class ConfiguracionesTenantService {
  create(createConfiguracionesTenantDto: CreateConfiguracionesTenantDto) {
    return 'This action adds a new configuracionesTenant';
  }

  findAll() {
    return `This action returns all configuracionesTenant`;
  }

  findOne(id: number) {
    return `This action returns a #${id} configuracionesTenant`;
  }

  update(id: number, updateConfiguracionesTenantDto: UpdateConfiguracionesTenantDto) {
    return `This action updates a #${id} configuracionesTenant`;
  }

  remove(id: number) {
    return `This action removes a #${id} configuracionesTenant`;
  }
}
