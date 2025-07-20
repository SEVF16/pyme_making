import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ProductSkuValueObject } from '../../domain/value-object/product-sku.value-object';


@Injectable()
export class ProductValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Validar SKU en parámetros de ruta
    if (req.params.sku) {
      try {
        ProductSkuValueObject.create(req.params.sku);
      } catch (error) {
        throw new BadRequestException(`SKU inválido en parámetro: ${req.params.sku}`);
      }
    }

    // Validar SKU en el body para operaciones POST/PUT
    if (req.body && req.body.sku && (req.method === 'POST' || req.method === 'PUT')) {
      try {
        ProductSkuValueObject.create(req.body.sku);
      } catch (error) {
        throw new BadRequestException(`SKU inválido en el cuerpo de la petición: ${req.body.sku}`);
      }
    }

    // Validar precios
    if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
      if (req.body.price !== undefined && req.body.price < 0) {
        throw new BadRequestException('El precio no puede ser negativo');
      }

      if (req.body.costPrice !== undefined && req.body.costPrice < 0) {
        throw new BadRequestException('El precio de costo no puede ser negativo');
      }

      if (req.body.price !== undefined && req.body.costPrice !== undefined && 
          req.body.costPrice > req.body.price) {
        throw new BadRequestException('El precio de costo no puede ser mayor al precio de venta');
      }
    }

    next();
  }
}