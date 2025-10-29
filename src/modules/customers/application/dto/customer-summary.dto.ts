import { BaseResponseDto } from '../../../../shared/application/dto/base-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerSummaryDto  {
  id: string;
  @ApiProperty({ 
    description: 'RUT del cliente',
    example: '12.345.678-9'
  })
  rut: string;

  @ApiProperty({ 
    description: 'Nombre del cliente',
    example: 'Juan'
  })
  firstName: string;

  @ApiProperty({ 
    description: 'Apellido del cliente',
    example: 'Pérez'
  })
  lastName: string;

  @ApiProperty({ 
    description: 'Email del cliente',
    example: 'juan.perez@email.com'
  })
  email: string;

  @ApiProperty({ 
    description: 'Teléfono del cliente',
    example: '+56912345678'
  })
  phone: string;

  @ApiProperty({ 
    description: 'Tipo de cliente',
    enum: ['individual', 'business'],
    example: 'individual'
  })
  customerType: string;

  @ApiProperty({ 
    description: 'Estado del cliente',
    enum: ['active', 'inactive', 'blocked'],
    example: 'active'
  })
  status: string;
}