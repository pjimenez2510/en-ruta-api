import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsuarioTenantService } from './usuario-tenant.service';
import { CreateUsuarioTenantDto } from './dto/create-usuario-tenant.dto';
import { UpdateUsuarioTenantDto } from './dto/update-usuario-tenant.dto';

@Controller('usuario-tenant')
export class UsuarioTenantController {
  constructor(private readonly usuarioTenantService: UsuarioTenantService) {}

  @Post()
  create(@Body() createUsuarioTenantDto: CreateUsuarioTenantDto) {
    return this.usuarioTenantService.create(createUsuarioTenantDto);
  }

  @Get()
  findAll() {
    return this.usuarioTenantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuarioTenantService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioTenantDto: UpdateUsuarioTenantDto) {
    return this.usuarioTenantService.update(+id, updateUsuarioTenantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuarioTenantService.remove(+id);
  }
}
