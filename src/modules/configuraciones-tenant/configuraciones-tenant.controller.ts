import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConfiguracionesTenantService } from './configuraciones-tenant.service';
import { CreateConfiguracionesTenantDto } from './dto/create-configuraciones-tenant.dto';
import { UpdateConfiguracionesTenantDto } from './dto/update-configuraciones-tenant.dto';

@Controller('configuraciones-tenant')
export class ConfiguracionesTenantController {
  constructor(private readonly configuracionesTenantService: ConfiguracionesTenantService) {}

  @Post()
  create(@Body() createConfiguracionesTenantDto: CreateConfiguracionesTenantDto) {
    return this.configuracionesTenantService.create(createConfiguracionesTenantDto);
  }

  @Get()
  findAll() {
    return this.configuracionesTenantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.configuracionesTenantService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConfiguracionesTenantDto: UpdateConfiguracionesTenantDto) {
    return this.configuracionesTenantService.update(+id, updateConfiguracionesTenantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.configuracionesTenantService.remove(+id);
  }
}
