import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

// Entities
import { User } from './domain/entities/user.entity';

// Interfaces
import { UserRepositoryAbstract } from './domain/interfaces/user-repository.interface';

// Infrastructure
import { UserRepository } from './infrastructure/repositories/user.repository';

import { AuthMiddleware } from './infrastructure/middleware/auth.middleware';
import { UserValidationPipe } from './infrastructure/pipes/user-validation.pipe';

// Use Cases
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';



// Import Company module for dependencies
import { CompaniesModule } from '../companies/companies.module';
import jwtConfig from 'src/config/jwt.config';
import { UsersController } from './infrastructure/controllers/users.controller';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case';
import { RequestPasswordResetUseCase, ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { UserExceptionFilter } from './infrastructure/filters/user-exception.filter';
import { UsersService } from './application/services/users.service';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';



@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CompaniesModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    // Services
    UsersService,
    AuthService,
    // Use Cases
    CreateUserUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    ChangePasswordUseCase,
    VerifyEmailUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
    
    // Repository
    {
      provide: UserRepositoryAbstract,
      useClass: UserRepository,
    },

    // Global Providers
    {
      provide: APP_FILTER,
      useClass: UserExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: UserValidationPipe,
    },
  ],
  exports: [
    UsersService,
    AuthService,
    UserRepositoryAbstract,
    JwtModule,
  ],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
            .exclude(
        { path: 'users/bootstrap', method: RequestMethod.POST }, // Excluir bootstrap
      )
      .forRoutes('users');
  }
}