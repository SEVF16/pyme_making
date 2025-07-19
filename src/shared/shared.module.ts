import { Module, Global } from '@nestjs/common';
import { TokenService } from './application/services/token.service';
import { PaginationService } from './application/services/pagination.service';
import { TenantGuard } from './infrastructure/guards/tenant.guard';
import { ResponseInterceptor } from './infrastructure/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './infrastructure/filters/global-exception.filter';


@Global()
@Module({
  providers: [
    TokenService,
    PaginationService,
    TenantGuard,
    ResponseInterceptor,
    GlobalExceptionFilter,
  ],
  exports: [
    TokenService,
    PaginationService,
    TenantGuard,
    ResponseInterceptor,
    GlobalExceptionFilter,
  ],
})
export class SharedModule {}