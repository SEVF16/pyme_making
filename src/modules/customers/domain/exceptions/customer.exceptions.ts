export class CustomerNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Cliente no encontrado: ${identifier}`);
    this.name = 'CustomerNotFoundException';
  }
}

export class CustomerAlreadyExistsException extends Error {
  constructor(rut: string) {
    super(`Ya existe un cliente con RUT: ${rut}`);
    this.name = 'CustomerAlreadyExistsException';
  }
}

export class InvalidCustomerRutException extends Error {
  constructor(rut: string) {
    super(`RUT de cliente inválido: ${rut}`);
    this.name = 'InvalidCustomerRutException';
  }
}

export class InvalidCustomerStatusException extends Error {
  constructor(status: string) {
    super(`Estado de cliente inválido: ${status}`);
    this.name = 'InvalidCustomerStatusException';
  }
}

export class InvalidCustomerTypeException extends Error {
  constructor(type: string) {
    super(`Tipo de cliente inválido: ${type}`);
    this.name = 'InvalidCustomerTypeException';
  }
}

export class InvalidCustomerEmailException extends Error {
  constructor(email: string) {
    super(`Email de cliente inválido: ${email}`);
    this.name = 'InvalidCustomerEmailException';
  }
}

export class CustomerOperationNotAllowedException extends Error {
  constructor(operation: string, reason: string) {
    super(`Operación no permitida '${operation}': ${reason}`);
    this.name = 'CustomerOperationNotAllowedException';
  }
}

export class CustomerCompanyMismatchException extends Error {
  constructor(customerId: string, companyId: string) {
    super(`El cliente ${customerId} no pertenece a la empresa ${companyId}`);
    this.name = 'CustomerCompanyMismatchException';
  }
}
