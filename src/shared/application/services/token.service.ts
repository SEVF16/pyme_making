import { Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';

export interface TokenData {
  token: string;
  hashedToken: string;
  expiresAt: Date;
}

@Injectable()
export class TokenService {
  generateVerificationToken(expirationHours: number = 24): TokenData {
    const token = this.generateSecureToken();
    const hashedToken = this.hashToken(token);
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

    return { token, hashedToken, expiresAt };
  }

  generatePasswordResetToken(expirationHours: number = 1): TokenData {
    return this.generateVerificationToken(expirationHours);
  }

  verifyToken(token: string, hashedToken: string): boolean {
    const tokenHash = this.hashToken(token);
    return tokenHash === hashedToken;
  }

  isTokenExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  private generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}