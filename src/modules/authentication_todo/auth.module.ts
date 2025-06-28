import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import {AuthController} from "./auth.contoller";
import {ConfigModule, ConfigService} from "@nestjs/config";

@Module({
  imports: [
    // Подключаем конфигурацию, чтобы читать .env
    ConfigModule.forRoot(),
    // Настраиваем Passport
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Асинхронная регистрация JwtModule,
    // чтобы получить секрет из ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        // Для бессрочного токена не указываем expiresIn
        signOptions: {},
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
