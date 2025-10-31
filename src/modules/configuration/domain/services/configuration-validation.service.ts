import { Injectable } from '@nestjs/common';
import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import {
  ConfigurationValidationException,
  InvalidConfigurationSchemaException,
  InvalidValidityRangeException,
} from '../exceptions/configuration.exceptions';

/**
 * ConfigurationValidationService
 * Servicio de dominio encargado de validar configuraciones contra JSON Schema
 */
@Injectable()
export class ConfigurationValidationService {
  private readonly ajv: InstanceType<typeof Ajv>;
  private readonly schemaCache: Map<string, ValidateFunction> = new Map();

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
    });
    addFormats(this.ajv);
  }

  /**
   * Valida un valor de configuración contra un JSON Schema
   */
  validate(value: Record<string, any>, schema: Record<string, any>): void {
    if (!schema || Object.keys(schema).length === 0) {
      // Sin schema, no hay validación
      return;
    }

    // Validar que el schema sea válido
    try {
      this.ajv.compile(schema);
    } catch (error) {
      throw new InvalidConfigurationSchemaException(
        error instanceof Error ? error.message : 'Schema JSON inválido'
      );
    }

    // Obtener o crear validador
    const schemaKey = JSON.stringify(schema);
    let validator = this.schemaCache.get(schemaKey);

    if (!validator) {
      const compiledValidator = this.ajv.compile(schema);
      this.schemaCache.set(schemaKey, compiledValidator);
      validator = compiledValidator;
    }

    // Validar valor
    const valid = validator(value);

    if (!valid && validator.errors) {
      const errors = validator.errors.map((err: ErrorObject) => {
        const path = (err as any).instancePath || '/';
        const message = err.message || 'error desconocido';
        return `${path}: ${message}`;
      });

      throw new ConfigurationValidationException(errors);
    }
  }

  /**
   * Valida un JSON Schema
   */
  validateSchema(schema: Record<string, any>): void {
    try {
      this.ajv.compile(schema);
    } catch (error) {
      throw new InvalidConfigurationSchemaException(
        error instanceof Error ? error.message : 'Schema JSON inválido'
      );
    }
  }

  /**
   * Valida rango de vigencia
   */
  validateValidityRange(validFrom: Date | null, validUntil: Date | null): void {
    if (!validFrom && !validUntil) {
      // Sin rango de vigencia, es válido
      return;
    }

    if (validFrom && validUntil) {
      if (validFrom >= validUntil) {
        throw new InvalidValidityRangeException(
          'La fecha de inicio debe ser anterior a la fecha de fin'
        );
      }
    }

    if (validFrom && validFrom < new Date()) {
      // Permitir fechas pasadas para configuraciones históricas
      // pero advertir si es muy antigua (más de 1 año)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (validFrom < oneYearAgo) {
        console.warn(
          `ADVERTENCIA: La fecha de inicio de vigencia es muy antigua: ${validFrom.toISOString()}`
        );
      }
    }
  }

  /**
   * Valida que un valor cumpla con un schema específico sin lanzar excepción
   */
  isValid(value: Record<string, any>, schema: Record<string, any>): boolean {
    try {
      this.validate(value, schema);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene los errores de validación sin lanzar excepción
   */
  getValidationErrors(value: Record<string, any>, schema: Record<string, any>): string[] {
    if (!schema || Object.keys(schema).length === 0) {
      return [];
    }

    try {
      const validator = this.ajv.compile(schema);
      const valid = validator(value);

      if (!valid && validator.errors) {
        return validator.errors.map((err: ErrorObject) => {
          const path = (err as any).instancePath || '/';
          const message = err.message || 'error desconocido';
          return `${path}: ${message}`;
        });
      }

      return [];
    } catch (error) {
      return [error instanceof Error ? error.message : 'Error de validación desconocido'];
    }
  }

  /**
   * Valida que un valor sea serializable a JSON
   */
  validateSerializable(value: any): void {
    try {
      JSON.stringify(value);
      JSON.parse(JSON.stringify(value));
    } catch (error) {
      throw new ConfigurationValidationException([
        'El valor no es serializable a JSON: ' +
          (error instanceof Error ? error.message : 'error desconocido'),
      ]);
    }
  }

  /**
   * Valida el tamaño del valor de configuración
   */
  validateSize(value: Record<string, any>, maxSizeBytes: number = 1024 * 1024): void {
    const serialized = JSON.stringify(value);
    const sizeInBytes = new Blob([serialized]).size;

    if (sizeInBytes > maxSizeBytes) {
      throw new ConfigurationValidationException([
        `El valor excede el tamaño máximo permitido (${maxSizeBytes / 1024}KB). Tamaño actual: ${sizeInBytes / 1024}KB`,
      ]);
    }
  }

  /**
   * Genera un schema básico a partir de un valor
   */
  generateSchemaFromValue(value: Record<string, any>): Record<string, any> {
    const schema: any = {
      type: 'object',
      properties: {},
      required: [],
    };

    for (const key in value) {
      const val = value[key];
      const type = Array.isArray(val) ? 'array' : typeof val;

      schema.properties[key] = { type };

      if (type === 'array' && val.length > 0) {
        schema.properties[key].items = { type: typeof val[0] };
      }

      if (type === 'object' && val !== null) {
        schema.properties[key] = this.generateSchemaFromValue(val);
      }

      schema.required.push(key);
    }

    return schema;
  }

  /**
   * Valida que no haya claves reservadas en el valor
   */
  validateNoReservedKeys(value: Record<string, any>, reservedKeys: string[]): void {
    const keys = this.getAllKeys(value);
    const foundReserved = keys.filter((key) => reservedKeys.includes(key));

    if (foundReserved.length > 0) {
      throw new ConfigurationValidationException([
        `Se encontraron claves reservadas en el valor: ${foundReserved.join(', ')}`,
      ]);
    }
  }

  /**
   * Obtiene todas las claves de un objeto de forma recursiva
   */
  private getAllKeys(obj: Record<string, any>, prefix: string = ''): string[] {
    const keys: string[] = [];

    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      keys.push(fullKey);

      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        keys.push(...this.getAllKeys(obj[key], fullKey));
      }
    }

    return keys;
  }

  /**
   * Valida estructura de valor esperada para una categoría
   */
  validateCategoryStructure(
    value: Record<string, any>,
    category: string
  ): { valid: boolean; errors: string[] } {
    const categorySchemas: Record<string, Record<string, any>> = {
      tax: {
        type: 'object',
        properties: {
          rate: { type: 'number', minimum: 0, maximum: 100 },
          type: { type: 'string' },
        },
      },
      pricing: {
        type: 'object',
        properties: {
          strategy: { type: 'string' },
          discountPercentage: { type: 'number', minimum: 0, maximum: 100 },
        },
      },
      // Agregar más schemas específicos por categoría según necesidad
    };

    const schema = categorySchemas[category];
    if (!schema) {
      // Sin schema específico, aceptar cualquier estructura
      return { valid: true, errors: [] };
    }

    const errors = this.getValidationErrors(value, schema);
    return { valid: errors.length === 0, errors };
  }

  /**
   * Limpia la cache de schemas compilados
   */
  clearCache(): void {
    this.schemaCache.clear();
  }

  /**
   * Obtiene el tamaño de la cache
   */
  getCacheSize(): number {
    return this.schemaCache.size;
  }
}
