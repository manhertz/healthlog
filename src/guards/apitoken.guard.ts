// src/common/guards/api-token.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Type assertion for the entire request object to handle headers safely
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const headers = request.headers;
    const authHeader = headers['authorization'] as string | undefined;
    const logger = new Logger(ApiTokenGuard.name);

    const token = authHeader
      ? authHeader.replace('Bearer ', '').trim()
      : undefined;
    const expectedToken = this.configService.get<string>('api.token');

    if (token !== expectedToken) {
      logger.error(
        `Unauthorized attempt ${token ? `(token=${token})` : `(no token provided)`}`,
      );
      throw new UnauthorizedException('Invalid or missing API token');
    }

    return true;
  }
}
