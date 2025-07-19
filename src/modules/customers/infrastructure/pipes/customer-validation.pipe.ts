import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { CreateCustomerDto } from '../../application/dto/create-customer.dto';
import { UpdateCustomerDto } from '../../application/dto/update-customer.dto';
import { RutValueObject } from '../../domain/value-objects/rut.value-object';
import { EmailValueObject } from '../../domain/value-objects/email.value-object';

@Injectable()
export class CustomerValidationPipe implements PipeTransform {
  transform(value: CreateCustomerDto | UpdateCustomerDto, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    // Validar RUT si está presente
    if (value.rut) {
      try {
        RutValueObject.create(value.rut);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }

    // Validar email si está presente
    if (value.email) {
      try {
        EmailValueObject.create(value.email);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }

    // Validaciones adicionales para creación
    if (value instanceof CreateCustomerDto) {
      if (value.customerType === 'individual' && !value.birthDate) {
        throw new BadRequestException('Fecha de nacimiento es requerida para clientes individuales');
      }
    }

    return value;
  }
}