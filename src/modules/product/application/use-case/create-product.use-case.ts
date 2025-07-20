import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CompanyRepositoryAbstract } from '../../../companies/domain/interfaces/company-repository.interface';
import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryAbstract } from '../../domain/interface/product-repository.interface';


@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryAbstract,
    private readonly companyRepository: CompanyRepositoryAbstract,
  ) {}

  async execute(createProductDto: CreateProductDto): Promise<Product> {
    // Validar que la empresa existe
    const company = await this.companyRepository.findById(createProductDto.companyId);
    if (!company) {
      throw new NotFoundException(`Empresa con ID ${createProductDto.companyId} no encontrada`);
    }

    // Verificar si el producto ya existe por SKU en la empresa
    const existingProduct = await this.productRepository.findBySkuAndCompany(
      createProductDto.sku, 
      createProductDto.companyId
    );
    
    if (existingProduct) {
      throw new ConflictException('Ya existe un producto con este SKU en la empresa');
    }

    // Crear producto
    const productData = {
      ...createProductDto,
      status: 'active' as const,
    };

    return await this.productRepository.create(productData);
  }
}