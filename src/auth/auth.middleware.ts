import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token is required');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify<{ id: number }>(token);
      req.user = decoded;
      next();
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
