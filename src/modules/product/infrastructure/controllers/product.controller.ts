import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiHeader,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { CreateProductDto } from '../../application/dto/create-product.dto';
import { UpdateProductDto } from '../../application/dto/update-product.dto';
import { ProductResponseDto } from '../../application/dto/product-response.dto';
import { ProductQueryDto } from '../../application/dto/product-query.dto';
import { UpdateStockDto } from '../../application/dto/update-stock.dto';

// *** USANDO SHARED ***
import { TenantGuard } from '../../../../shared/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../../shared/infrastructure/decorators/current-tenant.decorator';
import { ResponseInterceptor } from '../../../../shared/infrastructure/interceptors/response.interceptor';
import { PaginatedResponseDto } from '../../../../shared/application/dto/paginated-response.dto';
import { ProductService } from '../../application/services/product.service';
import { ProductSummaryDto } from '../../application/dto/product-summary.dto';
import { StockHistoryRequestDto } from '../../application/dto/stock-history-request.dto';
import { StockMovementResponseDto } from '../../application/dto/stock-movement-response.dto';

@ApiTags('Products')
@Controller('products')
@UseGuards(TenantGuard)
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Tenant-ID',
  description: 'ID de la empresa (tenant)',
  required: true,
})
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear un nuevo producto',
    description: 'Crea un nuevo producto en el sistema para la empresa especificada'
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Producto creado exitosamente',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Producto ya existe con este SKU',
  })
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @CurrentTenant() tenantId: string,
  ): Promise<ProductResponseDto> {
    createProductDto.companyId = tenantId;
    return await this.productService.createProduct(createProductDto);
  }

  @Get('summary')
  @ApiOperation({ 
    summary: 'Obtener resumen de productos con paginación',
    description: 'Obtiene la lista resumida de productos (id, sku, name, status, stock) con filtros y paginación'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista resumida de productos obtenida exitosamente',
    type: PaginatedResponseDto<ProductSummaryDto>,
  })
  async getProductsSummary(
    @Query() queryDto: ProductQueryDto,
    @CurrentTenant() tenantId: string,
  ): Promise<PaginatedResponseDto<ProductSummaryDto>> {
    // Asegurar que siempre filtre por la empresa del tenant
    queryDto.companyId = tenantId;
    return await this.productService.getProductsSummary(queryDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener productos con paginación',
    description: 'Obtiene la lista de productos con filtros y paginación'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de productos obtenida exitosamente',
    type: PaginatedResponseDto,
  })
  async getProducts(
    @Query() queryDto: ProductQueryDto,
    @CurrentTenant() tenantId: string,
  ): Promise<PaginatedResponseDto<ProductResponseDto>> {
    // Asegurar que siempre filtre por la empresa del tenant
    queryDto.companyId = tenantId;
    return await this.productService.getProducts(queryDto);
  }

  @Get('low-stock')
  @ApiOperation({ 
    summary: 'Obtener productos con stock bajo',
    description: 'Obtiene la lista de productos con stock por debajo del mínimo'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de productos con stock bajo',
    type: [ProductResponseDto],
  })
  async getLowStockProducts(@CurrentTenant() tenantId: string): Promise<ProductResponseDto[]> {
    return await this.productService.getLowStockProducts(tenantId);
  }

  @Get('out-of-stock')
  @ApiOperation({ 
    summary: 'Obtener productos sin stock',
    description: 'Obtiene la lista de productos sin stock disponible'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de productos sin stock',
    type: [ProductResponseDto],
  })
  async getOutOfStockProducts(@CurrentTenant() tenantId: string): Promise<ProductResponseDto[]> {
    return await this.productService.getOutOfStockProducts(tenantId);
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Buscar productos',
    description: 'Busca productos por nombre, SKU, descripción o código de barras'
  })
  @ApiQuery({
    name: 'q',
    description: 'Término de búsqueda',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Resultados de búsqueda',
    type: [ProductResponseDto],
  })
  async searchProducts(
    @Query('q') query: string,
    @CurrentTenant() tenantId: string,
  ): Promise<ProductResponseDto[]> {
    return await this.productService.searchProducts(query, tenantId);
  }

  @Get('category/:category')
  @ApiOperation({ 
    summary: 'Obtener productos por categoría',
    description: 'Obtiene todos los productos de una categoría específica'
  })
  @ApiParam({
    name: 'category',
    description: 'Nombre de la categoría',
    example: 'Electrónicos',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Productos de la categoría',
    type: [ProductResponseDto],
  })
  async getProductsByCategory(
    @Param('category') category: string,
    @CurrentTenant() tenantId: string,
  ): Promise<ProductResponseDto[]> {
    return await this.productService.getProductsByCategory(category, tenantId);
  }

  @Get('sku/:sku')
  @ApiOperation({ 
    summary: 'Obtener producto por SKU',
    description: 'Busca un producto específico por su SKU en la empresa'
  })
  @ApiParam({
    name: 'sku',
    description: 'SKU del producto',
    example: 'PRD-001-XL',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto encontrado',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Producto no encontrado',
  })
  async getProductBySku(
    @Param('sku') sku: string,
    @CurrentTenant() tenantId: string,
  ): Promise<ProductResponseDto | null> {
    return await this.productService.getProductBySku(sku, tenantId);
  }

  @Get('barcode/:barcode')
  @ApiOperation({ 
    summary: 'Obtener producto por código de barras',
    description: 'Busca un producto específico por su código de barras'
  })
  @ApiParam({
    name: 'barcode',
    description: 'Código de barras del producto',
    example: '1234567890123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto encontrado',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Producto no encontrado',
  })
  async getProductByBarcode(
    @Param('barcode') barcode: string,
    @CurrentTenant() tenantId: string,
  ): Promise<ProductResponseDto | null> {
    return await this.productService.getProductsByBarcode(barcode, tenantId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener producto por ID',
    description: 'Obtiene un producto específico por su ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del producto',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto encontrado',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Producto no encontrado',
  })
  async getProductById(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
    return await this.productService.getProductById(id);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Actualizar producto',
    description: 'Actualiza los datos de un producto existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del producto',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto actualizado exitosamente',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Producto no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
  })
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return await this.productService.updateProduct(id, updateProductDto);
  }

  @Put(':id/stock')
  @ApiOperation({ 
    summary: 'Actualizar stock del producto',
    description: 'Realiza movimientos de entrada, salida o ajuste de stock'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del producto',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateStockDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock actualizado exitosamente',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Producto no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Movimiento de stock inválido',
  })
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStockDto: UpdateStockDto,
  ): Promise<ProductResponseDto> {
    return await this.productService.updateStock(id, updateStockDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Eliminar producto',
    description: 'Elimina un producto del sistema (soft delete)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del producto',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Producto eliminado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Producto no encontrado',
  })
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.productService.deleteProduct(id);
  }
