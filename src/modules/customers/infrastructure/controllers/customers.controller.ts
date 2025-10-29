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

import { CreateCustomerDto } from '../../application/dto/create-customer.dto';
import { UpdateCustomerDto } from '../../application/dto/update-customer.dto';
import { CustomerResponseDto } from '../../application/dto/customer-response.dto';
import { CustomerQueryDto } from '../../application/dto/customer-query.dto';
import { CustomerService } from '../../application/services/customers.service';
// *** USANDO SHARED ***
import { TenantGuard } from '../../../../shared/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../../shared/infrastructure/decorators/current-tenant.decorator';
import { ResponseInterceptor } from '../../../../shared/infrastructure/interceptors/response.interceptor';
import { PaginatedResponseDto } from '../../../../shared/application/dto/paginated-response.dto';
import { CustomerSummaryDto } from '../../application/dto/customer-summary.dto';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(TenantGuard)
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Tenant-ID',
  description: 'ID de la empresa (tenant)',
  required: true,
})
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear un nuevo cliente',
    description: 'Crea un nuevo cliente en el sistema para la empresa especificada'
  })
  @ApiBody({ type: CreateCustomerDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cliente creado exitosamente',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cliente ya existe con este RUT',
  })
  async createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentTenant() tenantId: string,
  ): Promise<CustomerResponseDto> {
    createCustomerDto.companyId = tenantId;
    return await this.customerService.createCustomer(createCustomerDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener clientes con paginación',
    description: 'Obtiene la lista de clientes con filtros y paginación'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de clientes obtenida exitosamente',
    type: PaginatedResponseDto,
  })
  async getCustomers(
    @Query() queryDto: CustomerQueryDto,
    @CurrentTenant() tenantId: string,
  ): Promise<PaginatedResponseDto<CustomerResponseDto>> {
    // Asegurar que siempre filtre por la empresa del tenant
    queryDto.companyId = tenantId;
    return await this.customerService.getCustomers(queryDto);
  }

  @Get('summary')
  @ApiOperation({ 
    summary: 'Obtener clientes detalle con paginación',
    description: 'Obtiene la lista de clientes detalle con filtros y paginación'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de clientes detalle obtenida exitosamente',
    type: PaginatedResponseDto,
  })
  async getCustomersSummary(
    @Query() queryDto: CustomerQueryDto,
    @CurrentTenant() tenantId: string,
  ): Promise<PaginatedResponseDto<CustomerSummaryDto>> {
    // Asegurar que siempre filtre por la empresa del tenant
    queryDto.companyId = tenantId;
    return await this.customerService.getCustomersSummary(queryDto);
  }

  @Get('active')
  @ApiOperation({ 
    summary: 'Obtener clientes activos',
    description: 'Obtiene la lista de clientes activos de la empresa'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de clientes activos obtenida exitosamente',
    type: [CustomerResponseDto],
  })
  async getActiveCustomers(@CurrentTenant() tenantId: string): Promise<CustomerResponseDto[]> {
    return await this.customerService.getCustomersByStatus('active', tenantId);
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Buscar clientes',
    description: 'Busca clientes por nombre, apellido o email'
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
    type: [CustomerResponseDto],
  })
  async searchCustomers(
    @Query('q') query: string,
    @CurrentTenant() tenantId: string,
  ): Promise<CustomerResponseDto[]> {
    return await this.customerService.searchCustomers(query, tenantId);
  }

  @Get('rut/:rut')
  @ApiOperation({ 
    summary: 'Obtener cliente por RUT',
    description: 'Busca un cliente específico por su RUT en la empresa'
  })
  @ApiParam({
    name: 'rut',
    description: 'RUT del cliente',
    example: '12.345.678-9',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cliente encontrado',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente no encontrado',
  })
  async getCustomerByRut(
    @Param('rut') rut: string,
    @CurrentTenant() tenantId: string,
  ): Promise<CustomerResponseDto | null> {
    return await this.customerService.getCustomerByRut(rut, tenantId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener cliente por ID',
    description: 'Obtiene un cliente específico por su ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del cliente',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cliente encontrado',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente no encontrado',
  })
  async getCustomerById(@Param('id', ParseUUIDPipe) id: string): Promise<CustomerResponseDto> {
    return await this.customerService.getCustomerById(id);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Actualizar cliente',
    description: 'Actualiza los datos de un cliente existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del cliente',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cliente actualizado exitosamente',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
  })
  async updateCustomer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    return await this.customerService.updateCustomer(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Eliminar cliente',
    description: 'Elimina un cliente del sistema'
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del cliente',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Cliente eliminado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente no encontrado',
  })
  async deleteCustomer(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.customerService.deleteCustomer(id);
  }
}