import { Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [AuthModule, UserModule],
  providers: [EventGateway],
})
export class EventModule {}
