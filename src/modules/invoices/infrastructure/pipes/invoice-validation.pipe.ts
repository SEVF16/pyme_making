import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { CreateInvoiceDto } from '../../application/dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../../application/dto/update-invoice.dto';
import { InvoiceNumberValueObject } from '../../domain/value-objects/invoice-number.value-object';
import { InvoiceTypeValueObject } from '../../domain/value-objects/invoice-type.value-object';
import { InvoiceStatusValueObject } from '../../domain/value-objects/invoice-status.value-object';

@Injectable()
export class InvoiceValidationPipe implements PipeTransform {
  transform(value: CreateInvoiceDto | UpdateInvoiceDto, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    // Validar número de factura si está presente
    if (value.invoiceNumber) {
      try {
        InvoiceNumberValueObject.create(value.invoiceNumber);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }

    // Validar tipo de factura si está presente
    if ('type' in value && value.type) {
      try {
        InvoiceTypeValueObject.create(value.type);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }

    // Validar estado si está presente
    if ('status' in value && value.status) {
      try {
        InvoiceStatusValueObject.create(value.status);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }

    // Validaciones adicionales para creación
    if (value instanceof CreateInvoiceDto) {
      if (!value.items || value.items.length === 0) {
        throw new BadRequestException('La factura debe tener al menos un ítem');
      }

      // Validar cada ítem
      value.items.forEach((item, index) => {
        if (!item.name || item.name.trim().length === 0) {
          throw new BadRequestException(`El ítem ${index + 1} debe tener un nombre`);
        }

        if (item.quantity <= 0) {
          throw new BadRequestException(`El ítem ${index + 1} debe tener una cantidad mayor a 0`);
        }

        if (item.unitPrice < 0) {
          throw new BadRequestException(`El ítem ${index + 1} no puede tener precio negativo`);
        }
      });
    }

    return value;
  }
}
