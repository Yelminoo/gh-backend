import { UsePipes } from '@nestjs/common';
import { SanitizePipe } from '../pipes/sanitize.pipe';

export function Sanitize() {
  return UsePipes(new SanitizePipe());
}
