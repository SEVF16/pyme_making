export class ProductNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Producto no encontrado: ${identifier}`);
    this.name = 'ProductNotFoundException';
  }
}

export class ProductAlreadyExistsException extends Error {
  constructor(sku: string) {
    super(`Ya existe un producto con SKU: ${sku}`);
    this.name = 'ProductAlreadyExistsException';
  }
}

export class InvalidProductSkuException extends Error {
  constructor(sku: string) {
    super(`SKU de producto inválido: ${sku}`);
    this.name = 'InvalidProductSkuException';
  }
}

export class InvalidProductPriceException extends Error {
  constructor(message: string) {
    super(`Precio de producto inválido: ${message}`);
    this.name = 'InvalidProductPriceException';
  }
}

export class InvalidProductStockException extends Error {
  constructor(message: string) {
    super(`Stock de producto inválido: ${message}`);
    this.name = 'InvalidProductStockException';
  }
}

export class InsufficientStockException extends Error {
  constructor(available: number, requested: number) {
    super(`Stock insuficiente. Disponible: ${available}, Solicitado: ${requested}`);
    this.name = 'InsufficientStockException';
  }
}

export class ProductNotActiveException extends Error {
  constructor(productId: string) {
    super(`El producto ${productId} no está activo`);
    this.name = 'ProductNotActiveException';
  }
}

export class ProductDiscontinuedException extends Error {
  constructor(productId: string) {
    super(`El producto ${productId} ha sido descontinuado`);
    this.name = 'ProductDiscontinuedException';
  }
}

export class InvalidStockMovementException extends Error {
  constructor(message: string) {
    super(`Movimiento de stock inválido: ${message}`);
    this.name = 'InvalidStockMovementException';
  }
}

export class ProductCompanyMismatchException extends Error {
  constructor(productId: string, companyId: string) {
    super(`El producto ${productId} no pertenece a la empresa ${companyId}`);
    this.name = 'ProductCompanyMismatchException';
  }
}