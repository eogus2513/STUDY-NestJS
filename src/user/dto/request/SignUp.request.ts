import { IsNotEmpty, IsString } from 'class-validator';

export class SignUpRequest {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
