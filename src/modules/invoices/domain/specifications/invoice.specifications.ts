import { Invoice } from "../entities/invoice.entity";

export abstract class InvoiceSpecification {
  abstract isSatisfiedBy(invoice: Invoice): boolean;
}

export class OverdueInvoiceSpecification extends InvoiceSpecification {
  isSatisfiedBy(invoice: Invoice): boolean {
    return invoice.isOverdue();
  }
}

export class PaidInvoiceSpecification extends InvoiceSpecification {
  isSatisfiedBy(invoice: Invoice): boolean {
    return invoice.isPaid();
  }
}

export class EditableInvoiceSpecification extends InvoiceSpecification {
  isSatisfiedBy(invoice: Invoice): boolean {
    return invoice.canBeEdited();
  }
}

export class HighValueInvoiceSpecification extends InvoiceSpecification {
  constructor(private readonly threshold: number) {
    super();
  }

  isSatisfiedBy(invoice: Invoice): boolean {
    return invoice.total >= this.threshold;
  }
}

export class CustomerInvoiceSpecification extends InvoiceSpecification {
  constructor(private readonly customerId: string) {
    super();
  }

  isSatisfiedBy(invoice: Invoice): boolean {
    return invoice.customerId === this.customerId;
  }
}

export class DateRangeInvoiceSpecification extends InvoiceSpecification {
  constructor(
    private readonly fromDate: Date,
    private readonly toDate: Date
  ) {
    super();
  }

  isSatisfiedBy(invoice: Invoice): boolean {
    return invoice.issueDate >= this.fromDate && invoice.issueDate <= this.toDate;
  }
}

// Especificación compuesta
export class CompositeInvoiceSpecification extends InvoiceSpecification {
  constructor(private readonly specifications: InvoiceSpecification[]) {
    super();
  }

  isSatisfiedBy(invoice: Invoice): boolean {
    return this.specifications.every(spec => spec.isSatisfiedBy(invoice));
  }
}
