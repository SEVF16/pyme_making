export abstract class BaseEntity {
  protected constructor(
    public readonly id: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  equals(other: BaseEntity): boolean {
    return this.id === other.id;
  }
}