/**
 * ConfigurationValue Value Object
 * Representa el valor de una configuración con validación de tipo JSONB
 */
export class ConfigurationValue {
  private static readonly MAX_SIZE_BYTES = 1024 * 1024; // 1MB

  private constructor(private readonly value: Record<string, any>) {}

  /**
   * Crea una instancia de ConfigurationValue validada
   */
  static create(value: any): ConfigurationValue {
    const validated = ConfigurationValue.validate(value);
    return new ConfigurationValue(validated);
  }

  /**
   * Valida y normaliza el valor
   */
  private static validate(value: any): Record<string, any> {
    if (value === null || value === undefined) {
      throw new Error('El valor de configuración no puede ser null o undefined');
    }

    // Si no es un objeto, lo envolvemos en un objeto con clave 'value'
    if (typeof value !== 'object' || Array.isArray(value)) {
      return { value };
    }

    // Verificar que sea serializable a JSON
    try {
      const serialized = JSON.stringify(value);

      // Verificar tamaño
      const sizeInBytes = new Blob([serialized]).size;
      if (sizeInBytes > ConfigurationValue.MAX_SIZE_BYTES) {
        throw new Error(
          `El valor de configuración excede el tamaño máximo permitido (${ConfigurationValue.MAX_SIZE_BYTES / 1024}KB)`
        );
      }

      // Verificar que sea deserializable
      JSON.parse(serialized);
    } catch (error) {
      if (error instanceof Error && error.message.includes('tamaño máximo')) {
        throw error;
      }
      throw new Error('El valor de configuración no es un JSON válido');
    }

    return value;
  }

  /**
   * Obtiene el valor completo
   */
  getValue(): Record<string, any> {
    return { ...this.value };
  }

  /**
   * Obtiene un valor específico por clave
   */
  get<T = any>(key: string, defaultValue?: T): T {
    const keys = key.split('.');
    let current: any = this.value;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return defaultValue as T;
      }
    }

    return current as T;
  }

  /**
   * Verifica si existe una clave
   */
  has(key: string): boolean {
    const keys = key.split('.');
    let current: any = this.value;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return false;
      }
    }

    return true;
  }

  /**
   * Obtiene todas las claves del primer nivel
   */
  getKeys(): string[] {
    return Object.keys(this.value);
  }

  /**
   * Obtiene todas las claves de forma recursiva
   */
  getAllKeys(prefix: string = ''): string[] {
    const keys: string[] = [];

    const traverse = (obj: any, currentPrefix: string) => {
      for (const key in obj) {
        const fullKey = currentPrefix ? `${currentPrefix}.${key}` : key;
        keys.push(fullKey);

        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          traverse(obj[key], fullKey);
        }
      }
    };

    traverse(this.value, prefix);
    return keys;
  }

  /**
   * Crea una nueva instancia con un valor actualizado
   */
  set(key: string, newValue: any): ConfigurationValue {
    const keys = key.split('.');
    const updated = JSON.parse(JSON.stringify(this.value));
    let current = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = newValue;
    return ConfigurationValue.create(updated);
  }

  /**
   * Crea una nueva instancia sin una clave específica
   */
  remove(key: string): ConfigurationValue {
    const keys = key.split('.');
    const updated = JSON.parse(JSON.stringify(this.value));
    let current = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        return this; // La clave no existe, retornar sin cambios
      }
      current = current[k];
    }

    delete current[keys[keys.length - 1]];
    return ConfigurationValue.create(updated);
  }

  /**
   * Combina con otro ConfigurationValue (merge)
   */
  merge(other: ConfigurationValue): ConfigurationValue {
    const merged = this.deepMerge(this.value, other.value);
    return ConfigurationValue.create(merged);
  }

  /**
   * Deep merge de dos objetos
   */
  private deepMerge(target: any, source: any): any {
    const output = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
          output[key] = this.deepMerge(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      } else {
        output[key] = source[key];
      }
    }

    return output;
  }

  /**
   * Verifica si el valor está vacío
   */
  isEmpty(): boolean {
    return Object.keys(this.value).length === 0;
  }

  /**
   * Obtiene el tamaño del valor en bytes
   */
  getSizeInBytes(): number {
    const serialized = JSON.stringify(this.value);
    return new Blob([serialized]).size;
  }

  /**
   * Serializa a JSON string
   */
  toJSON(): string {
    return JSON.stringify(this.value);
  }

  /**
   * Serializa de forma legible
   */
  toPrettyJSON(): string {
    return JSON.stringify(this.value, null, 2);
  }

  /**
   * Compara con otro ConfigurationValue
   */
  equals(other: ConfigurationValue): boolean {
    return JSON.stringify(this.value) === JSON.stringify(other.value);
  }

  /**
   * Crea una copia profunda
   */
  clone(): ConfigurationValue {
    return ConfigurationValue.create(JSON.parse(JSON.stringify(this.value)));
  }

  /**
   * Obtiene las diferencias con otro ConfigurationValue
   */
  getDiff(other: ConfigurationValue): Record<string, { old: any; new: any }> {
    const diff: Record<string, { old: any; new: any }> = {};
    const allKeys = new Set([...this.getAllKeys(), ...other.getAllKeys()]);

    for (const key of allKeys) {
      const oldValue = this.get(key);
      const newValue = other.get(key);

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        diff[key] = { old: oldValue, new: newValue };
      }
    }

    return diff;
  }

  /**
   * Crea desde JSON string
   */
  static fromJSON(json: string): ConfigurationValue {
    try {
      const parsed = JSON.parse(json);
      return ConfigurationValue.create(parsed);
    } catch (error) {
      throw new Error('JSON inválido para ConfigurationValue');
    }
  }

  /**
   * Crea un valor vacío
   */
  static empty(): ConfigurationValue {
    return new ConfigurationValue({});
  }

  /**
   * Crea desde un valor primitivo
   */
  static fromPrimitive(value: string | number | boolean): ConfigurationValue {
    return ConfigurationValue.create({ value });
  }

  /**
   * Valida si un objeto es serializable
   */
  static isSerializable(value: any): boolean {
    try {
      JSON.stringify(value);
      JSON.parse(JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
}
