import { Controller, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(JwtAuthGuard)
  @Get('access')
  async checkAccess(@Request() req) {
    const userId = req.user.sub;
    const hasAccess = await this.gameService.userHasAccess(userId);

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    return { access: true };
  }
}