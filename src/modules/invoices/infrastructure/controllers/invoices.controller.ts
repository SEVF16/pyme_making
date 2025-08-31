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
  Res,
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
import { Response } from 'express';

import { CreateInvoiceDto } from '../../application/dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../../application/dto/update-invoice.dto';
import { CreateInvoiceItemDto } from '../../application/dto/create-invoice-item.dto';
import { UpdateInvoiceItemDto } from '../../application/dto/update-invoice-item.dto';
import { InvoiceResponseDto } from '../../application/dto/invoice-response.dto';
import { InvoiceQueryDto } from '../../application/dto/invoice-query.dto';
import { InvoiceService } from '../../application/services/invoices.service';
// *** USANDO SHARED ***
import { TenantGuard } from '../../../../shared/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../../shared/infrastructure/decorators/current-tenant.decorator';
import { ResponseInterceptor } from '../../../../shared/infrastructure/interceptors/response.interceptor';
import { PaginatedResponseDto } from '../../../../shared/application/dto/paginated-response.dto';

@ApiTags('Invoices')
@Controller('invoices')
@UseGuards(TenantGuard)
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Tenant-ID',
  description: 'ID de la empresa (tenant)',
  required: true,
})
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear una nueva factura',
    description: 'Crea una nueva factura con sus ítems correspondientes'
  })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Factura creada exitosamente',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Número de factura ya existe',
  })
  async createInvoice(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @CurrentTenant() tenantId: string,
  ): Promise<InvoiceResponseDto> {
    createInvoiceDto.companyId = tenantId;
    return await this.invoiceService.createInvoice(createInvoiceDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener facturas con paginación',
    description: 'Obtiene la lista de facturas con filtros y paginación'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de facturas obtenida exitosamente',
    type: PaginatedResponseDto,
  })
  async getInvoices(
    @Query() queryDto: InvoiceQueryDto,
    @CurrentTenant() tenantId: string,
  ): Promise<PaginatedResponseDto<InvoiceResponseDto>> {
    queryDto.companyId = tenantId;
    return await this.invoiceService.getInvoices(queryDto);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Obtener estadísticas de facturas',
    description: 'Obtiene métricas y estadísticas de facturación'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estadísticas obtenidas exitosamente',
  })
  async getInvoiceStats(@CurrentTenant() tenantId: string): Promise<{
    totalInvoices: number;
    totalSales: number;
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    averageInvoiceAmount: number;
  }> {
    return await this.invoiceService.getInvoiceStats(tenantId);
  }

  @Get('overdue')
  @ApiOperation({ 
    summary: 'Obtener facturas vencidas',
    description: 'Obtiene la lista de facturas vencidas de la empresa'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de facturas vencidas',
    type: [InvoiceResponseDto],
  })
  async getOverdueInvoices(@CurrentTenant() tenantId: string): Promise<InvoiceResponseDto[]> {
    return await this.invoiceService.getOverdueInvoices(tenantId);
  }

  @Get('drafts')
  @ApiOperation({ 
    summary: 'Obtener facturas en borrador',
    description: 'Obtiene las facturas que están en estado borrador'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de facturas en borrador',
    type: [InvoiceResponseDto],
  })
  async getDraftInvoices(@CurrentTenant() tenantId: string): Promise<InvoiceResponseDto[]> {
    return await this.invoiceService.getDraftInvoices(tenantId);
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Buscar facturas',
    description: 'Busca facturas por número, cliente o descripción'
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
    type: [InvoiceResponseDto],
  })
  async searchInvoices(
    @Query('q') query: string,
    @CurrentTenant() tenantId: string,
  ): Promise<InvoiceResponseDto[]> {
    return await this.invoiceService.searchInvoices(query, tenantId);
  }

  @Get('customer/:customerId')
  @ApiOperation({ 
    summary: 'Obtener facturas por cliente',
    description: 'Obtiene todas las facturas de un cliente específico'
  })
  @ApiParam({
    name: 'customerId',
    description: 'ID del cliente',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Facturas del cliente',
    type: [InvoiceResponseDto],
  })
  async getInvoicesByCustomer(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<InvoiceResponseDto[]> {
    return await this.invoiceService.getInvoicesByCustomer(customerId, tenantId);
  }

  @Get('number/:invoiceNumber')
  @ApiOperation({ 
    summary: 'Obtener factura por número',
    description: 'Busca una factura específica por su número'
  })
  @ApiParam({
    name: 'invoiceNumber',
    description: 'Número de la factura',
    example: 'FAC-2024-00001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Factura encontrada',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Factura no encontrada',
  })
  async getInvoiceByNumber(
    @Param('invoiceNumber') invoiceNumber: string,
    @CurrentTenant() tenantId: string,
  ): Promise<InvoiceResponseDto | null> {
    return await this.invoiceService.getInvoiceByNumber(invoiceNumber, tenantId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener factura por ID',
    description: 'Obtiene una factura específica con todos sus ítems'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la factura',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Factura encontrada',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Factura no encontrada',
  })
  async getInvoiceById(@Param('id', ParseUUIDPipe) id: string): Promise<InvoiceResponseDto> {
    return await this.invoiceService.getInvoiceById(id);
  }

  @Get(':id/pdf')
  @ApiOperation({ 
    summary: 'Generar PDF de factura',
    description: 'Genera y descarga el PDF de una factura'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la factura',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'PDF generado exitosamente',
    headers: {
      'Content-Type': {
        description: 'application/pdf',
      },
    },
  })
  async getInvoicePdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    // const pdfBuffer = await this.invoiceService.generateInvoicePdf(id);
    
    // res.set({
    //   'Content-Type': 'application/pdf',
    //   'Content-Disposition': `attachment; filename="factura-${id}.pdf"`,
    //   'Content-Length': pdfBuffer.length,
    // });

    // res.send(pdfBuffer);
    
    // Por ahora respuesta placeholder
    res.status(200).json({ message: 'PDF generation not implemented yet' });
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Actualizar factura',
    description: 'Actualiza los datos de una factura existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la factura',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateInvoiceDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Factura actualizada exitosamente',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Factura no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o factura no editable',
  })
  async updateInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return await this.invoiceService.updateInvoice(id, updateInvoiceDto);
  }

  @Put(':id/recalculate')
  @ApiOperation({ 
    summary: 'Recalcular totales de factura',
    description: 'Recalcula los totales de una factura basado en sus ítems'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la factura',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Totales recalculados exitosamente',
    type: InvoiceResponseDto,
  })
  async recalculateInvoiceTotals(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InvoiceResponseDto> {
    return await this.invoiceService.recalculateInvoiceTotals(id);
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Agregar ítem a factura',
    description: 'Agrega un nuevo ítem a una factura existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la factura',
    format: 'uuid',
  })
  @ApiBody({ type: CreateInvoiceItemDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Ítem agregado exitosamente',
    type: InvoiceResponseDto,
  })
  async addInvoiceItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createItemDto: CreateInvoiceItemDto,
  ): Promise<InvoiceResponseDto> {
    return await this.invoiceService.addInvoiceItem(id, createItemDto);
  }

  @Put(':id/items/:itemId')
  @ApiOperation({ 
    summary: 'Actualizar ítem de factura',
    description: 'Actualiza un ítem específico de la factura'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la factura',
    format: 'uuid',
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID único del ítem',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateInvoiceItemDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ítem actualizado exitosamente',
    type: InvoiceResponseDto,
  })
  async updateInvoiceItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateItemDto: UpdateInvoiceItemDto,
  ): Promise<InvoiceResponseDto> {
    return await this.invoiceService.updateInvoiceItem(id, itemId, updateItemDto);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Eliminar ítem de factura',
    description: 'Elimina un ítem específico de la factura'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la factura',
    format: 'uuid',
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID único del ítem',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ítem eliminado exitosamente',
    type: InvoiceResponseDto,
  })
  async removeInvoiceItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<InvoiceResponseDto> {
    return await this.invoiceService.removeInvoiceItem(id, itemId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Eliminar factura',
    description: 'Elimina una factura del sistema (soft delete)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la factura',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Factura eliminada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Factura no encontrada',
  })
  async deleteInvoice(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.invoiceService.deleteInvoice(id);
  }
}
