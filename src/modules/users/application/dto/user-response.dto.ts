import { BaseResponseDto } from '../../../../shared/application/dto/base-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto extends BaseResponseDto {
  @ApiProperty()
  companyId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  permissions: string[];

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty({ required: false })
  lastLoginAt?: Date;
}
