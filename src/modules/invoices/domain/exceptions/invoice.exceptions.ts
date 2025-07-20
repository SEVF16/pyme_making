export class InvoiceNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Factura no encontrada: ${identifier}`);
    this.name = 'InvoiceNotFoundException';
  }
}

export class InvoiceItemNotFoundException extends Error {
  constructor(itemId: string, invoiceId: string) {
    super(`Ítem ${itemId} no encontrado en la factura ${invoiceId}`);
    this.name = 'InvoiceItemNotFoundException';
  }
}

export class InvalidInvoiceNumberException extends Error {
  constructor(invoiceNumber: string) {
    super(`Número de factura inválido: ${invoiceNumber}`);
    this.name = 'InvalidInvoiceNumberException';
  }
}

export class DuplicateInvoiceNumberException extends Error {
  constructor(invoiceNumber: string) {
    super(`Ya existe una factura con número: ${invoiceNumber}`);
    this.name = 'DuplicateInvoiceNumberException';
  }
}

export class InvalidInvoiceStatusException extends Error {
  constructor(status: string) {
    super(`Estado de factura inválido: ${status}`);
    this.name = 'InvalidInvoiceStatusException';
  }
}

export class InvalidInvoiceTypeException extends Error {
  constructor(type: string) {
    super(`Tipo de factura inválido: ${type}`);
    this.name = 'InvalidInvoiceTypeException';
  }
}

export class InvalidStatusTransitionException extends Error {
  constructor(fromStatus: string, toStatus: string) {
    super(`Transición de estado inválida: de ${fromStatus} a ${toStatus}`);
    this.name = 'InvalidStatusTransitionException';
  }
}

export class InvoiceNotEditableException extends Error {
  constructor(invoiceId: string, status: string) {
    super(`La factura ${invoiceId} no se puede editar en estado ${status}`);
    this.name = 'InvoiceNotEditableException';
  }
}

export class EmptyInvoiceException extends Error {
  constructor() {
    super('La factura debe tener al menos un ítem');
    this.name = 'EmptyInvoiceException';
  }
}

export class InvalidInvoiceAmountException extends Error {
  constructor(message: string) {
    super(`Monto de factura inválido: ${message}`);
    this.name = 'InvalidInvoiceAmountException';
  }
}

export class InvoiceCompanyMismatchException extends Error {
  constructor(invoiceId: string, companyId: string) {
    super(`La factura ${invoiceId} no pertenece a la empresa ${companyId}`);
    this.name = 'InvoiceCompanyMismatchException';
  }
}