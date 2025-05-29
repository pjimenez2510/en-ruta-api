import { PartialType } from '@nestjs/swagger';
import { CreateConfiguracionesTenantDto } from './create-configuraciones-tenant.dto';

export class UpdateConfiguracionesTenantDto extends PartialType(CreateConfiguracionesTenantDto) {}
