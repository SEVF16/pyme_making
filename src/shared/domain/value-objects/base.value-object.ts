export abstract class BaseValueObject<T> {
  protected constructor(protected readonly value: T) {}

  getValue(): T {
    return this.value;
  }

  equals(other: BaseValueObject<T>): boolean {
    return this.value === other.value;
  }
}