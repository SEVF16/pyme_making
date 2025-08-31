import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

// Entities
import { Product } from './domain/entities/product.entity';
import { StockMovement } from './domain/entities/stock-movement.entity';
import { ProductCategory } from './domain/entities/product-category.entity';

// Interfaces
import { ProductRepositoryAbstract } from './domain/interface/product-repository.interface';

// Infrastructure
import { ProductRepository } from './infrastructure/repositories/product.repository';
import { ProductController } from './infrastructure/controllers/product.controller';
import { ProductExceptionFilter } from './infrastructure/filters/product-exception.filter';
import { ProductOwnershipGuard } from './infrastructure/guards/product-ownership.guard';
import { ProductResponseInterceptor } from './infrastructure/interceptors/product-response.interceptor';
import { ProductValidationMiddleware } from './infrastructure/middleware/product-validation.middleware';
import { ProductValidationPipe } from './infrastructure/pipes/product-validation.pipe';

// Use Cases
import { CreateProductUseCase } from './application/use-case/create-product.use-case';
import { GetProductUseCase } from './application/use-case/get-product.use-case';
import { UpdateProductUseCase } from './application/use-case/update-product.use-case';
import { UpdateStockUseCase } from './application/use-case/update-stock.use-case';
import { GetProductsUseCase } from './application/use-case/get-products.use-case';

// Services
import { ProductService } from './application/services/product.service';
import { ProductDomainService } from './domain/services/product-domain.service';

// Import Companies Module for dependencies
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, StockMovement, ProductCategory]),
    CompaniesModule, // Import companies module for repository dependency
  ],
  controllers: [ProductController],
  providers: [
    // Services
    ProductService,
    ProductDomainService,
    
    // Use Cases
    CreateProductUseCase,
    GetProductUseCase,
    UpdateProductUseCase,
    UpdateStockUseCase,
    GetProductsUseCase,
    
    // Repository
    {
      provide: ProductRepositoryAbstract,
      useClass: ProductRepository,
    },

    // Guards
    ProductOwnershipGuard,

    // Global Providers
    // {
    //   provide: APP_FILTER,
    //   useClass: ProductExceptionFilter,
    // },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: ProductResponseInterceptor,
    // },
    // {
    //   provide: APP_PIPE,
    //   useClass: ProductValidationPipe,
    // },
  ],
  exports: [
    ProductService,
    ProductDomainService,
    ProductRepositoryAbstract,
    ProductOwnershipGuard,
  ],
})
export class ProductsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ProductValidationMiddleware)
      .forRoutes('products');
  }
}