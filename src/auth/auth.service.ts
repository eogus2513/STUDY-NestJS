import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  public async generateToken(id: string): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub: `${id}`,
      },
      {
        secret: process.env.ACCESS_JWT,
        algorithm: 'HS256',
        expiresIn: '2h',
      },
    );
  }

  public async httpVerify(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token.split(' ')[1], {
        secret: process.env.ACCESS_JWT,
        ignoreExpiration: false,
      });
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  public async wsVerify(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token.split('')[1], {
        secret: process.env.ACCESS_JWT,
        ignoreExpiration: false,
      });
    } catch (e) {
      throw new WsException(e);
    }
  }
}
