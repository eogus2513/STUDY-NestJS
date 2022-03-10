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

  private readonly accessExp: number = 60 * 60 * 2;
  private readonly refreshExp: number = 60 * 60 * 24 * 15;

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

    const access_token: string = this.authService.generateToken(
      id,
      'access',
      this.accessExp,
    );
    const refresh_token: string = this.authService.generateToken(
      id,
      'refresh',
      this.refreshExp,
    );

    await this.cacheManager.set(id, refresh_token, { ttl: 500 });

    return {
      access_token,
      refresh_token,
    };
  }

  public async findOne(id: string) {
    return await this.userRepository.findOne({ id });
  }
}
