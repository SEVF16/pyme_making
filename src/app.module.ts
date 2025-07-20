import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { SharedModule } from './shared/shared.module';
import { ProductsModule } from './modules/product/product.module';
import { InvoicesModule } from './modules/invoices/invoices.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    SharedModule,
    CompaniesModule,
    UsersModule,
    CustomersModule,
    ProductsModule,
    InvoicesModule,
    // Aquí irán tus módulos de dominio
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
