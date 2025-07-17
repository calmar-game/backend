import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { UserModule } from '../users/user.module';

@Module({
  imports: [UserModule],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}