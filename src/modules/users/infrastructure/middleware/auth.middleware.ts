import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../application/services/users.service';

export interface AuthenticatedRequest extends Request {
  user?: any;
  tenantId?: string;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const token = this.extractTokenFromHeader(req);
      
      if (!token) {
        throw new UnauthorizedException('Token no proporcionado');
      }

      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.usersService.getUserById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Usuario inválido o inactivo');
      }

      req.user = user;
      req.tenantId = user.companyId;
      
      next();
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}