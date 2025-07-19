import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RutValueObject } from '../../../../shared/domain/value-objects/rut.value-object'; // *** USANDO SHARED ***

@Injectable()
export class CustomerValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Validar RUT en parámetros de ruta
    if (req.params.rut) {
      try {
        RutValueObject.create(req.params.rut);
      } catch (error) {
        throw new BadRequestException(`RUT inválido en parámetro: ${req.params.rut}`);
      }
    }

    // Validar RUT en el body para operaciones POST/PUT
    if (req.body && req.body.rut && (req.method === 'POST' || req.method === 'PUT')) {
      try {
        RutValueObject.create(req.body.rut);
      } catch (error) {
        throw new BadRequestException(`RUT inválido en el cuerpo de la petición: ${req.body.rut}`);
      }
    }

    next();
  }
}