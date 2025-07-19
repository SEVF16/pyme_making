export class UserRoleValueObject {
  private static readonly VALID_ROLES = ['admin', 'manager', 'employee', 'viewer'] as const;
  private static readonly ROLE_HIERARCHY = {
    admin: 4,
    manager: 3,
    employee: 2,
    viewer: 1
  };

  private constructor(private readonly value: typeof UserRoleValueObject.VALID_ROLES[number]) {}

  static create(role: string): UserRoleValueObject {
    if (!this.VALID_ROLES.includes(role as any)) {
      throw new Error(`Rol de usuario inválido: ${role}`);
    }

    return new UserRoleValueObject(role as any);
  }

  getValue(): string {
    return this.value;
  }

  getLevel(): number {
    return UserRoleValueObject.ROLE_HIERARCHY[this.value];
  }

  canManage(otherRole: UserRoleValueObject): boolean {
    return this.getLevel() > otherRole.getLevel();
  }

  isAdmin(): boolean {
    return this.value === 'admin';
  }

  isManager(): boolean {
    return this.value === 'manager' || this.isAdmin();
  }
}