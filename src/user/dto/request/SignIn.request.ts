import { SignUpRequest } from './SignUp.request';
import { PartialType } from '@nestjs/mapped-types';

export class SignInRequest extends PartialType(SignUpRequest) {}
