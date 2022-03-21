import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpRequest } from './dto/request/SignUp.request';
import { User } from './entity/user.entity';
import { SignInRequest } from './dto/request/SignIn.request';
import { AuthService } from '../auth/auth.service';
import { compare, hash } from 'bcryptjs';
import { UserRepository } from './entity/repository/user.repository';
import { TokenResponse } from '../auth/dto/response/token.response';
import { Cache } from 'cache-manager';
import { Payload } from '../auth/jwt/jwt.payload';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async currentUser(user): Promise<User> {
    return user;
  }

  public async signUp({ id, password }: SignUpRequest): Promise<void> {
    if (await this.findOne(id)) {
      throw new UnauthorizedException('Id Exists');
    }

    const hashedPassword = await hash(password, 12);
    await this.userRepository.save({
      id: id,
      password: hashedPassword,
    });
  }

  public async login({ id, password }: SignInRequest): Promise<TokenResponse> {
    const user: User = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    if (!(await compare(password, user.password))) {
      throw new BadRequestException('Password MisMatch');
    }

    const token = await this.generateToken(id);

    const refreshExp: number = 60 * 60 * 24 * 15;
    await this.cacheManager.set(user.id, token.refresh_token, {
      ttl: refreshExp,
    });

    return {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
    };
  }

  public async findOne(id: string) {
    return await this.userRepository.findOne({ id });
  }

  public async userTokenRefresh(token: string): Promise<TokenResponse> {
    const verifyToken: Payload = await this.verifyToken(token);

    const generateToken = await this.generateToken(verifyToken.sub);

    await this.cacheManager.set(verifyToken.sub, generateToken.refresh_token, {
      ttl: 1209600,
    });

    return {
      access_token: generateToken.access_token,
      refresh_token: generateToken.refresh_token,
    };
  }

  private async verifyToken(token: string) {
    const verifyToken: Payload = await this.authService.Verify(token);
    if (verifyToken.type !== 'refresh') {
      throw new UnauthorizedException('Invalid Token Type');
    }

    if (!(await this.cacheManager.get(verifyToken.sub))) {
      throw new UnauthorizedException('Invalid Token');
    }
    return verifyToken;
  }

  private async generateToken(id: string): Promise<TokenResponse> {
    const access_token = this.authService.generateToken(id, 'access');
    const refresh_token = this.authService.generateToken(id, 'refresh');

    return {
      access_token,
      refresh_token,
    };
  }
}
