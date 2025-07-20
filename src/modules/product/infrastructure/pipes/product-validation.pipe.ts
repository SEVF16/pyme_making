import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from '../../application/dto/create-product.dto';
import { UpdateProductDto } from '../../application/dto/update-product.dto';
import { ProductSkuValueObject } from '../../domain/value-object/product-sku.value-object';
import { ProductPriceValueObject } from '../../domain/value-object/product-price.value-object';


@Injectable()
export class ProductValidationPipe implements PipeTransform {
  transform(value: CreateProductDto | UpdateProductDto, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    // Validar SKU si está presente
    if (value.sku) {
      try {
        ProductSkuValueObject.create(value.sku);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }

    // Validar precios si están presentes
    if (value.price !== undefined) {
      try {
        ProductPriceValueObject.create(value.price, value.costPrice);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }

    // Validaciones adicionales para creación
    if (value instanceof CreateProductDto) {
      if (!value.name || value.name.trim().length === 0) {
        throw new BadRequestException('El nombre del producto es requerido');
      }

      if (!value.category || value.category.trim().length === 0) {
        throw new BadRequestException('La categoría del producto es requerida');
      }
    }

    return value;
  }
}