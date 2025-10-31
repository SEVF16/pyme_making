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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { TenantGuard } from '../../../../shared/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../../shared/infrastructure/decorators/current-tenant.decorator';
import { PaginatedResponseDto } from '../../../../shared/application/dto/paginated-response.dto';
import { CreateConfigurationUseCase } from '../../application/use-cases/create-configuration.use-case';
import { GetConfigurationUseCase } from '../../application/use-cases/get-configuration.use-case';
import { UpdateConfigurationUseCase } from '../../application/use-cases/update-configuration.use-case';
import { DeleteConfigurationUseCase } from '../../application/use-cases/delete-configuration.use-case';
import { GetConfigurationHistoryUseCase } from '../../application/use-cases/get-configuration-history.use-case';
import { RollbackConfigurationUseCase } from '../../application/use-cases/rollback-configuration.use-case';
import { ValidateConfigurationUseCase } from '../../application/use-cases/validate-configuration.use-case';
import { ResolveConfigurationUseCase } from '../../application/use-cases/resolve-configuration.use-case';
import { GetConfigurationsByCategoryUseCase } from '../../application/use-cases/get-configurations-by-category.use-case';
import { GetActiveConfigurationsUseCase } from '../../application/use-cases/get-active-configurations.use-case';
import { CreateConfigurationDto } from '../../application/dto/create-configuration.dto';
import { UpdateConfigurationDto } from '../../application/dto/update-configuration.dto';
import { ConfigurationQueryDto } from '../../application/dto/configuration-query.dto';
import { ConfigurationResponseDto } from '../../application/dto/configuration-response.dto';
import { ConfigurationHistoryResponseDto } from '../../application/dto/configuration-history-response.dto';
import { RollbackConfigurationDto } from '../../application/dto/rollback-configuration.dto';
import { ResolveConfigurationDto } from '../../application/dto/resolve-configuration.dto';
import { ConfigurationRepositoryAbstract } from '../../domain/interfaces/configuration-repository.interface';
import { plainToInstance } from 'class-transformer';

