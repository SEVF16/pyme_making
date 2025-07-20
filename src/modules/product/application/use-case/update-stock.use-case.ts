import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateStockDto } from '../dto/update-stock.dto';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryAbstract } from '../../domain/interface/product-repository.interface';

@Injectable()
export class UpdateStockUseCase {
  constructor(private readonly productRepository: ProductRepositoryAbstract) {}

  async execute(id: string, updateStockDto: UpdateStockDto): Promise<Product> {
    const product = await this.productRepository.findById(id);
    
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    let newStock: number;

    switch (updateStockDto.movementType) {
      case 'in':
        newStock = product.stock + Math.abs(updateStockDto.quantity);
        break;
      case 'out':
        newStock = product.stock - Math.abs(updateStockDto.quantity);
        break;
      case 'adjustment':
        newStock = updateStockDto.quantity;
        break;
      default:
        throw new BadRequestException('Tipo de movimiento inválido');
    }

    // Validar stock negativo si no está permitido
    if (newStock < 0 && !product.allowNegativeStock) {
      throw new BadRequestException('Stock insuficiente para esta operación');
    }

    // Validar stock máximo si está definido
    if (product.maxStock && newStock > product.maxStock) {
      throw new BadRequestException(`Stock no puede exceder el máximo permitido (${product.maxStock})`);
    }

    return await this.productRepository.update(id, { stock: newStock });
  }
}