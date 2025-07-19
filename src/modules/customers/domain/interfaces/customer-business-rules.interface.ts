export interface CustomerBusinessRules {
  canCreateCustomer(rut: string, companyId: string): Promise<boolean>;
  canUpdateCustomer(customerId: string, companyId: string): Promise<boolean>;
  canDeleteCustomer(customerId: string, companyId: string): Promise<boolean>;
  canChangeStatus(customerId: string, newStatus: string): Promise<boolean>;
  validateCustomerData(customerData: any): Promise<boolean>;
}