@ApiTags('Configurations')
@Controller('configurations')
@UseGuards(TenantGuard)
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Tenant-ID',
  description: 'ID de la empresa (tenant)',
  required: true,
})
export class ConfigurationController {
  constructor(
    private readonly createConfigurationUseCase: CreateConfigurationUseCase,
    private readonly getConfigurationUseCase: GetConfigurationUseCase,
    private readonly updateConfigurationUseCase: UpdateConfigurationUseCase,
    private readonly deleteConfigurationUseCase: DeleteConfigurationUseCase,
    private readonly getConfigurationHistoryUseCase: GetConfigurationHistoryUseCase,
    private readonly rollbackConfigurationUseCase: RollbackConfigurationUseCase,
    private readonly validateConfigurationUseCase: ValidateConfigurationUseCase,
    private readonly resolveConfigurationUseCase: ResolveConfigurationUseCase,
    private readonly getConfigurationsByCategoryUseCase: GetConfigurationsByCategoryUseCase,
    private readonly getActiveConfigurationsUseCase: GetActiveConfigurationsUseCase,
    private readonly configurationRepository: ConfigurationRepositoryAbstract,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva configuración',
    description: 'Crea una nueva configuración en el sistema con versionado y validación',
  })
  @ApiBody({ type: CreateConfigurationDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Configuración creada exitosamente',
    type: ConfigurationResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos inválidos' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Configuración ya existe' })
  async createConfiguration(
    @Body() createDto: CreateConfigurationDto,
    @CurrentTenant() tenantId: string,
  ): Promise<ConfigurationResponseDto> {
    if (createDto.scope === 'company' && !createDto.scopeId) {
      createDto.scopeId = tenantId;
    }

    const configuration = await this.createConfigurationUseCase.execute(createDto);
    return plainToInstance(ConfigurationResponseDto, configuration, { excludeExtraneousValues: true });
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener configuraciones con paginación',
    description: 'Obtiene la lista de configuraciones con filtros y paginación',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de configuraciones obtenida exitosamente',
    type: PaginatedResponseDto,
  })
  async getConfigurations(
    @Query() queryDto: ConfigurationQueryDto,
    @CurrentTenant() tenantId: string,
  ): Promise<PaginatedResponseDto<ConfigurationResponseDto>> {
    queryDto.companyId = tenantId;

    const result = await this.configurationRepository.findAll({
      limit: queryDto.limit,
      offset: ((queryDto.page || 1) - 1) * (queryDto.limit || 20),
      sortField: queryDto.sortField,
      sortDirection: queryDto.sortDirection,
      filters: {
        scope: queryDto.scope,
        scopeId: queryDto.scopeId,
        category: queryDto.category,
        configKey: queryDto.configKey,
        isActive: queryDto.isActive,
        validAt: queryDto.validAt,
        pendingApproval: queryDto.pendingApproval,
        companyId: queryDto.companyId,
      },
      search: queryDto.search,
    });

    const data = result.result.map((config) =>
      plainToInstance(ConfigurationResponseDto, config, { excludeExtraneousValues: true })
    );

    return {
      result: data,
      hasNext: result.hasNext,
      limit: result.limit,
      offset: result.offset ?? 0,
      timestamp: result.timestamp,
    };
  }

  @Get('active')
  @ApiOperation({
    summary: 'Obtener configuraciones activas',
    description: 'Obtiene todas las configuraciones activas del tenant',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuraciones activas obtenidas',
    type: [ConfigurationResponseDto],
  })
  async getActiveConfigurations(
    @Query('scope') scope: string,
    @Query('scopeId') scopeId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<ConfigurationResponseDto[]> {
    const effectiveScopeId = scopeId || (scope === 'company' ? tenantId : undefined);
    const configurations = await this.getActiveConfigurationsUseCase.execute(
      scope as any,
      effectiveScopeId
    );

    return configurations.map((config) =>
      plainToInstance(ConfigurationResponseDto, config, { excludeExtraneousValues: true })
    );
  }

  @Post('resolve')
  @ApiOperation({
    summary: 'Resolver configuración con jerarquía',
    description: 'Resuelve una configuración aplicando jerarquía de precedencia (user > branch > company > system)',
  })
  @ApiBody({ type: ResolveConfigurationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuración resuelta exitosamente',
    type: ConfigurationResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Configuración no encontrada' })
  async resolveConfiguration(
    @Body() resolveDto: ResolveConfigurationDto,
    @CurrentTenant() tenantId: string,
  ): Promise<ConfigurationResponseDto | any> {
    if (!resolveDto.companyId) {
      resolveDto.companyId = tenantId;
    }

    if (resolveDto.valueKey) {
      // Retornar solo el valor específico
      const value = await this.resolveConfigurationUseCase.resolveValue(resolveDto);
      return { value };
    }

    const configuration = await this.resolveConfigurationUseCase.execute(resolveDto);
    return plainToInstance(ConfigurationResponseDto, configuration, { excludeExtraneousValues: true });
  }

  @Get('category/:category')
  @ApiOperation({
    summary: 'Obtener configuraciones por categoría',
    description: 'Obtiene todas las configuraciones de una categoría específica',
  })
  @ApiParam({ name: 'category', enum: ['tax', 'pricing', 'workflow', 'notification', 'inventory', 'accounting', 'general'] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuraciones de la categoría',
    type: [ConfigurationResponseDto],
  })
  async getConfigurationsByCategory(
    @Param('category') category: string,
    @Query('scope') scope: string,
    @Query('scopeId') scopeId: string,
    @CurrentTenant() tenantId: string,
  ): Promise<ConfigurationResponseDto[]> {
    const effectiveScopeId = scopeId || (scope === 'company' ? tenantId : undefined);
    const configurations = await this.getConfigurationsByCategoryUseCase.execute(
      category as any,
      scope as any,
      effectiveScopeId
    );

    return configurations.map((config) =>
      plainToInstance(ConfigurationResponseDto, config, { excludeExtraneousValues: true })
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener configuración por ID',
    description: 'Obtiene una configuración específica por su ID',
  })
  @ApiParam({ name: 'id', description: 'ID único de la configuración', format: 'uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuración encontrada',
    type: ConfigurationResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Configuración no encontrada' })
  async getConfigurationById(@Param('id', ParseUUIDPipe) id: string): Promise<ConfigurationResponseDto> {
    const configuration = await this.getConfigurationUseCase.execute(id);
    return plainToInstance(ConfigurationResponseDto, configuration, { excludeExtraneousValues: true });
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar configuración',
    description: 'Actualiza una configuración existente, creando una nueva versión si el valor cambia',
  })
  @ApiParam({ name: 'id', description: 'ID único de la configuración', format: 'uuid' })
  @ApiBody({ type: UpdateConfigurationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configuración actualizada exitosamente',
    type: ConfigurationResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Configuración no encontrada' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos inválidos' })
  async updateConfiguration(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateConfigurationDto,
  ): Promise<ConfigurationResponseDto> {
    const configuration = await this.updateConfigurationUseCase.execute(id, updateDto);
    return plainToInstance(ConfigurationResponseDto, configuration, { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar configuración',
    description: 'Elimina una configuración del sistema (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'ID único de la configuración', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Configuración eliminada exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Configuración no encontrada' })
  async deleteConfiguration(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteConfigurationUseCase.execute(id);
  }

  @Get(':id/history')
  @ApiOperation({
    summary: 'Obtener historial de configuración',
    description: 'Obtiene el historial completo de cambios de una configuración',
  })
  @ApiParam({ name: 'id', description: 'ID único de la configuración', format: 'uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Historial obtenido exitosamente',
    type: PaginatedResponseDto,
  })
  async getConfigurationHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<PaginatedResponseDto<ConfigurationHistoryResponseDto>> {
    const result = await this.getConfigurationHistoryUseCase.execute(id, {
      limit,
      offset: (page - 1) * limit,
    });

    const data = result.result.map((history) =>
      plainToInstance(ConfigurationHistoryResponseDto, history, { excludeExtraneousValues: true })
    );

    return {
      result: data,
      hasNext: result.hasNext,
      limit: result.limit,
      offset: result.offset ?? 0,
      timestamp: result.timestamp,
    };
  }

  @Post(':id/rollback')
  @ApiOperation({
    summary: 'Rollback de configuración',
    description: 'Revierte una configuración a una versión anterior',
  })
  @ApiParam({ name: 'id', description: 'ID único de la configuración', format: 'uuid' })
  @ApiBody({ type: RollbackConfigurationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Rollback ejecutado exitosamente',
    type: ConfigurationResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Configuración o versión no encontrada' })
  async rollbackConfiguration(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() rollbackDto: RollbackConfigurationDto,
  ): Promise<ConfigurationResponseDto> {
    const configuration = await this.rollbackConfigurationUseCase.execute(id, rollbackDto);
    return plainToInstance(ConfigurationResponseDto, configuration, { excludeExtraneousValues: true });
  }

  @Post('validate')
  @ApiOperation({
    summary: 'Validar valor contra schema',
    description: 'Valida un valor de configuración contra un JSON Schema',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        value: { type: 'object' },
        schema: { type: 'object' },
      },
      required: ['value', 'schema'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Validación ejecutada',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async validateConfiguration(
    @Body() body: { value: Record<string, any>; schema: Record<string, any> },
  ): Promise<{ valid: boolean; errors: string[] }> {
    return await this.validateConfigurationUseCase.execute(body.value, body.schema);
  }
}
