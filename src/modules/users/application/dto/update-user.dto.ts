import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'companyId'] as const)
) {
  @IsEnum(['active', 'inactive', 'suspended', 'pending'])
  @IsOptional()
  status?: 'active' | 'inactive' | 'suspended' | 'pending';

  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;

  @IsObject()
  @IsOptional()
  preferences?: Record<string, any>;
}