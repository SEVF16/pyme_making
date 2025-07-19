import { BaseResponseDto } from '../../../../shared/application/dto/base-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CompanyResponseDto extends BaseResponseDto {
  @ApiProperty()
  rut: string;

  @ApiProperty()
  businessName: string;

  @ApiProperty()
  fantasyName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  region: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  companySize: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  logoUrl?: string;

  @ApiProperty({ required: false })
  website?: string;

  @ApiProperty({ required: false })
  additionalInfo?: Record<string, any>;
}