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
      throw new NotFoundException();
    }
    if (!(await compare(password, user.password))) {
      throw new BadRequestException();
    }

    const token = await this.generateToken(id);

    await this.cacheManager.set(token.refresh_token, token.refresh_token, {
      ttl: 500,
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
    const refreshToken: string = await this.cacheManager.get(token);

    if (!refreshToken) {
      throw new NotFoundException('Token Not Found');
    }

    const verifyToken = await this.authService.httpVerify(refreshToken);

    const generateToken = await this.generateToken(verifyToken.id);

    return {
      access_token: generateToken.access_token,
      refresh_token: generateToken.refresh_token,
    };
  }

  private async generateToken(id: string): Promise<TokenResponse> {
    const accessExp: number = 60 * 60 * 2;
    const refreshExp: number = 60 * 60 * 24 * 15;
    const access_token = this.authService.generateToken(
      id,
      'access',
      accessExp,
    );
    const refresh_token = this.authService.generateToken(
      id,
      'refresh',
      refreshExp,
    );

    return {
      access_token,
      refresh_token,
    };
  }
}