@Post(':id/stock-history')
@ApiOperation({ 
  summary: 'Obtener historial de movimientos de stock',
  description: 'Obtiene el historial completo de movimientos de stock de un producto con filtros'
})
@ApiParam({
  name: 'id',
  description: 'ID único del producto',
  format: 'uuid',
})
@ApiBody({ type: StockHistoryRequestDto })
@ApiResponse({
  status: HttpStatus.OK,
  description: 'Historial de movimientos obtenido exitosamente',
  type: PaginatedResponseDto,
})
async getProductStockHistory(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() requestDto: StockHistoryRequestDto,
): Promise<PaginatedResponseDto<StockMovementResponseDto>> {
  requestDto.productId = id; // Asegurar que use el ID del parámetro
  return await this.productService.getProductStockHistory(id, requestDto);
}

@Post('stock-movements/search')
@ApiOperation({ 
  summary: 'Buscar movimientos de stock de la empresa',
  description: 'Busca movimientos de stock con filtros avanzados enviados en el body'
})
@ApiBody({ type: StockHistoryRequestDto })
@ApiResponse({
  status: HttpStatus.OK,
  description: 'Movimientos de stock obtenidos exitosamente',
  type: PaginatedResponseDto,
})
async searchStockMovements(
  @Body() requestDto: StockHistoryRequestDto,
  @CurrentTenant() tenantId: string,
): Promise<PaginatedResponseDto<StockMovementResponseDto>> {
  return await this.productService.getCompanyStockMovements(tenantId, requestDto);
}

@Post('stock-movements/by-reference')
@ApiOperation({ 
  summary: 'Buscar movimientos por referencia de documento',
  description: 'Busca movimientos de stock que contengan la referencia especificada'
})
@ApiBody({ 
  schema: {
    type: 'object',
    properties: {
      reference: { type: 'string', example: 'FAC-001' },
      includeProduct: { type: 'boolean', example: true }
    },
    required: ['reference']
  }
})
@ApiResponse({
  status: HttpStatus.OK,
  description: 'Movimientos encontrados por referencia',
  type: [StockMovementResponseDto],
})
async getStockMovementsByReference(
  @Body() body: { reference: string; includeProduct?: boolean },
  @CurrentTenant() tenantId: string,
): Promise<StockMovementResponseDto[]> {
  return await this.productService.getStockMovementsByReference(tenantId, body.reference);
}

@Post('stock-movements/date-range')
@ApiOperation({ 
  summary: 'Obtener movimientos por rango de fechas',
  description: 'Obtiene movimientos de stock en un rango de fechas específico'
})
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      dateFrom: { type: 'string', format: 'date', example: '2024-01-01' },
      dateTo: { type: 'string', format: 'date', example: '2024-12-31' },
      movementType: { type: 'string', enum: ['in', 'out', 'adjustment'] },
      includeProduct: { type: 'boolean', example: true },
      page: { type: 'number', example: 1 },
      limit: { type: 'number', example: 20 }
    },
    required: ['dateFrom', 'dateTo']
  }
})
@ApiResponse({
  status: HttpStatus.OK,
  description: 'Movimientos en rango de fechas',
  type: PaginatedResponseDto,
})
async getStockMovementsByDateRange(
  @Body() requestDto: StockHistoryRequestDto & { dateFrom: string; dateTo: string },
  @CurrentTenant() tenantId: string,
): Promise<PaginatedResponseDto<StockMovementResponseDto>> {
  // Validar fechas
  const fromDate = new Date(requestDto.dateFrom);
  const toDate = new Date(requestDto.dateTo);
  
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    throw new BadRequestException('Formato de fecha inválido. Use formato ISO (YYYY-MM-DD)');
  }

  return await this.productService.getCompanyStockMovements(tenantId, requestDto);
}
}