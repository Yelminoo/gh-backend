import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
// import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import {
  LoggingInterceptor,
  TransformInterceptor,
} from './common/interceptors/logging.interceptor';
import { CategoriesModule } from './categories/categories.module';
import { WarehousesModule } from './warehouses/warehouses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ← Makes ConfigService available everywhere
    }),
    AuthModule,
    ProductsModule,
    CategoriesModule,
    WarehousesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 🌍 Global Guard (with DI support)
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,  // ← Uncomment to protect ALL routes
    // },
    // 🌍 Global Interceptors (with DI support)
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor, // ← Logs all requests/responses
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor, // ← Transforms all responses
    },
  ],
})
export class AppModule implements NestModule {
  // 🌍 Global Middleware (with DI support)
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Apply to all routes
  }
}
