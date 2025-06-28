import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // Пример валидации пользователя по логину/паролю
  // (Можно заменить на проверку кошелька, подписи и т.п.)
  async validateUser(username: string, pass: string): Promise<any> {
    // Здесь ищем пользователя в БД
    // const user = await this.usersService.findByUsername(username);
    // if (user && user.password === pass) { return user; }
    // return null;

    // Для демонстрации — фейковый пользователь
    if (username === 'test' && pass === '123') {
      return { userId: 1, username: 'test' };
    }
    return null;
  }

  // Генерируем JWT без expiresIn
  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}



