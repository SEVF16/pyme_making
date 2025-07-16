import { IsString, IsEmail, IsOptional, IsEnum, IsUrl, IsObject, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCompanyDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  rut: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  businessName: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  fantasyName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  region: string;

  @IsString()
  postalCode: string;

  @IsEnum(['micro', 'small', 'medium', 'large'])
  @IsOptional()
  companySize?: 'micro' | 'small' | 'medium' | 'large';

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsObject()
  @IsOptional()
  additionalInfo?: Record<string, any>;
}