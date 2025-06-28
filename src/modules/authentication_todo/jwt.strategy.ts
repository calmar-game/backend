import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true, // Позволяем бессрочные токены
      secretOrKey: 'SUPER_SECRET_KEY', // Совпадает с AuthModule
    });
  }


  async validate(payload: any) {
    // payload = { username: ..., sub: ... }
    // Здесь можно дополнительно проверять пользователя в БД
    return { userId: payload.sub, username: payload.username };
  }
}
