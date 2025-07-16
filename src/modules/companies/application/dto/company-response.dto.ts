export class CompanyResponseDto {
  id: string;
  rut: string;
  businessName: string;
  fantasyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  companySize: string;
  status: string;
  logoUrl?: string;
  website?: string;
  additionalInfo?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}