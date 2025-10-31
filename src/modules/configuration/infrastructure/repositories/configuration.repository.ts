import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Configuration, ConfigurationScope, ConfigurationCategory } from '../../domain/entities/configuration.entity';
import { ConfigurationHistory, ChangeAction } from '../../domain/entities/configuration-history.entity';
import { BaseRepository } from '../../../../shared/infrastructure/repository/base.repository';
import { PaginationService } from '../../../../shared/application/services/pagination.service';
import { PaginatedResult, PaginationOptions } from '../../../../shared/domain/interfaces/repository.interface';
import { ConfigurationRepositoryAbstract } from '../../domain/interfaces/configuration-repository.interface';

@Injectable()
export class ConfigurationRepository
  extends BaseRepository<Configuration>
  implements ConfigurationRepositoryAbstract
{
  constructor(
    @InjectRepository(Configuration)
    private readonly configurationRepository: Repository<Configuration>,
    @InjectRepository(ConfigurationHistory)
    private readonly historyRepository: Repository<ConfigurationHistory>,
    paginationService: PaginationService,
  ) {
    super(configurationRepository, paginationService);
  }

  protected getAlias(): string {
    return 'configuration';
  }

  protected applyFilters(queryBuilder: SelectQueryBuilder<Configuration>, filters: any): void {
    if (filters.scope) {
      queryBuilder.andWhere('configuration.scope = :scope', { scope: filters.scope });
    }

    if (filters.scopeId) {
      queryBuilder.andWhere('configuration.scopeId = :scopeId', { scopeId: filters.scopeId });
    }

    if (filters.companyId) {
      queryBuilder.andWhere('configuration.companyId = :companyId', { companyId: filters.companyId });
    }

    if (filters.category) {
      queryBuilder.andWhere('configuration.category = :category', { category: filters.category });
    }

    if (filters.configKey) {
      queryBuilder.andWhere('configuration.configKey = :configKey', { configKey: filters.configKey });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('configuration.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.validAt) {
      const validAtDate = new Date(filters.validAt);
      queryBuilder.andWhere(
        '(configuration.validFrom IS NULL OR configuration.validFrom <= :validAt)',
        { validAt: validAtDate }
      );
      queryBuilder.andWhere(
        '(configuration.validUntil IS NULL OR configuration.validUntil >= :validAt)',
        { validAt: validAtDate }
      );
    }

    if (filters.pendingApproval) {
      queryBuilder.andWhere('configuration.approvedBy IS NULL');
      queryBuilder.andWhere("configuration.metadata->>'requiresApproval' = 'true'");
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(configuration.configKey ILIKE :search OR configuration.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
  }

  protected applySearch(queryBuilder: SelectQueryBuilder<Configuration>, search: string): void {
    queryBuilder.andWhere(
      '(configuration.configKey ILIKE :search OR configuration.description ILIKE :search)',
      { search: `%${search}%` }
    );
  }

  async findByKey(
    configKey: string,
    scope: ConfigurationScope,
    scopeId?: string
  ): Promise<Configuration | null> {
    const query: any = { configKey, scope };
    if (scopeId) query.scopeId = scopeId;
    else if (scope !== 'system') query.scopeId = scopeId || null;

    return await this.configurationRepository.findOne({ where: query });
  }

  async findActiveByKey(configKey: string): Promise<Configuration[]> {
    return await this.configurationRepository.find({
      where: { configKey, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByCategory(
    category: ConfigurationCategory,
    scope?: ConfigurationScope,
    scopeId?: string
  ): Promise<Configuration[]> {
    const query: any = { category };
    if (scope) query.scope = scope;
    if (scopeId) query.scopeId = scopeId;

    return await this.configurationRepository.find({
      where: query,
      order: { configKey: 'ASC' },
    });
  }

  async findByScope(scope: ConfigurationScope, scopeId?: string): Promise<Configuration[]> {
    const query: any = { scope };
    if (scopeId) query.scopeId = scopeId;

    return await this.configurationRepository.find({
      where: query,
      order: { configKey: 'ASC' },
    });
  }

  async findActiveByScope(scope: ConfigurationScope, scopeId?: string): Promise<Configuration[]> {
    const query: any = { scope, isActive: true };
    if (scopeId) query.scopeId = scopeId;

    return await this.configurationRepository.find({
      where: query,
      order: { configKey: 'ASC' },
    });
  }

  async findWithHierarchy(
    configKey: string,
    companyId?: string,
    branchId?: string,
    userId?: string
  ): Promise<Configuration | null> {
    const configs = await this.findAllInHierarchy(configKey, companyId, branchId, userId);

    if (configs.length === 0) return null;

    // Retornar la de mayor prioridad (usuario > sucursal > empresa > sistema)
    return configs[0];
  }

  async findAllInHierarchy(
    configKey: string,
    companyId?: string,
    branchId?: string,
    userId?: string
  ): Promise<Configuration[]> {
    const queryBuilder = this.configurationRepository
      .createQueryBuilder('configuration')
      .where('configuration.configKey = :configKey', { configKey })
      .andWhere('configuration.isActive = :isActive', { isActive: true });

    // Construir condiciones para jerarquía
    const conditions: string[] = ["configuration.scope = 'system'"];

    if (companyId) {
      conditions.push("(configuration.scope = 'company' AND configuration.scopeId = :companyId)");
    }
    if (branchId) {
      conditions.push("(configuration.scope = 'branch' AND configuration.scopeId = :branchId)");
    }
    if (userId) {
      conditions.push("(configuration.scope = 'user' AND configuration.scopeId = :userId)");
    }

    queryBuilder.andWhere(`(${conditions.join(' OR ')})`, { companyId, branchId, userId });

    const configs = await queryBuilder.getMany();

    // Ordenar por prioridad
    return configs.sort((a, b) => b.getScopePriority() - a.getScopePriority());
  }

  async findActiveAndValid(
    scope?: ConfigurationScope,
    scopeId?: string,
    date?: Date
  ): Promise<Configuration[]> {
    const validDate = date || new Date();
    const queryBuilder = this.configurationRepository
      .createQueryBuilder('configuration')
      .where('configuration.isActive = :isActive', { isActive: true })
      .andWhere(
        '(configuration.validFrom IS NULL OR configuration.validFrom <= :validDate)',
        { validDate }
      )
      .andWhere(
        '(configuration.validUntil IS NULL OR configuration.validUntil >= :validDate)',
        { validDate }
      );

    if (scope) {
      queryBuilder.andWhere('configuration.scope = :scope', { scope });
    }

    if (scopeId) {
      queryBuilder.andWhere('configuration.scopeId = :scopeId', { scopeId });
    }

    return await queryBuilder.getMany();
  }

  async findByValidityRange(dateFrom: Date, dateTo: Date): Promise<Configuration[]> {
    return await this.configurationRepository
      .createQueryBuilder('configuration')
      .where('configuration.validFrom IS NOT NULL')
      .andWhere('configuration.validFrom >= :dateFrom', { dateFrom })
      .andWhere('configuration.validFrom <= :dateTo', { dateTo })
      .orWhere('configuration.validUntil >= :dateFrom AND configuration.validUntil <= :dateTo', {
        dateFrom,
        dateTo,
      })
      .getMany();
  }

  async findPendingApproval(companyId?: string): Promise<Configuration[]> {
    const queryBuilder = this.configurationRepository
      .createQueryBuilder('configuration')
      .where('configuration.approvedBy IS NULL')
      .andWhere("configuration.metadata->>'requiresApproval' = 'true'");

    if (companyId) {
      queryBuilder.andWhere('configuration.companyId = :companyId', { companyId });
    }

    return await queryBuilder.getMany();
  }

  async findByVersion(
    configKey: string,
    version: number,
    scopeId?: string
  ): Promise<Configuration | null> {
    const query: any = { configKey, version };
    if (scopeId) query.scopeId = scopeId;

    return await this.configurationRepository.findOne({ where: query });
  }

  async findLatestVersion(
    configKey: string,
    scope: ConfigurationScope,
    scopeId?: string
  ): Promise<Configuration | null> {
    const query: any = { configKey, scope };
    if (scopeId) query.scopeId = scopeId;

    const configs = await this.configurationRepository.find({
      where: query,
      order: { version: 'DESC' },
      take: 1,
    });

    return configs.length > 0 ? configs[0] : null;
  }

  async findAllVersions(
    configKey: string,
    scope: ConfigurationScope,
    scopeId?: string
  ): Promise<Configuration[]> {
    const query: any = { configKey, scope };
    if (scopeId) query.scopeId = scopeId;

    return await this.configurationRepository.find({
      where: query,
      order: { version: 'DESC' },
    });
  }

  async existsByKey(
    configKey: string,
    scope: ConfigurationScope,
    scopeId?: string
  ): Promise<boolean> {
    const config = await this.findByKey(configKey, scope, scopeId);
    return config !== null;
  }

  async countByScope(scope: ConfigurationScope, scopeId?: string): Promise<number> {
    const query: any = { scope };
    if (scopeId) query.scopeId = scopeId;

    return await this.configurationRepository.count({ where: query });
  }

  async countByCategory(category: ConfigurationCategory, scopeId?: string): Promise<number> {
    const query: any = { category };
    if (scopeId) query.companyId = scopeId;

    return await this.configurationRepository.count({ where: query });
  }

  async findExpiringSoon(days: number, companyId?: string): Promise<Configuration[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const queryBuilder = this.configurationRepository
      .createQueryBuilder('configuration')
      .where('configuration.validUntil IS NOT NULL')
      .andWhere('configuration.validUntil <= :futureDate', { futureDate })
      .andWhere('configuration.validUntil >= :now', { now: new Date() })
      .andWhere('configuration.isActive = :isActive', { isActive: true });

    if (companyId) {
      queryBuilder.andWhere('configuration.companyId = :companyId', { companyId });
    }

    return await queryBuilder.getMany();
  }

  async deactivateOldVersions(
    configKey: string,
    scope: ConfigurationScope,
    scopeId: string | null,
    currentId: string
  ): Promise<void> {
    const query: any = { configKey, scope, isActive: true };
    if (scopeId) query.scopeId = scopeId;

    const oldVersions = await this.configurationRepository.find({ where: query });

    for (const old of oldVersions) {
      if (old.id !== currentId) {
        await this.configurationRepository.update(old.id, { isActive: false });
      }
    }
  }

  // History methods
  async createHistory(history: Partial<ConfigurationHistory>): Promise<ConfigurationHistory> {
    const historyEntity = this.historyRepository.create(history);
    return await this.historyRepository.save(historyEntity);
  }

  async getHistory(
    configurationId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<ConfigurationHistory>> {
    const queryBuilder = this.historyRepository
      .createQueryBuilder('history')
      .where('history.configurationId = :configurationId', { configurationId });

    return await this.paginationService.paginate(queryBuilder, {
      limit: options?.limit,
      offset: options?.offset,
      sortField: options?.sortField || 'createdAt',
      sortDirection: options?.sortDirection || 'DESC',
    });
  }

  async getHistoryByKey(
    configKey: string,
    scope: ConfigurationScope,
    scopeId?: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<ConfigurationHistory>> {
    const queryBuilder = this.historyRepository
      .createQueryBuilder('history')
      .where('history.configKey = :configKey', { configKey })
      .andWhere('history.scope = :scope', { scope });

    if (scopeId) {
      queryBuilder.andWhere('history.scopeId = :scopeId', { scopeId });
    }

    return await this.paginationService.paginate(queryBuilder, {
      limit: options?.limit,
      offset: options?.offset,
      sortField: options?.sortField || 'createdAt',
      sortDirection: options?.sortDirection || 'DESC',
    });
  }

  async getHistoryByUser(
    userId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<ConfigurationHistory>> {
    const queryBuilder = this.historyRepository
      .createQueryBuilder('history')
      .where('history.changedBy = :userId', { userId });

    return await this.paginationService.paginate(queryBuilder, {
      limit: options?.limit,
      offset: options?.offset,
      sortField: options?.sortField || 'createdAt',
      sortDirection: options?.sortDirection || 'DESC',
    });
  }

  async getHistoryByDateRange(
    dateFrom: Date,
    dateTo: Date,
    companyId?: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<ConfigurationHistory>> {
    const queryBuilder = this.historyRepository
      .createQueryBuilder('history')
      .where('history.createdAt >= :dateFrom', { dateFrom })
      .andWhere('history.createdAt <= :dateTo', { dateTo });

    if (companyId) {
      queryBuilder.andWhere('history.companyId = :companyId', { companyId });
    }

    return await this.paginationService.paginate(queryBuilder, {
      limit: options?.limit,
      offset: options?.offset,
      sortField: options?.sortField || 'createdAt',
      sortDirection: options?.sortDirection || 'DESC',
    });
  }

  async getHistoryStats(configurationId: string): Promise<{
    totalChanges: number;
    totalVersions: number;
    lastChangeDate: Date | null;
    changesByUser: Record<string, number>;
  }> {
    const history = await this.historyRepository.find({
      where: { configurationId },
      order: { createdAt: 'DESC' },
    });

    const changesByUser: Record<string, number> = {};
    const versions = new Set<number>();

    for (const h of history) {
      changesByUser[h.changedBy] = (changesByUser[h.changedBy] || 0) + 1;
      versions.add(h.newVersion);
    }

    return {
      totalChanges: history.length,
      totalVersions: versions.size,
      lastChangeDate: history.length > 0 ? history[0].createdAt : null,
      changesByUser,
    };
  }

  async getHistoryByAction(
    action: ChangeAction,
    companyId?: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<ConfigurationHistory>> {
    const queryBuilder = this.historyRepository
      .createQueryBuilder('history')
      .where('history.action = :action', { action });

    if (companyId) {
      queryBuilder.andWhere('history.companyId = :companyId', { companyId });
    }

    return await this.paginationService.paginate(queryBuilder, {
      limit: options?.limit,
      offset: options?.offset,
      sortField: options?.sortField || 'createdAt',
      sortDirection: options?.sortDirection || 'DESC',
    });
  }
}
