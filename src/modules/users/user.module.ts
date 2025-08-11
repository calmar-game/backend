import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import {EnergyCacheModule} from "../cash/energy-cash.module";
import {ItemsModule} from "../items/items.module";
import {InventoryEntity} from "../inventory/entity/inventory.entity";
import { JwtProviderModule } from '../jwt/jwt.module';
import { TokenService } from '../token/token.service';
import { UserTasksEntity } from './entity/user-tasks.entity';
import { CoinHistoryEntity } from './entity/coin-history.entity';
import { CaseHistoryEntity } from './entity/case-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      InventoryEntity,
      UserTasksEntity,
      CoinHistoryEntity,
      CaseHistoryEntity,
    ]), 
    JwtProviderModule,
    EnergyCacheModule,
    ItemsModule,
  ],
  controllers: [UserController],
  providers: [UserService, TokenService],
  exports: [UserService],
})
export class UserModule {}
