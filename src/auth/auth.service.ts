import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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

  public async verify(token: string): Promise<any> {
    return await this.jwtService.verifyAsync(token.split(' ')[1], {
      secret: process.env.ACCESS_JWT,
    });
  }
}
