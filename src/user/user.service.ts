import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpRequest } from './dto/request/SignUp.request';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { SignInRequest } from './dto/request/SignIn.request';
import { TokenResponse } from './dto/response/Token.response';
import { AuthService } from '../auth/auth.service';
import { compare, hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly authService: AuthService,
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

    return {
      access_token: await this.authService.generateToken(id),
    };
  }

  public async findOne(id: string) {
    return await this.userRepository.findOne({ id });
  }
}
