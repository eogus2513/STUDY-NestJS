import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from './jwt.payload';
import { User } from '../../user/entity/user.entity';
import { UserService } from '../../user/user.service';
import 'dotenv/config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('ACCESS_JWT'),
      ignoreExpiration: false,
    });
  }

  public async validate(payload: Payload): Promise<User> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid Token Type');
    }
    const user: User = await this.userService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User Not Found');
    }

    return user;
  }
}
