
import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/shared/application/dto/base-response.dto';

export class UserSummaryDto extends BaseResponseDto {

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  permissions: string[];

  @ApiProperty()
  emailVerified: boolean;

}
