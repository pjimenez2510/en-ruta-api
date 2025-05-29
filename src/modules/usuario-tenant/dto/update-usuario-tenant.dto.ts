import { PartialType } from '@nestjs/swagger';
import { CreateUsuarioTenantDto } from './create-usuario-tenant.dto';

export class UpdateUsuarioTenantDto extends PartialType(CreateUsuarioTenantDto) {}
