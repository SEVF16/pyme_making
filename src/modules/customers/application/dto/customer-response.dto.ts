import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ 
    description: 'ID único del cliente',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
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
    description: 'Dirección del cliente',
    example: 'Av. Providencia 1234'
  })
  address: string;

  @ApiProperty({ 
    description: 'Ciudad del cliente',
    example: 'Santiago'
  })
  city: string;

  @ApiProperty({ 
    description: 'Región del cliente',
    example: 'Región Metropolitana'
  })
  region: string;

  @ApiProperty({ 
    description: 'Código postal',
    example: '7500000'
  })
  postalCode: string;

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

  @ApiProperty({ 
    description: 'ID de la empresa a la que pertenece',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  companyId: string;

  @ApiProperty({ 
    description: 'Fecha de nacimiento del cliente',
    example: '1990-05-15T00:00:00Z',
    required: false
  })
  birthDate?: Date;

  @ApiProperty({ 
    description: 'Sitio web del cliente (para empresas)',
    example: 'https://www.example.com',
    required: false
  })
  website?: string;

  @ApiProperty({ 
    description: 'Información adicional del cliente',
    example: { notes: 'Cliente VIP', preferences: ['email'] },
    required: false
  })
  additionalInfo?: Record<string, any>;

  @ApiProperty({ 
    description: 'Fecha de creación',
    example: '2023-01-15T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Fecha de última actualización',
    example: '2023-01-15T10:30:00Z'
  })
  updatedAt: Date;
}