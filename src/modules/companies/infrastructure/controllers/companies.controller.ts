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
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { CreateCompanyDto } from '../../application/dto/create-company.dto';
import { UpdateCompanyDto } from '../../application/dto/update-company.dto';
import { CompanyResponseDto } from '../../application/dto/company-response.dto';
import { CompanyQueryDto } from '../../application/dto/company-query.dto';
import { CompanyService } from '../../application/services/companies.service';
import { TenantGuard } from '../../../../shared/infrastructure/guards/tenant.guard'; // *** USANDO SHARED ***
import { ResponseInterceptor } from '../../../../shared/infrastructure/interceptors/response.interceptor'; // *** USANDO SHARED ***
import { PaginatedResponseDto } from '../../../../shared/application/dto/paginated-response.dto'; // *** USANDO SHARED ***
import { CurrentTenant } from '../../../../shared/infrastructure/decorators/current-tenant.decorator'; // *** USANDO SHARED ***

@ApiTags('Companies')
@Controller('companies')
@UseGuards(TenantGuard)
@UseInterceptors(ResponseInterceptor)
@ApiHeader({
  name: 'X-Tenant-ID',
  description: 'ID de la empresa (tenant)',
  required: true,
})
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear nueva empresa',
    description: 'Crea una nueva empresa en el sistema'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Empresa creada exitosamente',
    type: CompanyResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Datos inválidos' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Ya existe una empresa con este RUT' 
  })
  async createCompany(@Body() createCompanyDto: CreateCompanyDto): Promise<CompanyResponseDto> {
    return await this.companyService.createCompany(createCompanyDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener empresas con paginación',
    description: 'Obtiene la lista de empresas con filtros y paginación'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de empresas obtenida exitosamente',
    type: PaginatedResponseDto 
  })
  async getAllCompanies(
    @Query() queryDto: CompanyQueryDto
  ): Promise<PaginatedResponseDto<CompanyResponseDto>> {
    return await this.companyService.getAllCompanies(queryDto);
  }

  @Get('rut/:rut')
  @ApiOperation({ 
    summary: 'Obtener empresa por RUT',
    description: 'Busca una empresa específica por su RUT'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Empresa encontrada',
    type: CompanyResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Empresa no encontrada' 
  })
  async getCompanyByRut(@Param('rut') rut: string): Promise<CompanyResponseDto | null> {
    return await this.companyService.getCompanyByRut(rut);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener empresa por ID',
    description: 'Obtiene una empresa específica por su ID'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Empresa encontrada',
    type: CompanyResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Empresa no encontrada' 
  })
  async getCompanyById(@Param('id', ParseUUIDPipe) id: string): Promise<CompanyResponseDto> {
    return await this.companyService.getCompanyById(id);
  }

  @Get(':id/configurations')
  @ApiOperation({ 
    summary: 'Obtener empresa con configuraciones',
    description: 'Obtiene una empresa con todas sus configuraciones'
  })
  async getCompanyWithConfigurations(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    return await this.companyService.getCompanyWithConfigurations(id);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Actualizar empresa',
    description: 'Actualiza los datos de una empresa existente'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Empresa actualizada exitosamente',
    type: CompanyResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Empresa no encontrada' 
  })
  async updateCompany(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyResponseDto> {
    return await this.companyService.updateCompany(id, updateCompanyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Eliminar empresa',
    description: 'Elimina una empresa del sistema'
  })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Empresa eliminada exitosamente' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Empresa no encontrada' 
  })
  async deleteCompany(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.companyService.deleteCompany(id);
  }
}