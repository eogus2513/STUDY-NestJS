import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SignUpRequest } from './dto/request/SignUp.request';
import { SignInRequest } from './dto/request/SignIn.request';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { TokenResponse } from '../auth/dto/response/token.response';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  public async currentUser(@CurrentUser() user): Promise<User> {
    return await this.userService.currentUser(user);
  }

  @Post()
  public async signup(@Body() body: SignUpRequest): Promise<void> {
    await this.userService.signUp(body);
  }

  @HttpCode(200)
  @Post('login')
  public async login(@Body() body: SignInRequest): Promise<TokenResponse> {
    return await this.userService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  public async userTokenRefresh(
    @Headers('Refresh-Token') token: string,
  ): Promise<TokenResponse> {
    return await this.userService.userTokenRefresh(token);
  }
}
