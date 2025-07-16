export interface SiiConfiguration {
  environment: 'production' | 'certification';
  rutRepresentante: string;
  claveCertificado: string;
  certificadoDigital: string;
  resolucionFecha: Date;
  resolucionNumero: string;
  activityCodes: number[];
  authorizedDocuments: string[];
}

export interface AccountingConfiguration {
  period: 'monthly' | 'quarterly' | 'annual';
  fiscalYearStart: Date;
  baseCurrency: string;
  taxSettings: Record<string, any>;
}

export interface GeneralConfiguration {
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  customSettings: Record<string, any>;
}