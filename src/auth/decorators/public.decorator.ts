import { SetMetadata } from '@nestjs/common';

// Decorator to skip authentication on public routes
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
