import { IsString, IsEnum, IsArray, IsDateString, IsOptional } from 'class-validator';

export class CreateSiiConfigurationDto {
  @IsString()
  companyId: string;

  @IsEnum(['production', 'certification'])
  environment: 'production' | 'certification';

  @IsString()
  rutRepresentante: string;

  @IsString()
  claveCertificado: string;

  @IsString()
  certificadoDigital: string;

  @IsDateString()
  resolucionFecha: string;

  @IsString()
  resolucionNumero: string;

  @IsArray()
  activityCodes: number[];

  @IsArray()
  authorizedDocuments: string[];
}