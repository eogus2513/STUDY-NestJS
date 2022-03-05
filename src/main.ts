import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { httpExceptionFilter } from './common/exceptions/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /* /etag
  app.getHttpAdapter().getInstance().set('etag', false);
   */

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없은 속성은 무조건 거른다.
      forbidNonWhitelisted: true, //전달하는 요청 값 중에 정의 되지 않은 값이 있으면 Error를 발생
      transform: true, //javascript 객체 -> DTO로 변환
      disableErrorMessages: false, //Error가 발생 했을 때 Error Message를 표시 여부 설정
    }),
  );
  app.useGlobalFilters(new httpExceptionFilter());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
