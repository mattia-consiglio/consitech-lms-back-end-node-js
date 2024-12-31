import { SetMetadata } from '@nestjs/common';

export const Capabilities = (...capabilities: string[]) =>
  SetMetadata('capabilities', capabilities);
