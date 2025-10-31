import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigurationRepositoryAbstract } from '../../domain/interfaces/configuration-repository.interface';

@Injectable()
export class ConfigurationOwnershipGuard implements CanActivate {
  constructor(private readonly configurationRepository: ConfigurationRepositoryAbstract) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const configurationId = request.params.id;
    const tenantId = request.tenantId;

    if (!configurationId || !tenantId) {
      throw new ForbiddenException('ID de configuración y tenant son requeridos');
    }

    const configuration = await this.configurationRepository.findById(configurationId);

    if (!configuration) {
      throw new ForbiddenException('Configuración no encontrada');
    }

    // Verificar según el scope
    if (configuration.scope === 'system') {
      // Las configuraciones de sistema solo pueden ser accedidas por super admins
      // Aquí se debería verificar el rol del usuario
      return true;
    }

    if (configuration.companyId && configuration.companyId !== tenantId) {
      throw new ForbiddenException('No tienes permisos para acceder a esta configuración');
    }

    return true;
  }
}
