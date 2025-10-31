/**
 * SaleItem Value Object
 *
 * Represents an immutable sale item with validated business rules.
 * This is a value object, meaning it's identified by its attributes,
 * not by identity.
 */

export class SaleItem {
  private constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly productSku: string,
    public readonly quantity: number,
    public readonly unitPrice: number,
    public readonly discountPercentage: number = 0,
    public readonly taxPercentage: number = 0,
  ) {
    this.validate();
  }

  static create(
    productId: string,
    productName: string,
    productSku: string,
    quantity: number,
    unitPrice: number,
    discountPercentage: number = 0,
    taxPercentage: number = 0,
  ): SaleItem {
    return new SaleItem(
      productId,
      productName,
      productSku,
      quantity,
      unitPrice,
      discountPercentage,
      taxPercentage,
    );
  }

  private validate(): void {
    if (!this.productId) {
      throw new Error('Product ID is required');
    }

    if (!this.productName) {
      throw new Error('Product name is required');
    }

    if (this.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    if (this.unitPrice < 0) {
      throw new Error('Unit price cannot be negative');
    }

    if (this.discountPercentage < 0 || this.discountPercentage > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }

    if (this.taxPercentage < 0 || this.taxPercentage > 100) {
      throw new Error('Tax percentage must be between 0 and 100');
    }
  }

  calculateSubtotal(): number {
    return this.quantity * this.unitPrice;
  }

  calculateDiscountAmount(): number {
    return this.calculateSubtotal() * (this.discountPercentage / 100);
  }

  calculateTaxableAmount(): number {
    return this.calculateSubtotal() - this.calculateDiscountAmount();
  }

  calculateTaxAmount(): number {
    return this.calculateTaxableAmount() * (this.taxPercentage / 100);
  }

  calculateTotal(): number {
    return this.calculateTaxableAmount() + this.calculateTaxAmount();
  }

  /**
   * Value objects are compared by their attributes, not identity
   */
  equals(other: SaleItem): boolean {
    return (
      this.productId === other.productId &&
      this.quantity === other.quantity &&
      this.unitPrice === other.unitPrice &&
      this.discountPercentage === other.discountPercentage &&
      this.taxPercentage === other.taxPercentage
    );
  }

  /**
   * Creates a new SaleItem with updated quantity (immutability)
   */
  withQuantity(newQuantity: number): SaleItem {
    return SaleItem.create(
      this.productId,
      this.productName,
      this.productSku,
      newQuantity,
      this.unitPrice,
      this.discountPercentage,
      this.taxPercentage,
    );
  }
}
