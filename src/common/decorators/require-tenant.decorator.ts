import { SetMetadata } from '@nestjs/common';

export const RequireTenant = () => SetMetadata('require-tenant', true);
