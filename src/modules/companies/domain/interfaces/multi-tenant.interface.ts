export interface ITenantContext {
  getTenantId(): string;
  setTenantId(tenantId: string): void;
  validateTenantAccess(resourceId: string): Promise<boolean>;
}