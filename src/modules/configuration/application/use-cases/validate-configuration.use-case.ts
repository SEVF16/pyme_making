import { Injectable } from '@nestjs/common';
import { ConfigurationValidationService } from '../../domain/services/configuration-validation.service';

@Injectable()
export class ValidateConfigurationUseCase {
  constructor(private readonly validationService: ConfigurationValidationService) {}

  async execute(value: Record<string, any>, schema: Record<string, any>): Promise<{ valid: boolean; errors: string[] }> {
    try {
      this.validationService.validate(value, schema);
      return { valid: true, errors: [] };
    } catch (error) {
      const errors = this.validationService.getValidationErrors(value, schema);
      return { valid: false, errors };
    }
  }
}
